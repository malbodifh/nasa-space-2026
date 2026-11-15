import "server-only";

import type { z } from "zod";

import { getLinksStore, type LinksStore } from "@/lib/links/store";

const NO_STORE = { "Cache-Control": "no-store" };

export function ok(body: unknown): Response {
  return Response.json(body, { headers: NO_STORE });
}

export function fail(status: number, error: string): Response {
  return Response.json({ error }, { status, headers: NO_STORE });
}

/** Almacén listo para usar o la respuesta de error si en producción falta la base de datos. */
export function linksStore(): LinksStore | Response {
  const store = getLinksStore();
  if (!store.persistent && process.env.NODE_ENV === "production") return fail(503, "Falta la base de datos de vínculos.");
  return store;
}

export async function parse<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T> | null> {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

/** Máximo de seres queridos que una persona puede seguir. */
export const MAX_LINKS = 10;
/** Una invitación vence a las 48 horas. */
export const INVITE_TTL_MS = 48 * 60 * 60 * 1000;
