import { z } from "zod";

import { fail, linksStore, ok, parse } from "@/lib/links/api";
import { approx, authenticate, credentialsSchema } from "@/lib/links/auth";

const schema = z.object({
  device: credentialsSchema,
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  lang: z.enum(["es", "en"]).default("en"),
});

/** Actualiza la zona aproximada del dispositivo para que sus seres queridos sepan si está en riesgo. */
export async function POST(request: Request) {
  const store = linksStore();
  if (store instanceof Response) return store;
  const body = await parse(request, schema);
  if (!body) return fail(400, "Datos inválidos");
  const device = await authenticate(store, body.device);
  if (!device) return fail(403, "Dispositivo no reconocido");
  await store.saveDevice({ ...device, lat: approx(body.lat), lon: approx(body.lon), lang: body.lang });
  return ok({ ok: true });
}
