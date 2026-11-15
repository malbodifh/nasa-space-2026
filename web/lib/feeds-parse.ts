/**
 * Lectores puros de las fuentes de alerta en tiempo real (sin red, para poder probarlos).
 * Cada uno devuelve `DisasterAlert` normalizados; las reglas de «le afecta» están en
 * `lib/alert-rules.ts`.
 */
import { distanceKm } from "@/lib/geo";
import type { AlertLevel, DisasterAlert, LatLon } from "@/lib/types";

const round1 = (value: number) => Math.round(value * 10) / 10;
const numberOrNaN = (value: unknown): number =>
  value === null || value === undefined || (typeof value === "string" && !value.trim())
    ? Number.NaN
    : Number(value);

/* ---------- PTWC / NTWC: boletines de tsunami (Atom) ---------- */

const TSUNAMI_CATEGORY: [RegExp, string, AlertLevel][] = [
  [/threat/i, "Amenaza de tsunami", "red"],
  [/warning/i, "Advertencia de tsunami", "red"],
  [/watch/i, "Vigilancia de tsunami", "orange"],
  [/advisory/i, "Aviso de tsunami", "orange"],
  [/information/i, "Boletín informativo", "info"],
];

function tag(text: string, name: string): string | null {
  const match = text.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? match[1].trim() : null;
}

/**
 * Boletines de los centros de alerta de tsunamis de NOAA. Los informativos solo se muestran
 * si el sismo está a menos de 1.500 km; vigilancias, avisos y advertencias, hasta 4.000 km.
 */
export function parsePtwc(xml: string, point: LatLon): DisasterAlert[] {
  const alerts: DisasterAlert[] = [];
  for (const entry of xml.split("<entry>").slice(1)) {
    const lat = numberOrNaN(tag(entry, "geo:lat"));
    const lon = numberOrNaN(tag(entry, "geo:long"));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const summary = (tag(entry, "summary") ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const categoryText = summary.match(/Category:\s*([A-Za-z ]+?)\s+Bulletin/i)?.[1] ?? "Information";
    const [, label, level] = TSUNAMI_CATEGORY.find(([pattern]) => pattern.test(categoryText)) ?? TSUNAMI_CATEGORY[4];
    const distance = distanceKm(point, { lat, lon });
    if (distance > (level === "info" ? 1500 : 4000)) continue;

    const magnitude = Number(summary.match(/Preliminary Magnitude:\s*([\d.]+)/i)?.[1]);
    const region = (tag(entry, "title") ?? "").replace(/\s+/g, " ").trim();
    const bulletin = entry.match(/rel="alternate"[^>]*href="([^"]+)"/)?.[1];
    const noDanger = /NO tsunami danger/i.test(summary);
    alerts.push({
      id: `ptwc:${tag(entry, "id") ?? region}`,
      source: "PTWC",
      category: "tsunami",
      categoryLabel: "Tsunami",
      title: `${label}: ${region.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}`,
      level,
      date: tag(entry, "updated") ?? "",
      lat,
      lon,
      distanceKm: round1(distance),
      url: bulletin ?? "https://www.tsunami.gov/",
      magnitudeValue: Number.isFinite(magnitude) ? magnitude : undefined,
      detail: noDanger ? "Sin peligro de tsunami según el centro de alerta." : label,
    });
  }
  return alerts;
}

/* ---------- NOAA NHC: ciclones activos ---------- */

type NhcStorm = {
  id: string;
  name: string;
  classification: string;
  intensity?: string;
  latitudeNumeric?: number;
  longitudeNumeric?: number;
  latitude?: string;
  longitude?: string;
  lastUpdate?: string;
  publicAdvisory?: { url?: string };
};

const STORM_LABEL: Record<string, string> = {
  HU: "Huracán",
  MH: "Huracán mayor",
  TS: "Tormenta tropical",
  STS: "Tormenta subtropical",
  TD: "Depresión tropical",
  STD: "Depresión subtropical",
  PTC: "Ciclón potencial",
  PC: "Ciclón postropical",
};

function coordinate(value: string | undefined, numeric: number | undefined): number {
  if (Number.isFinite(numeric)) return numeric as number;
  const match = value?.match(/([\d.]+)\s*([NSEW])/i);
  if (!match) return Number.NaN;
  const n = Number(match[1]);
  return /[SW]/i.test(match[2]) ? -n : n;
}

