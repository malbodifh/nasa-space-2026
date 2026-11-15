import { z } from "zod";

import { browseUrl, NISAR_COLLECTIONS, type NisarSearch } from "@/lib/nisar-remote";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

type CmrEntry = { title: string; time_start: string; links?: { href: string }[] };

function parseTitle(title: string) {
  const p = title.split("_");
  return {
    frame: `${p[5]}_${p[6]}_${p[7]}_${p[8]}`,
    pol: p[9],
    date: title.match(/_(\d{4})(\d{2})(\d{2})T\d{6}_/)?.slice(1, 4).join("-") ?? null,
  };
}

async function frameBounds(collection: string, granule: string): Promise<[number, number, number, number] | null> {
  const response = await fetch(browseUrl(collection, granule).replace(/\.png$/, ".kml"), {
    redirect: "follow",
  });
  if (!response.ok) return null;
  const kml = await response.text();
  const coords = kml.match(/<coordinates>([^<]+)<\/coordinates>/)?.[1];
  if (!coords) return null;
  const points = coords.trim().split(/\s+/).map((pair) => pair.split(",").map(Number));
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
  });
  if (!parsed.success) {
    return Response.json({ error: "Parámetros inválidos" }, { status: 400 });
  }
  const { lat, lon } = parsed.data;

  try {
    const frames = new Map<string, Map<string, NisarSearch["passes"][number]>>();
    for (const collection of NISAR_COLLECTIONS) {
      const cmr = `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=${collection.shortName}&point=${lon},${lat}&page_size=200&sort_key=start_date`;
      const response = await fetch(cmr, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`CMR respondió ${response.status}`);
      const body = (await response.json()) as { feed: { entry: CmrEntry[] } };
      for (const entry of body.feed.entry) {
        const info = parseTitle(entry.title);
        if (info.pol !== "DHDH" || !info.date) continue;
        const byDate = frames.get(info.frame) ?? new Map();
        const current = byDate.get(info.date);
        if (!current || current.status === "provisional") {
          byDate.set(info.date, {
            date: info.date,
            status: collection.status,
            collection: collection.shortName,
            granule: entry.title,
          });
        }
        frames.set(info.frame, byDate);
      }
    }

    // El cuadro con más fechas da la mejor serie de tiempo.
    const best = [...frames.entries()].sort((a, b) => b[1].size - a[1].size)[0];
    if (!best) {
      return Response.json({ data: null }, { headers: { "Cache-Control": "public, s-maxage=21600" } });
    }
    const passes = [...best[1].values()].sort((a, b) => a.date.localeCompare(b.date));

    let bounds: [number, number, number, number] | null = null;
    // Primero los validados más recientes: son los que traen el KML con las esquinas.
    const ordered = [...passes]
      .reverse()
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "validado" ? -1 : 1));
    for (const pass of ordered) {
      bounds = await frameBounds(pass.collection, pass.granule);
      if (bounds) break;
    }
    if (!bounds) throw new Error("Sin esquinas para el cuadro");

    const data: NisarSearch = { frame: best[0], bounds, passes };
    return Response.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    return Response.json(
      { error: "No pudimos consultar el catálogo de NISAR.", detail: error instanceof Error ? error.message : null },
      { status: 502 },
    );
  }
}
