import { z } from "zod";

import { responseMeta } from "@/app/api/_lib/meta";
import { latitude, longitude, queryValues, radius as radiusSchema } from "@/app/api/_lib/query";
import { withCacheTracking } from "@/lib/cache";
import { getOverlays } from "@/lib/sources/overlays";
import type { OverlaysResponse } from "@/lib/types";

const querySchema = z.strictObject({
  lat: latitude,
  lon: longitude,
  radius: radiusSchema(100, "50"),
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

  try {
    const { value: overlays, cached } = await withCacheTracking(() => getOverlays({ lat, lon }, radius));
    const { data, fallbackSources } = overlays;

    const body: OverlaysResponse = {
      data,
      meta: {
        ...responseMeta(started, [
          ...data.alerts.map((alert) => alert.date),
          ...data.seismic.map((event) => event.time),
        ], fallbackSources.length > 0, cached),
        fallbackSources,
      },
    };

    return Response.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json(
      {
        error: "No pudimos cargar las capas del mapa.",
      },
      { status: 502 },
    );
  }
}
