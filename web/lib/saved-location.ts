/**
 * Última ubicación real (GPS) de la persona, guardada en el propio dispositivo para que la app
 * no vuelva a la ubicación de ejemplo cada vez que se cierra y se abre. Nunca sale del
 * dispositivo por aquí: el servidor solo recibe una versión aproximada cuando hace falta.
 */
import type { LatLon } from "@/lib/types";

export const LOCATION_STORAGE_KEY = "gamma:ubicacion";

function valid(value: unknown): value is LatLon {
  if (!value || typeof value !== "object") return false;
  const { lat, lon } = value as Record<string, unknown>;
  return typeof lat === "number" && typeof lon === "number" && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

export function readSavedLocation(storage: Pick<Storage, "getItem"> | null = safeStorage()): LatLon | null {
  try {
    const raw = storage?.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return valid(parsed) ? { lat: parsed.lat, lon: parsed.lon } : null;
  } catch {
    return null;
  }
}

export function saveLocation(point: LatLon, storage: Pick<Storage, "setItem"> | null = safeStorage()): void {
  try {
    // Tres decimales (~100 m) bastan para las alertas y no guardan la ubicación exacta.
    const rounded = { lat: Math.round(point.lat * 1000) / 1000, lon: Math.round(point.lon * 1000) / 1000 };
    storage?.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ ...rounded, at: new Date().toISOString() }));
  } catch {
    // Sin almacenamiento la app sigue funcionando; solo pedirá la ubicación de nuevo.
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
