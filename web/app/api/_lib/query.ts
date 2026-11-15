import { z } from "zod";

// URLSearchParams.get() devuelve null; Number(null) y Number("") son 0.
// Exigir texto no vacío antes de coercionar evita inventar una ubicación.
const numeric = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .transform((value) => Number(value))
    .pipe(z.number().min(min).max(max));

export const latitude = numeric(-90, 90);
export const longitude = numeric(-180, 180);
export const radius = (max: number, defaultValue: string) =>
  z
    .string()
    .trim()
    .min(1)
    .default(defaultValue)
    .transform((value) => Number(value))
    .pipe(z.number().min(5).max(max));

export function queryValues(params: URLSearchParams): Record<string, unknown> {
  const values: Record<string, unknown> = Object.create(null);
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    // Los parámetros repetidos son ambiguos, no se elige silenciosamente el primero.
    values[key] = all.length === 1 ? all[0] : all;
  }
  return values;
}
