import "server-only";

import fallback from "@/data/demo-climate.json";
import { cached } from "@/lib/cache";
import { DEMO_POINT } from "@/lib/demo";
import { distanceKm } from "@/lib/geo";
import { computeClimate } from "@/lib/stats";
import type { ClimateStats, DailySeries, LatLon } from "@/lib/types";

const POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

function numberOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > -900 ? n : null;
}

function isoDate(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function parseSeries(payload: unknown): DailySeries[] {
  const parameter = (payload as { properties?: { parameter?: Record<string, Record<string, unknown>> } })
    ?.properties?.parameter;
  if (!parameter?.PRECTOTCORR) return [];

  const dates = Object.keys(parameter.PRECTOTCORR);
  const series: DailySeries[] = [];

  for (const date of dates) {
    const precip = numberOrNull(parameter.PRECTOTCORR[date]);
    if (precip === null) continue;
    series.push({
      date: isoDate(date),
      precip,
      tMax: numberOrNull(parameter.T2M_MAX?.[date]) ?? undefined,
      rh: numberOrNull(parameter.RH2M?.[date]) ?? undefined,
      wind: numberOrNull(parameter.WS2M?.[date]) ?? undefined,
    });
  }

  return series;
}

export async function getClimate(point: LatLon): Promise<ClimateStats> {
  const key = `power:${point.lat.toFixed(2)}:${point.lon.toFixed(2)}`;

  return cached(key, 24 * 60 * 60 * 1000, async () => {
    const end = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const url =
      `${POWER_URL}?parameters=PRECTOTCORR,T2M_MAX,RH2M,WS2M` +
      `&community=AG&longitude=${point.lon}&latitude=${point.lat}` +
      `&start=19810101&end=${end}&format=JSON`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(12_000),
        headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.1" },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`POWER ${response.status}`);

      const climate = computeClimate(parseSeries(await response.json()));
      if (!climate) throw new Error("POWER sin serie suficiente");
      return { ...climate, source: "POWER" as const, fallback: false };
    } catch (error) {
      if (distanceKm(point, DEMO_POINT) <= 30) {
        return {
          ...fallback,
          source: "POWER_FALLBACK" as const,
          fallback: true,
          years: fallback.years,
        };
      }
      throw error;
    }
  });
}
