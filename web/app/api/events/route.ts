import { z } from "zod";

import { responseMeta } from "@/app/api/_lib/meta";
import { withCacheTracking } from "@/lib/cache";
import { latitude, longitude, queryValues, radius as radiusSchema } from "@/app/api/_lib/query";
import { affects } from "@/lib/alert-rules";
import { getEvents } from "@/lib/sources/overlays";
import type { DisasterAlert, EventsResponse } from "@/lib/types";

const querySchema = z.strictObject({
  lat: latitude,
  lon: longitude,
  radius: radiusSchema(600, "150"),
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

  const { lat, lon, radius } = parsed.data;
  const { value: events, cached, stale } = await withCacheTracking(() => getEvents({ lat, lon }));
  const { alerts, history, fallbackSources, sources } = events;
  // Un tsunami o un ciclón lejano puede afectar igual: las reglas por amenaza mandan sobre el radio.
  const near = (alert: DisasterAlert) => alert.distanceKm <= radius || affects(alert);
  const visibleAlerts = alerts.filter(near);
  const visibleHistory = history.filter((alert) => alert.distanceKm <= radius);
  const sourceNames: Record<string, string> = {
    eonet: "NASA EONET", "eonet-historial": "NASA EONET", gdacs: "GDACS",
    ptwc: "PTWC", nhc: "NHC", rain: "Open-Meteo", firms: "NASA FIRMS",
    usgs: "USGS", ovsicori: "OVSICORI", rsn: "RSN",
  };
  const visibleSources = sources.map((source) => ({
    ...source,
    visibleCount: [...visibleAlerts, ...visibleHistory].filter((alert) =>
      alert.source === sourceNames[source.id] || alert.alsoReportedBy?.includes(sourceNames[source.id]),
    ).length,
  }));

  const body: EventsResponse = {
    data: { alerts: visibleAlerts, history: visibleHistory },
    meta: {
      ...responseMeta(started, sources.map((source) => source.latest), fallbackSources.length > 0 || stale, cached),
      fallbackSources,
      sources: visibleSources,
    },
  };

  return Response.json(body, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
