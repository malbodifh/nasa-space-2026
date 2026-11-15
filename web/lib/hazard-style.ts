/**
 * Color de cada tipo de desastre y radios de proximidad (rojo y amarillo) de las amenazas activas.
 * Los radios son estimaciones simples de cercanía, no zonas oficiales ni áreas de afectación.
 */
import { isOngoing } from "@/lib/alert-rules";
import type { AlertLevel } from "@/lib/types";

export type Hazard =
  | "sismo"
  | "tsunami"
  | "volcan"
  | "inundacion"
  | "ciclon"
  | "lluvia"
  | "deslizamiento"
  | "incendio"
  | "radar"
  | "otro";

export const HAZARD_STYLE: Record<Hazard, { label: string; color: string }> = {
  sismo: { label: "Sismo", color: "#8B5A2B" },
  tsunami: { label: "Tsunami", color: "#1F5FA6" },
  volcan: { label: "Volcán", color: "#E8590C" },
  inundacion: { label: "Inundación", color: "#0E9F9A" },
  ciclon: { label: "Ciclón o tormenta", color: "#6D28D9" },
  lluvia: { label: "Lluvia fuerte", color: "#38BDF8" },
  deslizamiento: { label: "Deslizamiento", color: "#CA8A04" },
  incendio: { label: "Incendio", color: "#F97316" },
  radar: { label: "Diferencia visual de radar", color: "#5266EB" },
  otro: { label: "Otro", color: "#8A8F9E" },
};

/** Orden fijo de la leyenda. */
export const HAZARD_ORDER: Hazard[] = [
  "sismo",
  "tsunami",
  "volcan",
  "inundacion",
  "ciclon",
  "lluvia",
  "deslizamiento",
  "incendio",
  "radar",
  "otro",
];

const BY_CATEGORY: Record<string, Hazard> = {
  earthquakes: "sismo",
  EQ: "sismo",
  tsunami: "tsunami",
  volcanoes: "volcan",
  VO: "volcan",
  floods: "inundacion",
  FL: "inundacion",
  severeStorms: "ciclon",
  TC: "ciclon",
  heavyRain: "lluvia",
  landslides: "deslizamiento",
  wildfires: "incendio",
  WF: "incendio",
  radar: "radar",
};

export function hazardOf(category: string): Hazard {
  return BY_CATEGORY[category] ?? "otro";
}

export function hazardColor(category: string): string {
  return HAZARD_STYLE[hazardOf(category)].color;
}

export type ZoneInput = {
  category: string;
  source: string;
  level: AlertLevel;
  date: string;
  title: string;
  magnitudeValue?: number;
};

export type Zones = { red: number; yellow: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (km: number) => (km < 10 ? Math.round(km * 10) / 10 : Math.round(km));

/**
 * Techo visual de los radios: con encuadres de cientos de kilómetros, un círculo mayor tapaba el
 * mapa y se leía como área afectada. Es una decisión de presentación, no un cálculo de amenaza.
 */
export const YELLOW_MAX = 150;
const RED_MAX = 50;

/** Magnitud del sismo: la numérica o la que viene en el título («M 4.5 · …»). */
function magnitudeOf(input: ZoneInput): number | null {
  if (Number.isFinite(input.magnitudeValue)) return input.magnitudeValue as number;
  const match = input.title.match(/M\s*(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : null;
}

/**
 * Radios de proximidad en km (rojo = más cerca, amarillo = menos cerca) de una amenaza en curso.
 * No representan el área real de afectación: son una ayuda visual para ordenar la cercanía.
 * Devuelve null si el evento no está ocurriendo en este momento o si no tiene radio (detecciones
 * de radar, avisos informativos). Un radio de 0 significa que no hay radio rojo.
 *
 * - Sismo: aproximación magnitud–distancia para sismos superficiales; no es un mapa de sacudida.
 * - Volcán: 5 km alrededor del cráter y 15 km de referencia por ceniza y lahares.
 * - Tsunami: sin círculos; un epicentro no determina qué costas están amenazadas.
 * - Ciclón: 100/300 km si es huracán; 50/200 km si es tormenta o depresión.
 */
export function alertZones(input: ZoneInput, now = Date.now()): Zones | null {
  if (!isOngoing(input, now)) return null;
  const hazard = hazardOf(input.category);
  switch (hazard) {
    case "sismo": {
      const m = magnitudeOf(input);
      if (m === null) return null;
      return {
        red: round(clamp(10 ** (0.45 * m - 1.1), 1, RED_MAX)),
        yellow: round(clamp(10 ** (0.45 * m - 0.3), 5, YELLOW_MAX)),
      };
    }
    case "volcan":
      return { red: 5, yellow: 15 };
    case "tsunami":
      return null;
    case "ciclon":
      return /hurac/i.test(input.title) ? { red: 60, yellow: 150 } : { red: 40, yellow: 100 };
    case "inundacion":
      return { red: 10, yellow: 30 };
    case "lluvia":
      return input.level === "orange" ? { red: 10, yellow: 25 } : { red: 0, yellow: 25 };
    case "deslizamiento":
      return { red: 2, yellow: 5 };
    case "radar":
      return null;
    default:
      return { red: 5, yellow: 20 };
  }
}
