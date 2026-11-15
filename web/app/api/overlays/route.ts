import { z } from "zod";

import { getOverlays } from "@/lib/sources/overlays";
import type { OverlaysResponse } from "@/lib/types";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(5).max(100).default(50),
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

  try {
    const { data, fallbackSources } = await getOverlays({ lat, lon }, radius);

    const body: OverlaysResponse = {
      data,
      meta: {
        cached: false,
        updatedAt: new Date().toISOString(),
        fallback: fallbackSources.length > 0,
        fallbackSources,
        durationMs: Date.now() - started,
      },
    };

    return Response.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "No pudimos cargar las capas del mapa.",
        detail: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 502 },
    );
  }
}
