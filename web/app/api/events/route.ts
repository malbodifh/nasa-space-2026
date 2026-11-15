import { z } from "zod";

import { affects } from "@/lib/alert-rules";
import { getEvents } from "@/lib/sources/overlays";
import type { DisasterAlert, EventsResponse } from "@/lib/types";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(5).max(600).default(150),
});

export async function GET(request: Request) {
  const started = Date.now();
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
    radius: url.searchParams.get("radius") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Parámetros inválidos", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const { lat, lon, radius } = parsed.data;
  const { alerts, history, fallbackSources, sources } = await getEvents({ lat, lon });
  // Un tsunami o un ciclón lejano puede afectar igual: las reglas por amenaza mandan sobre el radio.
  const near = (alert: DisasterAlert) => alert.distanceKm <= radius || affects(alert);

  const body: EventsResponse = {
    data: { alerts: alerts.filter(near), history: history.filter((alert) => alert.distanceKm <= radius) },
    meta: {
      cached: false,
      updatedAt: new Date().toISOString(),
      fallback: fallbackSources.length > 0,
      fallbackSources,
      sources,
      durationMs: Date.now() - started,
    },
  };

  return Response.json(body, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