/** Ciclones del NHC a menos de 1.500 km. Huracán a < 500 km: rojo; a < 1.000 km: naranja. */
export function parseNhc(payload: unknown, point: LatLon): DisasterAlert[] {
  const storms = (payload as { activeStorms?: NhcStorm[] })?.activeStorms ?? [];
  const alerts: DisasterAlert[] = [];
  for (const storm of storms) {
    const lat = coordinate(storm.latitude, storm.latitudeNumeric);
    const lon = coordinate(storm.longitude, storm.longitudeNumeric);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const distance = distanceKm(point, { lat, lon });
    if (distance > 1500) continue;
    const hurricane = /^(HU|MH)$/.test(storm.classification);
    const level: AlertLevel =
      hurricane && distance < 500 ? "red" : distance < 1000 && storm.classification !== "TD" ? "orange" : "info";
    const label = STORM_LABEL[storm.classification] ?? "Ciclón tropical";
    alerts.push({
      id: `nhc:${storm.id}`,
      source: "NHC",
      category: "severeStorms",
      categoryLabel: "Ciclón",
      title: `${label} ${storm.name}`,
      level,
      date: storm.lastUpdate ?? "",
      lat,
      lon,
      distanceKm: round1(distance),
      url: storm.publicAdvisory?.url ?? "https://www.nhc.noaa.gov/",
      detail: storm.intensity ? `Vientos de ${Math.round(Number(storm.intensity) * 1.852)} km/h` : null,
    });
  }
  return alerts;
}

/* ---------- NASA FIRMS: focos de calor (CSV) ---------- */

const GROUP_DEG = 0.05; // ~5 km: grupo que se reporta como un solo posible incendio
const STATIC_DEG = 0.02; // ~2 km: celda para reconocer fuentes de calor fijas
const VOLCANO_KM = 3;
const NIGHT_MIN_FRP = 5;
const STRONG_FRP = 30;

type Detection = { lat: number; lon: number; day: string; stamp: string; pass: string; frp: number; night: boolean };

export type FirmsFilterReport = {
  total: number;
  lowConfidence: number;
  volcano: number;
  nightWeak: number;
  staticSource: number;
  singlePass: number;
  kept: number;
};

/**
 * FIRMS detecta calor, no incendios. En Costa Rica la mayoría de los focos son calor de cráteres,
 * fuentes urbanas o industriales, o quemas agrícolas de una sola pasada. Se descarta:
 * 1. confianza baja;
 * 2. focos a menos de 3 km de un volcán (calor volcánico);
 * 3. focos nocturnos de menos de 5 MW (calor urbano o industrial);
 * 4. celdas de ~2 km con calor en 3 o más días, o en 2 o más noches (fuentes fijas);
 * 5. grupos vistos en una sola pasada del satélite.
 * Queda un posible incendio si el grupo aparece en 2+ pasadas y tiene 3+ focos o uno de 30+ MW.
 * `recentHours` limita lo que se reporta; el resto de la ventana solo sirve para ver qué se repite.
 */
export function parseFirms(
  csv: string,
  point: LatLon,
  options: { maxKm?: number; volcanoes?: LatLon[]; now?: number; recentHours?: number } = {},
): DisasterAlert[] {
  return filterFirms(csv, point, options).alerts;
}

