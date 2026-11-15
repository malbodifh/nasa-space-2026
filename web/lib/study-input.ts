import type { LatLon } from "@/lib/types";

type Query = { get: (name: string) => string | null };

export type StudyPoint =
  | { status: "valid"; point: LatLon }
  | { status: "missing" | "invalid" };

export type StudyDate =
  | { status: "valid"; date: string | null }
  | { status: "invalid" };

/** Solo dígitos decimales o exponenciales: `Number("")`, `Number(" ")`, `null` y `"0x10"` no pasan. */
const NUMERIC = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida el punto del estudio antes de convertir a número: `Number(null)` y `Number("")` dan 0,
 * así que una coordenada ausente o vacía nunca debe aceptarse como (0, 0).
 */
export function parseStudyPoint(params: Query): StudyPoint {
  const rawLat = params.get("lat");
  const rawLon = params.get("lon");
  if (rawLat === null || rawLon === null) return { status: "missing" };

  const latText = rawLat.trim();
  const lonText = rawLon.trim();
  if (!latText || !lonText) return { status: "invalid" };
  if (!NUMERIC.test(latText) || !NUMERIC.test(lonText)) return { status: "invalid" };

  const lat = Number(latText);
  const lon = Number(lonText);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { status: "invalid" };
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return { status: "invalid" };

  return { status: "valid", point: { lat, lon } };
}

/**
 * Acepta ausencia de fecha, pero exige AAAA-MM-DD de un día real: rechaza `2026-02-31`,
 * `2026-2-1`, `no-fecha` y vacíos. Así `displayDate` nunca recibe un valor que lance RangeError.
 */
export function parseStudyDate(raw: string | null | undefined): StudyDate {
  if (raw === null || raw === undefined) return { status: "valid", date: null };
  const value = raw.trim();
  if (!value || !ISO_DATE.test(value)) return { status: "invalid" };

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { status: "invalid" };
  }
  return { status: "valid", date: value };
}

export type StudyInput =
  | { status: "valid"; point: LatLon; eventDate: string | null }
  | { status: "missing" | "invalid"; field: "coordinates" | "date" };

/** Punto + fecha de evento, listos para el estudio. */
export function parseStudyInput(params: Query): StudyInput {
  const point = parseStudyPoint(params);
  if (point.status !== "valid") {
    return { status: point.status === "missing" ? "missing" : "invalid", field: "coordinates" };
  }
  const date = parseStudyDate(params.get("fecha"));
  if (date.status !== "valid") return { status: "invalid", field: "date" };
  return { status: "valid", point: point.point, eventDate: date.date };
}

export type StudySelection = { sourceKey: string; before: number; after: number };

/** A query/source change must not reuse indexes from the previous image strip. */
export function scopedStudyPair(selection: StudySelection | null, sourceKey: string, count: number) {
  if (!selection || selection.sourceKey !== sourceKey
    || !Number.isInteger(selection.before) || !Number.isInteger(selection.after)
    || selection.before < 0 || selection.after >= count || selection.before >= selection.after) return null;
  return { before: selection.before, after: selection.after };
}
