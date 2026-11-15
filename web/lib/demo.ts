export const DEMO_POINT = {
  lat: -33.047,
  lon: -71.612,
  label: "Valparaíso, Chile",
};

export const DEMO_RADIUS_KM = 50;

export const MEMORY_DATES = [
  { date: "2024-02-03", label: "3 feb 2024" },
  { date: "2017-01-25", label: "25 ene 2017" },
] as const;

export const DEFAULT_MEMORY_DATE = MEMORY_DATES[0].date;

export const OFFICIAL_URL = "https://www.senapred.cl/";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function shortDate(date: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
