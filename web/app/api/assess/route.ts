import { z } from "zod";

import { responseMeta } from "@/app/api/_lib/meta";
import { latitude, longitude, queryValues, radius as radiusSchema } from "@/app/api/_lib/query";
import { withCacheTracking, withTimeout } from "@/lib/cache";
import { DEFAULT_MEMORY_DATE, todayISO } from "@/lib/demo";
import { assessRisk, emptyFireStats } from "@/lib/risk";
import { getFireStats } from "@/lib/sources/gibs";
import { getClimate } from "@/lib/sources/power";
import type { AssessResponse, ClimateStats, FireStats } from "@/lib/types";


const querySchema = z.object({
  lat: latitude,
  lon: longitude,
  radius: radiusSchema(100, "50"),
  date: z.iso.date().optional(),
});

export async function GET(request: Request) {
  const started = Date.now();
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(queryValues(url.searchParams));

  if (!parsed.success) {
    return Response.json(
      { error: "Parámetros inválidos", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lat, lon, radius, date } = parsed.data;
  const point = { lat, lon };
  const today = todayISO();
  const memoryDate = date ?? DEFAULT_MEMORY_DATE;

  const { value: results, cached, stale } = await withCacheTracking(() => Promise.allSettled([
    withTimeout(getFireStats(point, radius, today), 6_000),
    withTimeout(memoryDate === today
      ? getFireStats(point, radius, today)
      : getFireStats(point, radius, memoryDate), 6_000),
    withTimeout(getClimate(point), 6_000),
  ]));
  const [currentResult, memoryResult, climateResult] = results;

  const current: FireStats =
    currentResult.status === "fulfilled" ? currentResult.value : emptyFireStats(today);
  const memory: FireStats =
    memoryResult.status === "fulfilled" ? memoryResult.value : emptyFireStats(memoryDate);
  const climate: ClimateStats | null =
    climateResult.status === "fulfilled" ? climateResult.value : null;

  const body: AssessResponse = {
    data: {
      current,
      memory,
      climate,
      risk: assessRisk(current, climate, radius),
    },
    meta: {
      ...responseMeta(started, [
        ...current.points.map((point) => point.date),
        ...memory.points.map((point) => point.date),
        climate?.lastDate,
      ], !current.available || !memory.available || !climate ||
        current.fallback || memory.fallback || climate.fallback || stale, cached),
    },
  };

  return Response.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
