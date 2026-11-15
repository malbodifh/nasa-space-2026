import "server-only";

import { cached } from "@/lib/cache";
import { bboxForRadius } from "@/lib/geo";
import { mergeSeismic, parseOvsicori, parseUsgs } from "@/lib/seismic-parse";
import type { LatLon, SeismicEvent } from "@/lib/types";

const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const OVSICORI_URL =
  "https://www.ovsicori.una.ac.cr/sistemas/sismolive-staging/data/latest.geojson";
const WINDOW_DAYS = 30;
const MAX_KM = 600;
const MIN_MAGNITUDE = 2.5;

export type SeismicResult = {
  events: SeismicEvent[];
  local: number;
  global: number;
  fallback: boolean;
};

export async function getSeismic(point: LatLon): Promise<SeismicResult> {
  const key = `seismic:${point.lat.toFixed(1)}:${point.lon.toFixed(1)}`;

  return cached(key, 10 * 60 * 1000, async () => {
    const [west, south, east, north] = bboxForRadius(point, MAX_KM);
    const start = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const usgsUrl =
      `${USGS_URL}?format=geojson&starttime=${start}` +
      `&minmagnitude=${MIN_MAGNITUDE}&orderby=time&limit=200` +
      `&minlatitude=${south.toFixed(3)}&maxlatitude=${north.toFixed(3)}` +
      `&minlongitude=${west.toFixed(3)}&maxlongitude=${east.toFixed(3)}`;

    const [usgs, ovsicori] = await Promise.allSettled([
      fetch(usgsUrl, {
        headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.2" },
        signal: AbortSignal.timeout(12_000),
        cache: "no-store",
      }).then((response) => {
        if (!response.ok) throw new Error(`USGS ${response.status}`);
        return response.json();
      }),
      fetch(OVSICORI_URL, {
        headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.2" },
        signal: AbortSignal.timeout(12_000),
        cache: "no-store",
      }).then((response) => {
        if (!response.ok) throw new Error(`OVSICORI ${response.status}`);
        return response.json();
      }),
    ]);

    const local = ovsicori.status === "fulfilled" ? parseOvsicori(ovsicori.value, point) : [];
    const global = usgs.status === "fulfilled" ? parseUsgs(usgs.value, point) : [];

    return {
      events: mergeSeismic(local, global),
      local: local.length,
      global: global.length,
      fallback: ovsicori.status === "rejected" || usgs.status === "rejected",
    };
  });
}
