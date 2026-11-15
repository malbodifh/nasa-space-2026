import { z } from "zod";

import { latitude, longitude, queryValues } from "@/app/api/_lib/query";
import { fetchLimited } from "@/app/api/_lib/remote";
import { browseUrl, GRANULE_PATTERN, NISAR_COLLECTIONS, type NisarSearch } from "@/lib/nisar-remote";

const querySchema = z.strictObject({
  lat: latitude,
  lon: longitude,
});

type CmrEntry = { title: string; time_start: string; links?: { href: string }[] };

function parseTitle(title: string) {
  if (typeof title !== "string" || !GRANULE_PATTERN.test(title)) return null;
  const p = title.split("_");
  if (p.length < 12) return null;
  const date = title.match(/_(\d{4})(\d{2})(\d{2})T\d{6}_/)?.slice(1, 4).join("-");
  if (!date || !z.iso.date().safeParse(date).success) return null;
  return {
    frame: `${p[5]}_${p[6]}_${p[7]}_${p[8]}`,
    pol: p[9],
    date,
  };
}

async function frameBounds(collection: string, granule: string): Promise<[number, number, number, number] | null> {
  if (!GRANULE_PATTERN.test(granule)) return null;
  const result = await fetchLimited(browseUrl(collection, granule).replace(/\.png$/, ".kml"), 256 * 1024);
  if (result.status !== 200) return null;
  const kml = new TextDecoder().decode(result.bytes);
  const coords = kml.match(/<coordinates>([^<]+)<\/coordinates>/)?.[1];
  if (!coords) return null;
  const points = coords.trim().split(/\s+/).map((pair) => pair.split(",").map(Number));
  if (points.length < 4 || points.some((p) =>
    !Number.isFinite(p[0]) || !Number.isFinite(p[1]) ||
    Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90
  )) return null;
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(queryValues(url.searchParams));
  if (!parsed.success) {
    return Response.json({ error: "Parámetros inválidos" }, { status: 400 });
  }
  const { lat, lon } = parsed.data;

  try {
    const frames = new Map<string, Map<string, NisarSearch["passes"][number]>>();
    const catalogs = await Promise.allSettled(NISAR_COLLECTIONS.map(async (collection) => {
      const cmr = `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=${collection.shortName}&point=${lon},${lat}&page_size=200&sort_key=start_date`;
      const response = await fetchLimited(cmr, 2 * 1024 * 1024, 6_000);
      if (response.status !== 200) throw new Error("CMR sin respuesta");
      const body = JSON.parse(new TextDecoder().decode(response.bytes)) as { feed?: { entry?: CmrEntry[] } };
      if (!Array.isArray(body.feed?.entry)) throw new Error("CMR devolvió un catálogo inválido");
      return body.feed.entry;
    }));
    const fallbackCollections = NISAR_COLLECTIONS
      .filter((_, index) => catalogs[index].status === "rejected")
      .map((collection) => collection.shortName);
    if (catalogs.every((result) => result.status === "rejected")) throw new Error("CMR sin respuesta");
    for (const [index, result] of catalogs.entries()) {
      if (result.status === "rejected") continue;
      const collection = NISAR_COLLECTIONS[index];
      for (const entry of result.value) {
        const info = parseTitle(entry.title);
        if (!info || info.pol !== "DHDH") continue;
        const byDate = frames.get(info.frame) ?? new Map();
        const current = byDate.get(info.date);
        if (!current || (current.status === "provisional" && collection.status === "validado")) {
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
      return Response.json(
        { data: null, meta: {
          reason: fallbackCollections.length ? "catalogo-parcial" : "sin-pasadas",
          ...(fallbackCollections.length ? { fallback: true, fallbackCollections } : {}),
        } },
        { headers: { "Cache-Control": fallbackCollections.length ? "no-store" : "public, s-maxage=21600" } },
      );
    }
    const passes = [...best[1].values()].sort((a, b) => a.date.localeCompare(b.date));

    let bounds: [number, number, number, number] | null = null;
    // Primero los validados más recientes: son los que traen el KML con las esquinas.
    const ordered = [...passes]
      .reverse()
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "validado" ? -1 : 1));
    const candidates = await Promise.allSettled(
      ordered.slice(0, 3).map((pass) => frameBounds(pass.collection, pass.granule)),
    );
    bounds = candidates.flatMap((candidate) =>
      candidate.status === "fulfilled" && candidate.value ? [candidate.value] : [],
    ).find((candidate) =>
      lon >= candidate[0] && lon <= candidate[2] && lat >= candidate[1] && lat <= candidate[3],
    ) ?? null;
    if (!bounds) throw new Error("Sin esquinas para el cuadro");

    const data: NisarSearch = { frame: best[0], bounds, passes };
    return Response.json(
      { data, meta: { fallback: fallbackCollections.length > 0, fallbackCollections } },
      { headers: { "Cache-Control": fallbackCollections.length
        ? "no-store" : "public, s-maxage=21600, stale-while-revalidate=86400" } },
    );
  } catch {
    return Response.json(
      { error: "No pudimos consultar el catálogo de NISAR." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
