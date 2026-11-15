import { z } from "zod";

import { fail, linksStore, ok, parse } from "@/lib/links/api";
import { authenticate, credentialsSchema } from "@/lib/links/auth";

const schema = z.object({
  device: credentialsSchema,
  other: z.uuid(),
  /** «following»: dejar de seguir a alguien. «follower»: dejar de compartir con alguien. */
  role: z.enum(["following", "follower"]),
});

export async function POST(request: Request) {
  const store = linksStore();
  if (store instanceof Response) return store;
  const body = await parse(request, schema);
  if (!body) return fail(400, "Datos inválidos");
  const device = await authenticate(store, body.device);
  if (!device) return fail(403, "Dispositivo no reconocido");
  if (body.role === "following") await store.removeLink(device.id, body.other);
  else await store.removeLink(body.other, device.id);
  return ok({ ok: true });
}
