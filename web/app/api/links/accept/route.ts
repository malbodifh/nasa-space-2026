import { z } from "zod";

import { fail, linksStore, ok, parse } from "@/lib/links/api";
import { approx, authenticate, credentialsSchema, sha256 } from "@/lib/links/auth";

const schema = z.object({
  device: credentialsSchema,
  code: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  lang: z.enum(["es", "en"]).default("es"),
  /** El invitado también quiere avisos cuando quien invita esté en riesgo. */
  reciprocal: z.boolean().default(false),
});

/**
 * El invitado acepta: comparte su zona aproximada y quien lo invitó pasa a recibir avisos cuando
 * esté en riesgo. La invitación se borra al usarse.
 */
export async function POST(request: Request) {
  const store = linksStore();
  if (store instanceof Response) return store;
  const body = await parse(request, schema);
  if (!body) return fail(400, "Datos inválidos");
  const device = await authenticate(store, body.device, { create: true, lang: body.lang });
  if (!device) return fail(403, "Dispositivo no reconocido");

  const codeHash = sha256(body.code);
  const preview = await store.getInvite(codeHash);
  if (!preview || Date.parse(preview.expiresAt) < Date.now()) return fail(410, "La invitación venció o ya se usó");
  if (preview.inviter === device.id) return fail(400, "No puede aceptar su propia invitación");
  const invite = await store.takeInvite(codeHash);
  if (!invite) return fail(410, "La invitación venció o ya se usó");

  await store.saveDevice({ ...device, lat: approx(body.lat), lon: approx(body.lon), lang: body.lang });
  await store.addLink({ follower: invite.inviter, followed: device.id, alias: invite.alias, followerName: invite.inviterName });
  if (body.reciprocal) {
    // Quien invita ya le puso nombre a esta persona: se usa para mostrarle quién lo sigue.
    await store.addLink({ follower: device.id, followed: invite.inviter, alias: invite.inviterName, followerName: invite.alias });
  }
  return ok({ inviterName: invite.inviterName, reciprocal: body.reciprocal });
}
