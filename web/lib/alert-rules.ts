/**
 * Reglas por amenaza: ¿esta alerta le afecta a alguien en este punto?
 * Son umbrales iniciales y conservadores, pensados para no saturar de avisos. No reemplazan
 * los criterios de la CNE.
 */
import type { DisasterAlert } from "@/lib/types";

export type Rule = { label: string; test: (alert: DisasterAlert) => boolean };

const serious = (alert: DisasterAlert) => alert.level === "red" || alert.level === "orange";

/** Date.parse normaliza 31 de febrero a marzo; no aceptar ese reporte como válido. */
export function reportTime(value: string): number {
  const date = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (date) {
    const calendar = new Date(`${date}T00:00:00Z`);
    if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== date) {
      return Number.NaN;
    }
  }
  return Date.parse(value);
}

export const RULES: Record<string, Rule> = {
  earthquakes: {
    label: "M4+ a < 50 km, M5+ a < 150 km, M6,5+ a < 400 km, o sentido a < 60 km",
    test: (alert) => {
      const m = alert.magnitudeValue ?? 0;
      const d = alert.distanceKm;
      return (
        (m >= 4 && d <= 50) ||
        (m >= 5 && d <= 150) ||
        (m >= 6.5 && d <= 400) ||
        (Boolean(alert.felt) && d <= 60)
      );
    },
  },
  tsunami: {
    label: "Vigilancia, aviso o advertencia del centro de alerta",
    test: (alert) => serious(alert),
  },
  severeStorms: {
    label: "Ciclón a < 500 km, o con alerta naranja o roja",
    test: (alert) => alert.distanceKm <= 500 || serious(alert),
  },
  wildfires: {
    label: "Fuego activo a < 25 km",
    test: (alert) => alert.distanceKm <= 25,
  },
  volcanoes: {
    label: "Volcán activo a < 30 km",
    test: (alert) => alert.distanceKm <= 30,
  },
  floods: {
    label: "Inundación a < 50 km, o con alerta naranja o roja a < 150 km",
    test: (alert) => alert.distanceKm <= 50 || (serious(alert) && alert.distanceKm <= 150),
  },
  heavyRain: {
    label: "Lluvia ≥ 50 mm pronosticada en su punto",
    test: () => true,
  },
};

const DEFAULT_RULE: Rule = {
  label: "A < 50 km, o con alerta naranja o roja a < 300 km",
  test: (alert) => alert.distanceKm <= 50 || (serious(alert) && alert.distanceKm <= 300),
};

/** GDACS usa códigos de dos letras. */
const ALIASES: Record<string, string> = { EQ: "earthquakes", TC: "severeStorms", FL: "floods", VO: "volcanoes", WF: "wildfires" };

export function ruleFor(category: string): Rule {
  return RULES[ALIASES[category] ?? category] ?? DEFAULT_RULE;
}

/**
 * Vigencia por amenaza, en horas desde el último reporte. Pasado ese tiempo, la alerta deja
 * de estar activa y se va al historial.
 */
export const MAX_AGE_HOURS: Record<string, number> = {
  earthquakes: 72,
  volcanoes: 30 * 24,
  wildfires: 7 * 24,
  floods: 7 * 24,
  severeStorms: 7 * 24,
  tsunami: 24,
  heavyRain: 24,
};

const DEFAULT_MAX_AGE_HOURS = 7 * 24;

export function maxAgeHours(alert: { category: string; source: string }): number {
  // FIRMS: un foco de calor de ayer ya no dice nada del fuego de hoy.
  if (alert.source === "NASA FIRMS") return 24;
  // El NHC solo publica ciclones activos: si aparece, está vigente.
  if (alert.source === "NHC") return Number.POSITIVE_INFINITY;
  const category = ALIASES[alert.category] ?? alert.category;
  return MAX_AGE_HOURS[category] ?? DEFAULT_MAX_AGE_HOURS;
}

/**
 * Separa las alertas vigentes de las vencidas. Las vencidas pasan al historial con una nota;
 * los focos de calor viejos se descartan, porque no son eventos sino detecciones.
 */
export function partitionCurrent(
  alerts: DisasterAlert[],
  now = Date.now(),
): { current: DisasterAlert[]; stale: DisasterAlert[] } {
  const current: DisasterAlert[] = [];
  const stale: DisasterAlert[] = [];
  for (const alert of alerts) {
    if (isCurrent(alert, now)) current.push(alert);
    else if (alert.source !== "NASA FIRMS") {
      stale.push({
        ...alert,
        detail: Number.isFinite(reportTime(alert.date))
          ? alert.detail ?? "Sin reportes nuevos desde esta fecha."
          : "Fecha del reporte desconocida; no se considera una alerta vigente.",
      });
    }
  }
  return { current, stale };
}

/**
 * «En curso»: el evento está ocurriendo en este momento (no solo «reciente»). Horas desde el
 * último reporte durante las que se considera en curso:
 * - Sismo: 1 h (la sacudida es instantánea; la primera hora concentra réplicas y daños).
 * - Tsunami: 12 h desde el boletín de vigilancia, aviso o advertencia.
 * - Volcán, deslizamiento: 24 h desde el último reporte de actividad.
 * - Inundación o tormenta: 48 h desde la última actualización.
 * - Ciclón del NHC y lluvia pronosticada: mientras la fuente los publique.
 */
export const ONGOING_HOURS: Record<string, number> = {
  earthquakes: 1,
  tsunami: 12,
  volcanoes: 24,
  landslides: 24,
  floods: 48,
  severeStorms: 48,
};

export function isOngoing(
  alert: { category: string; source: string; date: string; level?: string },
  now = Date.now(),
): boolean {
  const reported = reportTime(alert.date);
  if (!Number.isFinite(reported) || reported > now) return false;
  if (alert.source === "NHC" || alert.source === "Open-Meteo") return true;
  const category = ALIASES[alert.category] ?? alert.category;
  // Un boletín de tsunami solo informativo no es una amenaza en curso.
  if (category === "tsunami" && alert.level !== "red" && alert.level !== "orange") return false;
  return now - reported <= (ONGOING_HOURS[category] ?? 24) * 3_600_000;
}

/** ¿El archivo de una fuente se generó hace más de `maxHours`? Sin fecha, no se puede saber. */
export function feedIsStale(generatedAt: string | null, maxHours: number, now = Date.now()): boolean {
  if (!generatedAt) return false;
  const at = Date.parse(generatedAt);
  return Number.isFinite(at) && now - at > maxHours * 3_600_000;
}

/** ¿El último reporte es lo bastante reciente para seguir contando como alerta activa? */
export function isCurrent(alert: { category: string; source: string; date: string }, now = Date.now()): boolean {
  const reported = reportTime(alert.date);
  if (!Number.isFinite(reported) || reported > now) return false;
  return now - reported <= maxAgeHours(alert) * 3_600_000;
}

export function affects(alert: DisasterAlert): boolean {
  return ruleFor(alert.category).test(alert);
}
