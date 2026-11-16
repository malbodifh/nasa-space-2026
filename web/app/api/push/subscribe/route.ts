import { z } from "zod";

import { authenticate, credentialsSchema } from "@/lib/links/auth";
import { getLinksStore } from "@/lib/links/store";
import { getPushStore } from "@/lib/push/store";
import { pushConfigured } from "@/lib/push/send";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.url().max(1024).refine((value) => value.startsWith("https://"), "Debe ser https"),
    keys: z.object({ p256dh: z.string().min(10).max(256), auth: z.string().min(10).max(128) }),
  }),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  lang: z.enum(["es", "en"]).default("en"),
  /** Dispositivo con seres queridos: así el envío sabe a quién avisar por ellos. */
  device: credentialsSchema.optional(),
});


const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!pushConfigured()) return Response.json({ error: "Los avisos push no están configurados." }, { status: 503, headers: NO_STORE });
  const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Suscripción inválida" }, { status: 400, headers: NO_STORE });
  const store = getPushStore();
  if (!store.persistent && process.env.NODE_ENV === "production") {
    return Response.json({ error: "Falta la base de datos de suscripciones." }, { status: 503, headers: NO_STORE });
  }

  const { subscription, lat, lon, lang, device } = parsed.data;
  // Una clave que no coincide no impide la suscripción: solo no se vincula al dispositivo.
  const owner = device ? await authenticate(getLinksStore(), device).catch(() => null) : null;
  // Solo se guarda una ubicación aproximada (~1 km), nunca la exacta.
  await store.upsert({
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    lat: Math.round(lat * 100) / 100,
    lon: Math.round(lon * 100) / 100,
    lang,
    deviceId: owner?.id ?? null,
  });
  return Response.json({ ok: true }, { headers: NO_STORE });
}

