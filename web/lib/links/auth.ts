import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import type { Device, LinksStore } from "@/lib/links/store";

/** Id y clave secreta que cada teléfono genera y guarda; la clave nunca se guarda en el servidor. */
export const credentialsSchema = z.object({
  id: z.uuid(),
  key: z.string().regex(/^[A-Za-z0-9_-]{32,64}$/),
});
export type Credentials = z.infer<typeof credentialsSchema>;

export const nameSchema = z.string().trim().min(1).max(40);

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Código de invitación aleatorio (128 bits), seguro para una URL. */
export function newInviteCode(): string {
  return randomBytes(16).toString("base64url");
}

/** Zona aproximada (~1 km): es lo único que se guarda de la ubicación. */
export function approx(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Comprueba la clave del dispositivo. Con `create`, un dispositivo nuevo se registra la primera
 * vez que hace algo con seres queridos. Devuelve null si la clave no coincide.
 */
export async function authenticate(
  store: LinksStore,
  credentials: Credentials,
  options: { create?: boolean; lang?: "es" | "en" } = {},
): Promise<Device | null> {
  const hash = sha256(credentials.key);
  const device = await store.getDevice(credentials.id);
  if (!device) {
    if (!options.create) return null;
    const created: Device = { id: credentials.id, keyHash: hash, lat: null, lon: null, lang: options.lang ?? "en" };
    await store.saveDevice(created);
    return created;
  }
  const given = Buffer.from(hash);
  const expected = Buffer.from(device.keyHash);
  return given.length === expected.length && timingSafeEqual(given, expected) ? device : null;
}
