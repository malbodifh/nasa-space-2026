import "server-only";

import { cached } from "@/lib/cache";
import volcanoesFile from "@/data/volcanoes.json";
import { filterFirms, parseNhc, parsePtwc, rainAlert } from "@/lib/feeds-parse";
import { bboxForRadius } from "@/lib/geo";
import type { DisasterAlert, LatLon } from "@/lib/types";

const USER_AGENT = "AstralCodes-MemoriaDeFuego/0.3 (prototipo NASA Space Apps)";

async function get(url: string, as: "text" | "json"): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${new URL(url).host} ${response.status}`);
  return as === "json" ? response.json() : response.text();
}

const cell = (point: LatLon) => `${point.lat}:${point.lon}`;

/** Boletines de tsunami de PTWC (PHEB) y NTWC (PAAQ). Se renuevan cada 2 min. */
export async function getTsunamiBulletins(point: LatLon): Promise<DisasterAlert[]> {
  return cached(`ptwc:${cell(point)}`, 2 * 60 * 1000, async () => {
    const feeds = await Promise.all(
      ["PHEB", "PAAQ"].map((code) => get(`https://www.tsunami.gov/events/xml/${code}Atom.xml`, "text")),
    );
    const seen = new Set<string>();
    return feeds
      .flatMap((xml, index) => parsePtwc(xml as string, point, index === 0 ? "PTWC" : "NTWC"))
      .filter((alert) => {
        const id = alert.id.slice(alert.id.indexOf(":") + 1);
        return seen.has(id) ? false : (seen.add(id), true);
      });
  });
}

/** Ciclones activos del NHC. Cada 10 min. */
export async function getStorms(point: LatLon): Promise<DisasterAlert[]> {
  return cached(`nhc:${cell(point)}`, 10 * 60 * 1000, async () =>
    parseNhc(await get("https://www.nhc.noaa.gov/CurrentStorms.json", "json"), point),
  );
}

const VOLCANOES: LatLon[] = volcanoesFile.features.map((feature) => ({
  lat: feature.geometry.coordinates[1],
  lon: feature.geometry.coordinates[0],
}));

/**
 * Posibles incendios de VIIRS (tres satélites). Se piden 5 días para reconocer fuentes de calor
 * fijas (volcanes, industria), pero solo se reporta lo de las últimas 24 h. Cada 15 min.
 */
export async function getFires(point: LatLon): Promise<DisasterAlert[]> {
  const key = process.env.FIRMS_MAP_KEY;
  if (!key) throw new Error("FIRMS_MAP_KEY no configurada");
  return cached(`firms:${cell(point)}`, 15 * 60 * 1000, async () => {
    const [west, south, east, north] = bboxForRadius(point, 300);
    const area = [west, south, east, north].map((value) => value.toFixed(2)).join(",");
    const results = await Promise.allSettled(
      ["VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT", "VIIRS_SNPP_NRT"].map((sensor) =>
        get(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${sensor}/${area}/5`, "text"),
      ),
    );
    const csvs = results.flatMap((result) => (result.status === "fulfilled" ? [result.value as string] : []));
    if (csvs.length === 0) throw new Error("FIRMS no respondió");
    // Cada CSV trae su encabezado; el lector ignora los repetidos.
    const { alerts, report } = filterFirms(csvs.map((csv) => csv.trim()).join("\n"), point, {
      volcanoes: VOLCANOES,
    });
    console.info("[firms] focos descartados", report);
    return alerts;
  });
}

/** Lluvia pronosticada en las próximas 24 h en el punto. Cada 30 min. */
export async function getRainForecast(point: LatLon): Promise<DisasterAlert[]> {
  return cached(`rain:${cell(point)}`, 30 * 60 * 1000, async () => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${point.lat.toFixed(3)}` +
      `&longitude=${point.lon.toFixed(3)}&hourly=precipitation&forecast_days=2&timezone=UTC`;
    const alert = rainAlert(await get(url, "json"), point);
    return alert ? [alert] : [];
  });
}
