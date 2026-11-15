import { affects } from "@/lib/alert-rules";
import { LOCATIONS } from "@/lib/demo";
import { distanceKm } from "@/lib/geo";
import { baselineIndex, peakChange, SAR_ZONES, type SarZone } from "@/lib/sar";
import type { AlertLevel, DisasterAlert, LatLon, RiskLevel } from "@/lib/types";

/** Radio en el que una alerta activa cuenta como «cerca de usted». */
export const NEAR_KM = 100;

export type EventItem = {
  id: string;
  kind: "alerta" | "radar";
  category: string;
  categoryLabel: string;
  title: string;
  date: string;
  lat: number;
  lon: number;
  distanceKm: number | null;
  level: AlertLevel;
  source: string;
  detail?: string | null;
  alsoReportedBy?: string[];
  quality?: DisasterAlert["quality"];
  /** Enlace al reporte original de la fuente. */
  url?: string | null;
  magnitudeValue?: number;
  radarZoneId?: string;
  radarBaseDate?: string;
};

export type Tone = "exito" | "aviso" | "peligro" | "neutro";

/** Color del punto de cada evento (niveles de GDACS; azul = detectado por radar). */
export const LEVEL_COLOR: Record<string, string> = {
  red: "#B42318",
  orange: "#946200",
  green: "#8A8F9E",
  info: "#8A8F9E",
  radar: "#5266EB",
};

export function fromAlert(alert: DisasterAlert): EventItem {
  return {
    id: alert.id,
    kind: "alerta",
    category: alert.category,
    categoryLabel: alert.categoryLabel,
    title: alert.title,
    date: alert.date,
    lat: alert.lat,
    lon: alert.lon,
    distanceKm: alert.distanceKm,
    level: alert.level,
    source: alert.source,
    detail: alert.detail ?? null,
    alsoReportedBy: alert.alsoReportedBy ?? [],
    quality: alert.quality ?? null,
    url: alert.url || null,
    magnitudeValue: alert.magnitudeValue,
  };
}

/** Cambio aparente en vistas previas (≥ `minPct` de píxeles comparables), no daño confirmado. */
export function radarDetections(point: LatLon, minPct = 5, zones: SarZone[] = SAR_ZONES): EventItem[] {
  const items: EventItem[] = [];
  for (const zone of zones) {
    const peak = zone.acquisitions[peakChange(zone.acquisitions)];
    const base = zone.acquisitions[baselineIndex(zone.acquisitions)];
    if (!peak || peak === base) continue;
    const pct = peak.brighterPct + peak.darkerPct;
    if (pct < minPct) continue;
    items.push({
      id: `radar:${zone.id}:${peak.date}`,
      kind: "radar",
      category: "radar",
      categoryLabel: "Diferencia visual de radar",
      title: `Diferencia aparente en la vista previa de ${zone.name}`,
      date: peak.date,
      radarZoneId: zone.id,
      radarBaseDate: base.date,
      lat: zone.center.lat,
      lon: zone.center.lon,
      distanceKm: Math.round(distanceKm(point, zone.center) * 10) / 10,
      level: "info",
      source: "NASA-ISRO NISAR",
      detail: "Comparación de vistas previas de 8 bits. No identifica la causa ni confirma daños.",
    });
  }
  return items;
}

/** Historial: eventos pasados y detecciones de radar, del más reciente al más antiguo. */
export function buildHistory(history: DisasterAlert[], detections: EventItem[]): EventItem[] {
  return [...history.map(fromAlert), ...detections].sort((a, b) => b.date.localeCompare(a.date));
}

export function toneFor(level: AlertLevel): Tone {
  if (level === "red") return "peligro";
  if (level === "orange") return "aviso";
  return "neutro";
}

