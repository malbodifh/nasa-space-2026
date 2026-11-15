import "server-only";

import { cached, withTimeout } from "@/lib/cache";
import { bboxForRadius } from "@/lib/geo";
import { mergeSeismic, parseOvsicori, parseRsn, parseUsgs } from "@/lib/seismic-parse";
import type { LatLon, SeismicEvent } from "@/lib/types";

const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const RSN_URL = "https://rsn.ucr.ac.cr/actividad-sismica/ultimos-sismos?format=feed&type=rss";
const OVSICORI_URL =
  "https://www.ovsicori.una.ac.cr/sistemas/sismolive-staging/data/latest.geojson";
const WINDOW_DAYS = 30;
const MAX_KM = 600;
const MIN_MAGNITUDE = 2.5;

export type SeismicResult = {
  events: SeismicEvent[];
  local: number;
  global: number;
  rsn: number;
  failed: ("USGS" | "OVSICORI" | "RSN")[];
  fallback: boolean;
  /** Fecha del sismo más reciente de cada red. */
  latest: Record<"USGS" | "OVSICORI" | "RSN", string | null>;
  /** Cuándo OVSICORI generó su archivo: si es viejo, el feed se detuvo. */
  ovsicoriGeneratedAt: string | null;
};

const newest = (events: SeismicEvent[]) =>
  events.reduce<string | null>((max, event) => (!max || event.time > max ? event.time : max), null);

export async function getSeismic(point: LatLon): Promise<SeismicResult> {
  const key = `seismic:${point.lat}:${point.lon}`;

  // Los sismos cambian por minuto: caché corta.
  return cached(key, 2 * 60 * 1000, async () => {
    const [west, south, east, north] = bboxForRadius(point, MAX_KM);
    const start = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const usgsUrl =
      `${USGS_URL}?format=geojson&starttime=${start}` +
      `&minmagnitude=${MIN_MAGNITUDE}&orderby=time&limit=200` +
      `&minlatitude=${south.toFixed(3)}&maxlatitude=${north.toFixed(3)}` +
      `&minlongitude=${west.toFixed(3)}&maxlongitude=${east.toFixed(3)}`;

    const [usgs, ovsicori, rsn] = await Promise.allSettled([
      withTimeout(fetch(usgsUrl, {
        headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.2" },
        signal: AbortSignal.timeout(5_000),
        cache: "no-store",
      }).then((response) => {
        if (!response.ok) throw new Error(`USGS ${response.status}`);
        return response.json();
      }).then((payload) => parseUsgs(payload, point)), 5_500),
      withTimeout(fetch(OVSICORI_URL, {
        headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.2" },
        signal: AbortSignal.timeout(5_000),
        cache: "no-store",
      }).then((response) => {
        if (!response.ok) throw new Error(`OVSICORI ${response.status}`);
        return response.json();
      }).then((payload) => ({
        events: parseOvsicori(payload, point),
        generatedAt: typeof payload?.generatedAt === "string" && Number.isFinite(Date.parse(payload.generatedAt))
          ? payload.generatedAt as string : null,
      })), 5_500),
      withTimeout(fetch(RSN_URL, {
        headers: { "User-Agent": "Mozilla/5.0 (AstralCodes-MemoriaDeFuego/0.3)" },
        signal: AbortSignal.timeout(5_000),
        cache: "no-store",
      }).then((response) => {
        if (!response.ok) throw new Error(`RSN ${response.status}`);
        return response.text();
      }).then((xml) => parseRsn(xml, point)), 5_500),
    ]);

    const local = ovsicori.status === "fulfilled" ? ovsicori.value.events : [];
    const global = usgs.status === "fulfilled" ? usgs.value : [];
    const felt = rsn.status === "fulfilled" ? rsn.value : [];
    const failed = (
      [
        ["USGS", usgs],
        ["OVSICORI", ovsicori],
        ["RSN", rsn],
      ] as const
    )
      .filter(([, result]) => result.status === "rejected")
      .map(([name]) => name);

    return {
      // Primero la RSN (revisado y con «sentido en»), luego OVSICORI y al final USGS.
      events: mergeSeismic(felt, local, global),
      local: local.length,
      global: global.length,
      rsn: felt.length,
      failed,
      fallback: failed.length > 0,
      latest: { USGS: newest(global), OVSICORI: newest(local), RSN: newest(felt) },
      ovsicoriGeneratedAt:
        ovsicori.status === "fulfilled"
          ? ovsicori.value.generatedAt
          : null,
    };
  });
}