export function filterFirms(
  csv: string,
  point: LatLon,
  { maxKm = 300, volcanoes = [], now = Date.now(), recentHours = 24 }: {
    maxKm?: number;
    volcanoes?: LatLon[];
    now?: number;
    recentHours?: number;
  } = {},
): { alerts: DisasterAlert[]; report: FirmsFilterReport } {
  const report: FirmsFilterReport = { total: 0, lowConfidence: 0, volcano: 0, nightWeak: 0, staticSource: 0, singlePass: 0, kept: 0 };
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0];
  if (!header || !header.includes("latitude")) return { alerts: [], report };
  const columns = header.split(",");
  const col = (name: string) => columns.indexOf(name);

  const detections: Detection[] = [];
  for (const row of lines.slice(1)) {
    if (row.startsWith("latitude")) continue; // encabezados repetidos al unir satélites
    const values = row.split(",");
    const lat = numberOrNaN(values[col("latitude")]);
    const lon = numberOrNaN(values[col("longitude")]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (distanceKm(point, { lat, lon }) > maxKm) continue;
    report.total += 1;

    const confidence = values[col("confidence")] ?? "";
    if (confidence === "l" || (Number.isFinite(Number(confidence)) && Number(confidence) < 50)) {
      report.lowConfidence += 1;
      continue;
    }
    if (volcanoes.some((volcano) => distanceKm(volcano, { lat, lon }) < VOLCANO_KM)) {
      report.volcano += 1;
      continue;
    }
    const frp = Number(values[col("frp")]) || 0;
    const night = (values[col("daynight")] ?? "").startsWith("N");
    if (night && frp < NIGHT_MIN_FRP) {
      report.nightWeak += 1;
      continue;
    }
    const day = values[col("acq_date")] ?? "";
    const time = (values[col("acq_time")] ?? "0000").padStart(4, "0");
    const stamp = `${day}T${time.slice(0, 2)}:${time.slice(2)}:00Z`;
    detections.push({ lat, lon, day, stamp, pass: `${values[col("satellite")]}@${stamp}`, frp, night });
  }

  // Fuentes fijas: la misma celda de ~2 km con calor muchos días o varias noches.
  const staticCells = new Map<string, { days: Set<string>; nights: Set<string> }>();
  const staticKey = (d: Detection) => `${Math.round(d.lat / STATIC_DEG)}:${Math.round(d.lon / STATIC_DEG)}`;
  for (const d of detections) {
    const cell = staticCells.get(staticKey(d)) ?? { days: new Set(), nights: new Set() };
    cell.days.add(d.day);
    if (d.night) cell.nights.add(d.day);
    staticCells.set(staticKey(d), cell);
  }
  const isStatic = (d: Detection) => {
    const cell = staticCells.get(staticKey(d));
    return Boolean(cell && (cell.days.size >= 3 || cell.nights.size >= 2));
  };

  const cutoff = now - recentHours * 3_600_000;
  const groups = new Map<string, { lat: number; lon: number; count: number; frp: number; last: string; passes: Set<string> }>();
  for (const d of detections) {
    if (isStatic(d)) {
      report.staticSource += 1;
      continue;
    }
    const at = Date.parse(d.stamp);
    if (!Number.isFinite(at) || at < cutoff || at > now) continue;
    const key = `${Math.round(d.lat / GROUP_DEG)}:${Math.round(d.lon / GROUP_DEG)}`;
    const group = groups.get(key) ?? { lat: 0, lon: 0, count: 0, frp: 0, last: d.stamp, passes: new Set() };
    group.lat += d.lat;
    group.lon += d.lon;
    group.count += 1;
    group.frp = Math.max(group.frp, d.frp);
    group.passes.add(d.pass);
    if (d.stamp > group.last) group.last = d.stamp;
    groups.set(key, group);
  }

  const alerts: DisasterAlert[] = [];
  for (const [key, group] of groups) {
    const credible = group.passes.size >= 2 && (group.count >= 3 || group.frp >= STRONG_FRP);
    if (!credible) {
      report.singlePass += group.count;
      continue;
    }
    report.kept += group.count;
    const lat = group.lat / group.count;
    const lon = group.lon / group.count;
    alerts.push({
      id: `firms:${key}:${group.last.slice(0, 10)}`,
      source: "NASA FIRMS",
      category: "wildfires",
      categoryLabel: "Incendio",
      title: "Posible incendio (sin confirmar)",
      level: group.count >= 10 ? "orange" : "info",
      date: group.last,
      lat,
      lon,
      distanceKm: round1(distanceKm(point, { lat, lon })),
      url: `https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@${lon.toFixed(3)},${lat.toFixed(3)},11z`,
      detail: `${group.count} focos de calor en ${group.passes.size} pasadas del satélite · potencia máxima ${Math.round(group.frp)} MW. Puede ser una quema agrícola.`,
      quality: "detección satelital",
    });
  }
  return { alerts, report };
}

/* ---------- Open-Meteo: lluvia pronosticada ---------- */

/**
 * Lluvia acumulada pronosticada en las próximas 24 h en su punto. Es un modelo, no un aviso
 * oficial: ≥ 50 mm se informa y ≥ 100 mm se marca en naranja.
 */
export function rainAlert(payload: unknown, point: LatLon, now = new Date()): DisasterAlert | null {
  const hourly = (payload as { hourly?: { time?: string[]; precipitation?: (number | null)[] } })?.hourly;
  if (!hourly?.time || !hourly.precipitation) return null;
  const start = now.getTime();
  const end = start + 24 * 3600 * 1000;
  let total = 0;
  hourly.time.forEach((time, index) => {
    const at = Date.parse(time.endsWith("Z") ? time : `${time}Z`);
    if (at >= start && at < end) total += hourly.precipitation?.[index] ?? 0;
  });
  if (total < 50) return null;
  const mm = Math.round(total);
  return {
    id: `rain:${now.toISOString().slice(0, 13)}`,
    source: "Open-Meteo",
    category: "heavyRain",
    categoryLabel: "Lluvia fuerte",
    title: `Se pronostican ${mm} mm de lluvia en 24 horas`,
    level: total >= 100 ? "orange" : "info",
    date: now.toISOString(),
    lat: point.lat,
    lon: point.lon,
    distanceKm: 0,
    url: "https://open-meteo.com/en/docs",
    detail: "Pronóstico de modelo, no es un aviso oficial del IMN.",
    quality: "pronóstico",
  };
}
