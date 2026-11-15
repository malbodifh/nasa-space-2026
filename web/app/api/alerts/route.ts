import { z } from "zod";

import { buildAlerts, buildTestAlert, type DemoHazard } from "@/lib/alerts";
import { todayISO } from "@/lib/demo";
import { assessRisk } from "@/lib/risk";
import { getFireStats } from "@/lib/sources/gibs";
import { getOverlays } from "@/lib/sources/overlays";
import { getClimate } from "@/lib/sources/power";
import type { AppAlert, AlertsResponse, ClimateStats, FireStats } from "@/lib/types";

/** Vercel corta funciones lentas: devolvemos lo que haya dentro del presupuesto. */
async function withBudget<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(5).max(100).default(50),
  test: z
    .enum(["0", "1"])
    .default("0")
    .transform((value) => value === "1"),
  hazard: z
    .enum(["fire", "earthquake", "volcano", "flood", "storm"])
    .default("fire"),
});

export async function GET(request: Request) {
  const started = Date.now();
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
    radius: url.searchParams.get("radius") ?? undefined,
    test: url.searchParams.get("test") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Parámetros inválidos", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lat, lon, radius, test, hazard } = parsed.data;
  const point = { lat, lon };
  const today = todayISO();

  const [fireResult, climateResult, overlayResult] = await Promise.allSettled([
    withBudget(getFireStats(point, radius, today), 6_000, {
      date: today,
      count: 0,
      nearestKm: null,
      maxFrp: null,
      points: [],
      available: false,
      fallback: true,
    }),
    withBudget(getClimate(point), 4_500, null),
    withBudget(getOverlays(point, radius), 8_000, {
      data: {
        roads: { type: "FeatureCollection" as const, features: [] },
        protectedAreas: { type: "FeatureCollection" as const, features: [] },
        volcanoes: { type: "FeatureCollection" as const, features: [] },
        borders: { type: "FeatureCollection" as const, features: [] },
        alerts: [],
        seismic: [],
        sources: [],
      },
      fallbackSources: ["osm", "eonet"],
    }),
  ]);

  const current: FireStats =
    fireResult.status === "fulfilled"
      ? fireResult.value
      : {
          date: today,
          count: 0,
          nearestKm: null,
          maxFrp: null,
          points: [],
          available: false,
          fallback: false,
        };

  const climate: ClimateStats | null =
    climateResult.status === "fulfilled" ? climateResult.value : null;

  const overlays = overlayResult.status === "fulfilled" ? overlayResult.value.data : null;
  const fallbackSources =
    overlayResult.status === "fulfilled" ? overlayResult.value.fallbackSources : ["osm"];

  const risk = assessRisk(current, climate, radius);
  const alerts: AppAlert[] = buildAlerts({
    radiusKm: radius,
    current,
    risk,
    official: overlays?.alerts ?? [],
  });

  if (test) alerts.unshift(buildTestAlert(point, radius, hazard as DemoHazard));

  const body: AlertsResponse = {
    data: {
      alerts,
      generatedAt: new Date().toISOString(),
      point,
      radiusKm: radius,
    },
    meta: {
      cached: false,
      updatedAt: new Date().toISOString(),
      fallback: current.fallback || Boolean(climate?.fallback) || fallbackSources.length > 0,
      fallbackSources,
      durationMs: Date.now() - started,
    },
  };

  return Response.json(body, {
    headers: {
      "Cache-Control": test
        ? "no-store"
        : "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
