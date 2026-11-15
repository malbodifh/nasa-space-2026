export type DemoLocation = {
  id: string;
  label: string;
  region: string;
  lat: number;
  lon: number;
  radiusKm: number;
};

/**
 * Ubicaciones de demostración en Costa Rica. El hazard del MVP sigue siendo
 * incendios: las fechas de memoria salen de detecciones reales de GIBS.
 */
export const LOCATIONS: DemoLocation[] = [
  { id: "liberia", label: "Liberia", region: "Guanacaste", lat: 10.635, lon: -85.4377, radiusKm: 25 },
  { id: "san-jose", label: "San José", region: "Valle Central", lat: 9.9325, lon: -84.0796, radiusKm: 25 },
  { id: "alajuela", label: "Alajuela", region: "Valle Central", lat: 10.0162, lon: -84.2116, radiusKm: 25 },
  { id: "cartago", label: "Cartago", region: "Valle Central", lat: 9.8644, lon: -83.9194, radiusKm: 25 },
  { id: "la-fortuna", label: "La Fortuna", region: "Arenal", lat: 10.471, lon: -84.645, radiusKm: 25 },
  { id: "puntarenas", label: "Puntarenas", region: "Pacífico Central", lat: 9.976, lon: -84.838, radiusKm: 25 },
  { id: "quepos", label: "Quepos", region: "Pacífico Central", lat: 9.431, lon: -84.162, radiusKm: 25 },
  { id: "limon", label: "Limón", region: "Caribe", lat: 9.991, lon: -83.036, radiusKm: 25 },
];

export const DEMO_LOCATION = LOCATIONS[0];

export const DEMO_POINT = {
  lat: DEMO_LOCATION.lat,
  lon: DEMO_LOCATION.lon,
  label: `${DEMO_LOCATION.label}, Costa Rica`,
};

export const DEMO_RADIUS_KM = DEMO_LOCATION.radiusKm;

export const MEMORY_DATES = [
  { date: "2024-04-05", label: "5 abr 2024" },
  { date: "2026-03-15", label: "15 mar 2026" },
] as const;

export const DEFAULT_MEMORY_DATE = MEMORY_DATES[0].date;

export const OFFICIAL_URL = "https://www.cne.go.cr/";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function shortDate(date: string): string {
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
