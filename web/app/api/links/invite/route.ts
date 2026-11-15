import { z } from "zod";

import { fail, INVITE_TTL_MS, linksStore, MAX_LINKS, ok, parse } from "@/lib/links/api";
import { authenticate, credentialsSchema, nameSchema, newInviteCode, sha256 } from "@/lib/links/auth";

const createSchema = z.object({
  device: credentialsSchema,
  /** Nombre de quien invita, para que el invitado sepa quién es. */
  inviterName: nameSchema,
  /** Cómo llama quien invita a su ser querido («Mamá»). */
  alias: nameSchema,
  lang: z.enum(["es", "en"]).default("es"),
});

/** Crea una invitación de un solo uso y devuelve el código que va en el link. */
export async function POST(request: Request) {
  const store = linksStore();
  if (store instanceof Response) return store;
  const body = await parse(request, createSchema);
  if (!body) return fail(400, "Datos inválidos");
  const device = await authenticate(store, body.device, { create: true, lang: body.lang });
  if (!device) return fail(403, "Dispositivo no reconocido");
  const following = (await store.linksOf(device.id)).filter((link) => link.follower === device.id);
  if (following.length >= MAX_LINKS) return fail(409, `Ya sigue a ${MAX_LINKS} seres queridos.`);

  const code = newInviteCode();
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
  await store.createInvite({ codeHash: sha256(code), inviter: device.id, inviterName: body.inviterName, alias: body.alias, expiresAt });
  return ok({ code, expiresAt });
}

/** Lo que ve el invitado antes de aceptar: solo el nombre de quien invita. */
export async function GET(request: Request) {
  const store = linksStore();
  if (store instanceof Response) return store;
  const code = new URL(request.url).searchParams.get("code") ?? "";
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(code)) return fail(404, "Invitación no encontrada");
  const invite = await store.getInvite(sha256(code));
  if (!invite || Date.parse(invite.expiresAt) < Date.now()) return fail(410, "La invitación venció o ya se usó");
  return ok({ inviterName: invite.inviterName, expiresAt: invite.expiresAt });
}