/** Alertas activas que, según las reglas por amenaza, afectan su ubicación. */
export function affecting(active: DisasterAlert[]): DisasterAlert[] {
  return active.filter(affects).sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Estado de la ubicación según las alertas que le afectan. */
export function locationStatus(active: DisasterAlert[]): {
  tone: Tone;
  title: string;
  nearest: DisasterAlert | null;
} {
  const relevant = affecting(active);
  if (relevant.length === 0) return { tone: "exito", title: "Sin alertas para su ubicación", nearest: null };
  const serious = relevant.find((alert) => alert.category !== "tsunami" && (alert.level === "red" || alert.level === "orange"))
    ?? relevant.find((alert) => alert.level === "red" || alert.level === "orange");
  if (serious) return {
    // Un boletín regional no confirma que la costa de la persona esté incluida: se destaca, pero
    // no se afirma peligro en su ubicación.
    tone: serious.category === "tsunami" ? "aviso" : "peligro",
    title: serious.category === "tsunami" ? "Boletín regional de tsunami: alcance local desconocido" : "Alerta para su ubicación",
    nearest: serious,
  };
  return {
    tone: "aviso",
    title: relevant.length === 1 ? "1 aviso para su ubicación" : `${relevant.length} avisos para su ubicación`,
    nearest: relevant[0],
  };
}

export const FIRE_LABEL: Record<RiskLevel, string> = {
  info: "sin datos suficientes",
  low: "bajas",
  moderate: "moderadas",
  high: "altas",
  extreme: "extremas",
};

/** Nombre corto del lugar: la ciudad de demostración más cercana, si está a menos de 40 km. */
export function placeName(point: LatLon): string {
  let best: { label: string; km: number } | null = null;
  for (const location of LOCATIONS) {
    const km = distanceKm(point, location);
    if (km <= 40 && (!best || km < best.km)) best = { label: location.label, km };
  }
  return best ? `Cerca de ${best.label}` : `${point.lat.toFixed(2)}, ${point.lon.toFixed(2)}`;
}

/** Enlace a la página que compara la superficie antes y después del evento. */
export function studyHref(item: Pick<EventItem, "lat" | "lon" | "date" | "title" | "categoryLabel" | "radarZoneId" | "radarBaseDate">): string {
  const params = new URLSearchParams({
    lat: item.lat.toFixed(4),
    lon: item.lon.toFixed(4),
    fecha: item.date.slice(0, 10),
    titulo: item.title,
    tipo: item.categoryLabel,
  });
  if (item.radarZoneId && item.radarBaseDate) {
    params.set("zona", item.radarZoneId);
    params.set("base", item.radarBaseDate);
  }
  return `/superficie?${params.toString()}`;
}

/** «Hoy», «Ayer», «Hace 5 días» o la fecha corta. */
export function relativeDay(date: string, now = new Date()): string {
  const day = Date.parse(`${date.slice(0, 10)}T12:00:00Z`);
  const today = Date.parse(`${now.toISOString().slice(0, 10)}T12:00:00Z`);
  const diff = Math.round((today - day) / 86_400_000);
  if (diff <= 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return `Hace ${diff} días`;
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    year: diff > 300 ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(day));
}

const CR_TIME = "America/Costa_Rica";

/**
 * Cuándo ocurrió, para verificarlo: fecha y hora de Costa Rica más el tiempo transcurrido.
 * «13 nov, 12:04 p. m. · hace 2 días». Si la fuente solo da el día (EONET), solo el día.
 */
export function formatWhen(date: string, now = new Date()): string {
  const at = Date.parse(date);
  if (!Number.isFinite(at)) return "";
  const minutes = Math.max(0, Math.round((now.getTime() - at) / 60_000));
  const hasTime = date.length > 10 && !/T00:00(:00(\.0+)?)?Z$/.test(date);
  const old = minutes > 300 * 24 * 60;
  const day = new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    year: old ? "numeric" : undefined,
    timeZone: hasTime ? CR_TIME : "UTC",
  }).format(new Date(at));
  const time = new Intl.DateTimeFormat("es-CR", { hour: "numeric", minute: "2-digit", timeZone: CR_TIME }).format(
    new Date(at),
  );
  const ago =
    minutes < 60
      ? `hace ${minutes} min`
      : minutes < 48 * 60
        ? `hace ${Math.round(minutes / 60)} h`
        : minutes < 7 * 24 * 60
          ? `hace ${Math.round(minutes / (24 * 60))} días`
          : null;
  const when = hasTime ? `${day}, ${time}` : day;
  return ago ? `${when} · ${ago}` : when;
}

/** «hace 5 min», «hace 3 h», «hace 2 días» o la fecha corta. */
export function timeAgo(date: string, now = new Date()): string {
  const at = Date.parse(date);
  if (!Number.isFinite(at)) return "";
  const minutes = Math.max(0, Math.round((now.getTime() - at) / 60_000));
  if (minutes < 60) return `hace ${minutes} min`;
  if (minutes < 48 * 60) return `hace ${Math.round(minutes / 60)} h`;
  if (minutes < 30 * 24 * 60) return `hace ${Math.round(minutes / (24 * 60))} días`;
  return relativeDay(date, now);
}

/** Nombre del reporte original de cada fuente, para el enlace «verificar». */
export const OFFICIAL_LABEL: Record<string, string> = {
  RSN: "Informe de la RSN",
  OVSICORI: "Sitio de OVSICORI",
  USGS: "Ficha de USGS",
  PTWC: "Boletín del centro de tsunamis",
  NHC: "Aviso del NHC",
  "NASA FIRMS": "Mapa de FIRMS",
  GDACS: "Reporte de GDACS",
  "NASA EONET": "Fuente en EONET",
  "Open-Meteo": "Pronóstico Open-Meteo",
};
