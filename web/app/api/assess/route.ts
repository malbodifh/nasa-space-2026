import { z } from "zod";

import { DEFAULT_MEMORY_DATE, todayISO } from "@/lib/demo";
import { assessRisk, emptyFireStats } from "@/lib/risk";
import { getFireStats } from "@/lib/sources/gibs";
import { getClimate } from "@/lib/sources/power";
import type { AssessResponse, ClimateStats, FireStats } from "@/lib/types";


const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(5).max(100).default(50),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function GET(request: Request) {
  const started = Date.now();
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
    radius: url.searchParams.get("radius") ?? undefined,
    date: url.searchParams.get("date") ?? undefined,
  });

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

  const [currentResult, memoryResult, climateResult] = await Promise.allSettled([
    getFireStats(point, radius, today),
    memoryDate === today
      ? getFireStats(point, radius, today)
      : getFireStats(point, radius, memoryDate),
    getClimate(point),
  ]);

  if (
    currentResult.status === "rejected" &&
    memoryResult.status === "rejected" &&
    climateResult.status === "rejected"
  ) {
    return Response.json(
      { error: "No pudimos consultar las fuentes NASA. Reintentá en unos minutos." },
      { status: 502 },
    );
  }

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
      cached: false,
      updatedAt: new Date().toISOString(),
      fallback: current.fallback || memory.fallback || Boolean(climate?.fallback),
      durationMs: Date.now() - started,
    },
  };

  return Response.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
