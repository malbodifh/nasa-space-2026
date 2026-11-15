import { z } from "zod";

import { responseMeta } from "@/app/api/_lib/meta";
import { latitude, longitude, queryValues, radius as radiusSchema } from "@/app/api/_lib/query";
import { buildAlerts, buildTestAlert } from "@/lib/alerts";
import { withCacheTracking } from "@/lib/cache";
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
  lat: latitude,
  lon: longitude,
  radius: radiusSchema(100, "50"),
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
  const parsed = querySchema.safeParse(queryValues(url.searchParams));

  if (!parsed.success) {
    return Response.json(
      { error: "Parámetros inválidos", detail: parsed.error.issues },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { lat, lon, radius, test, hazard } = parsed.data;
  const point = { lat, lon };
  if (test) {
    const now = new Date();
    const body: AlertsResponse = {
      data: {
        alerts: [buildTestAlert(point, radius, hazard, now)],
        generatedAt: now.toISOString(),
        point,
        radiusKm: radius,
      },
      meta: {
        ...responseMeta(started, [], false),
        fallbackSources: [],
      },
    };
    // Simulación aislada: no consulta fuentes ni mezcla avisos reales con el DEMO.
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  }
  const today = todayISO();

  const { value: results, cached, stale } = await withCacheTracking(() => Promise.allSettled([
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
      fallbackSources: ["osm", "eonet", "gdacs", "seismic"],
    }),
  ]));
  const [fireResult, climateResult, overlayResult] = results;

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
          fallback: true,
        };

  const climate: ClimateStats | null =
    climateResult.status === "fulfilled" ? climateResult.value : null;

  const overlays = overlayResult.status === "fulfilled" ? overlayResult.value.data : null;
  const fallbackSources =
    overlayResult.status === "fulfilled"
      ? [...overlayResult.value.fallbackSources]
      : ["osm", "eonet", "gdacs", "seismic"];
  if (!current.available || current.fallback) fallbackSources.push("gibs");
  if (!climate || climate.fallback) fallbackSources.push("power");

  const risk = assessRisk(current, climate, radius);
  const alerts: AppAlert[] = buildAlerts({
    radiusKm: radius,
    current,
    risk,
    official: overlays?.alerts ?? [],
  });

  const body: AlertsResponse = {
    data: {
      alerts,
      generatedAt: new Date().toISOString(),
      point,
      radiusKm: radius,
    },
    meta: {
      ...responseMeta(started, [
        ...current.points.map((point) => point.date),
        climate?.lastDate,
        ...(overlays?.alerts.map((alert) => alert.date) ?? []),
      ], fallbackSources.length > 0 || stale, cached),
      fallbackSources,
    },
  };

  return Response.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
