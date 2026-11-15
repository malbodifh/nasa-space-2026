import { distanceKm } from "@/lib/geo";
import type { LatLon, SeismicEvent } from "@/lib/types";

const WINDOW_DAYS = 30;
const MAX_KM = 600;
const MIN_MAGNITUDE = 2.5;
/** OVSICORI es la red local: sus sismos pequeños también cuentan (la mitad del archivo es menor a M2,5). */
const MIN_MAGNITUDE_LOCAL = 0;

type UsgsFeature = {
  id: string;
  geometry: { coordinates: [number, number, number?] } | null;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string | null;
    status?: string;
    type?: string;
    alert?: string | null;
    mmi?: number | null;
  };
};

type OvsicoriFeature = {
  id: string;
  geometry: { coordinates: [number, number] };
  properties: {
    time: number;
    depthKm: number | null;
    magnitudeValue: number | null;
    evid?: string;
    evaluationMode?: string;
    pueblo?: string | null;
    canton?: string | null;
    provincia?: string | null;
    regionName?: string | null;
  };
};

const REGIONS: Record<string, string> = {
  Panama: "Panamá",
  "South of Panama": "Sur de Panamá",
  "Panama-Costa Rica Border Region": "frontera Costa Rica–Panamá",
  Nicaragua: "Nicaragua",
  "Near Coast of Nicaragua": "costa de Nicaragua",
  "El Salvador": "El Salvador",
  Honduras: "Honduras",
  Guatemala: "Guatemala",
  Colombia: "Colombia",
};

/**
 * Nombre del lugar de un sismo de OVSICORI. OVSICORI pone siempre el pueblo costarricense más
 * cercano; si el sismo está en otro país, ese pueblo engaña y se usa la región real.
 */
export function ovsicoriPlace(
  region: string | null | undefined,
  pueblo: string | null | undefined,
  canton: string | null | undefined,
): string {
  const local = [pueblo, canton].filter(Boolean).join(", ");
  if (!region || region === "Costa Rica") return local || "Costa Rica";
  if (region === "Off Coast of Costa Rica") return local ? `Frente a la costa, cerca de ${local}` : "Frente a la costa de Costa Rica";
  if (region === "Panama-Costa Rica Border Region") return local ? `Frontera con Panamá, cerca de ${local}` : "Frontera Costa Rica–Panamá";
  return REGIONS[region] ?? region;
}

const DIRECTIONS: Record<string, string> = { N: "N", S: "S", E: "E", W: "O" };

/** «60 km SSW of Masachapa, Nicaragua» → «60 km al SSO de Masachapa, Nicaragua». */
export function usgsPlace(place: string | null | undefined): string {
  if (!place) return "Sismo regional";
  const spanish = place.replace(/\bPanama\b/g, "Panamá");
  const match = spanish.match(/^(\d+) km ([NSEW]{1,3}) of (.+)$/);
  if (!match) return spanish.replace(/^(South|North) of /, (_, side: string) => (side === "South" ? "Sur de " : "Norte de "));
  const direction = match[2]
    .split("")
    .map((letter) => DIRECTIONS[letter])
    .join("");
  return `${match[1]} km al ${direction} de ${match[3]}`;
}

function isoFromMs(ms: number): string {
  return new Date(ms).toISOString();
}

export function parseUsgs(payload: unknown, point: LatLon): SeismicEvent[] {
  const features = (payload as { features?: UsgsFeature[] })?.features ?? [];
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const events: SeismicEvent[] = [];

  for (const feature of features) {
    const properties = feature.properties;
    const coordinates = feature.geometry?.coordinates;
    if (!properties || !coordinates) continue;
    if (properties.type && properties.type !== "earthquake") continue;
    if (!Number.isFinite(properties.mag) || (properties.mag as number) < MIN_MAGNITUDE) continue;
    if (!Number.isFinite(properties.time) || properties.time < cutoff ||
      properties.time > Date.now() || !Number.isFinite(new Date(properties.time).getTime())) continue;

    const [lon, lat, depth] = coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const distance = distanceKm(point, { lat, lon });
    if (distance > MAX_KM) continue;

    events.push({
      id: feature.id,
      source: "USGS",
      magnitude: Math.round((properties.mag as number) * 10) / 10,
      depthKm: Number.isFinite(depth) ? Math.round((depth as number) * 10) / 10 : null,
      time: isoFromMs(properties.time),
      lat,
      lon,
      place: usgsPlace(properties.place),
      distanceKm: Math.round(distance * 10) / 10,
      url: properties.url,
      reviewed: properties.status === "reviewed",
      pager: (["green", "yellow", "orange", "red"] as const).find((level) => level === properties.alert) ?? null,
      mmi: Number.isFinite(properties.mmi) ? Math.round((properties.mmi as number) * 10) / 10 : null,
    });
  }

  return events;
}

const MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function field(text: string, label: string): string | null {
  const match = text.match(new RegExp(`${label}:\\s*([^\\n]+?)\\s*(?:\\n|$)`, "i"));
  return match ? match[1].trim().replace(/\.$/, "") : null;
}

function decimal(value: string): number {
  return Number(value.replace(",", "."));
}

/** Fecha y hora local de Costa Rica (UTC−6) del informe de la RSN, en ISO UTC. */
export function rsnTime(fecha: string, hora: string): string | null {
  const date = fecha.match(/(\d{1,2}) de ([a-záéíóú]+) del? (\d{4})/i);
  const time = hora.match(/(\d{1,2}):(\d{2})\s*([ap])\.?\s*m/i);
  if (!date || !time) return null;
  const month = MONTHS[date[2].toLowerCase()];
  if (month === undefined) return null;
  const year = Number(date[3]);
  const day = Number(date[1]);
  const calendar = new Date(Date.UTC(year, month, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month ||
    calendar.getUTCDate() !== day || Number(time[1]) < 1 || Number(time[1]) > 12 ||
    Number(time[2]) > 59) return null;
  let hours = Number(time[1]) % 12;
  if (time[3].toLowerCase() === "p") hours += 12;
  const ms = Date.UTC(Number(date[3]), month, Number(date[1]), hours + 6, Number(time[2]));
  return new Date(ms).toISOString();
}

/** RSS de la Red Sismológica Nacional (UCR-ICE): solo sismos sentidos, revisados. */
export function parseRsn(xml: string, point: LatLon, now = Date.now()): SeismicEvent[] {
  const cutoff = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const events: SeismicEvent[] = [];
  for (const item of xml.split("<item>").slice(1)) {
    const link = item.match(/<link>([^<]+)<\/link>/)?.[1] ?? null;
    const html = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ?? "";
    const text = html
      .replace(/<\/p>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ");
    const fecha = field(text, "Fecha");
    const hora = field(text, "Hora Local");
    const coords = field(text, "Coordenadas")?.match(/(-?\d+(?:,\d+)?)\s*y\s*(-?\d+(?:,\d+)?)/);
    const magnitude = field(text, "Magnitud")?.match(/(\d+(?:,\d+)?)/);
    if (!fecha || !hora || !coords || !magnitude) continue;
    const time = rsnTime(fecha, hora);
    if (!time || Date.parse(time) < cutoff) continue;

    const lat = decimal(coords[1]);
    const lon = decimal(coords[2]);
    const value = decimal(magnitude[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(value)) continue;
    const distance = distanceKm(point, { lat, lon });
    if (distance > MAX_KM || value < MIN_MAGNITUDE) continue;
    const depth = field(text, "Profundidad")?.match(/(\d+(?:,\d+)?)/);
    const felt = text.match(/Sentido en:\s*([^\n]+)/i)?.[1].trim().replace(/\.$/, "") ?? null;

    events.push({
      id: `rsn:${time}`,
      source: "RSN",
      magnitude: Math.round(value * 10) / 10,
      depthKm: depth ? decimal(depth[1]) : null,
      time,
      lat,
      lon,
      place: field(text, "Localización") ?? "Costa Rica",
      distanceKm: Math.round(distance * 10) / 10,
      url: link,
      reviewed: /revisada/i.test(text),
      felt,
    });
  }
  return events;
}

export function parseOvsicori(payload: unknown, point: LatLon, now = Date.now()): SeismicEvent[] {
  const features = (payload as { features?: OvsicoriFeature[] })?.features ?? [];
  const cutoff = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const events: SeismicEvent[] = [];

  for (const feature of features) {
    const properties = feature.properties;
    const coordinates = feature.geometry?.coordinates;
    if (!properties || !coordinates) continue;
    if (!Number.isFinite(properties.magnitudeValue)) continue;
    if ((properties.magnitudeValue as number) < MIN_MAGNITUDE_LOCAL) continue;

    const time = properties.time * 1000;
    if (!Number.isFinite(time) || time < cutoff || time > now ||
      !Number.isFinite(new Date(time).getTime())) continue;

    const [lon, lat] = coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const distance = distanceKm(point, { lat, lon });
    if (distance > MAX_KM) continue;

    const place = ovsicoriPlace(properties.regionName, properties.pueblo, properties.canton);

    events.push({
      id: properties.evid ?? feature.id,
      source: "OVSICORI",
      magnitude: Math.round((properties.magnitudeValue as number) * 10) / 10,
      depthKm: Number.isFinite(properties.depthKm)
        ? Math.round((properties.depthKm as number) * 10) / 10
        : null,
      time: isoFromMs(time),
      lat,
      lon,
      place,
      distanceKm: Math.round(distance * 10) / 10,
      url: null,
      // OVSICORI marca «manual» lo que ya revisó un analista; «automatic» es preliminar.
      reviewed: properties.evaluationMode === "manual",
    });
  }

  return events;
}

/**
 * Une el mismo sismo reportado por varias redes: gana la primera lista (la más local) y las
 * demás quedan en `alsoReportedBy`. También hereda «sentido en» (RSN) y PAGER/MMI (USGS).
 */
export function mergeSeismic(...lists: SeismicEvent[][]): SeismicEvent[] {
  const merged: SeismicEvent[] = [];

  for (const list of lists) {
    for (const candidate of list) {
      const same = merged.find(
        (event) =>
          event.source !== candidate.source &&
          !event.alsoReportedBy?.includes(candidate.source) &&
          distanceKm(candidate, event) <= 40 &&
          Math.abs(Date.parse(candidate.time) - Date.parse(event.time)) <= 5 * 60 * 1000,
      );
      if (!same) {
        merged.push({ ...candidate, alsoReportedBy: [] });
        continue;
      }
      if (same.source !== candidate.source && !same.alsoReportedBy?.includes(candidate.source)) {
        same.alsoReportedBy = [...(same.alsoReportedBy ?? []), candidate.source];
      }
      same.reviewed ||= candidate.reviewed;
      same.felt ??= candidate.felt ?? null;
      same.pager ??= candidate.pager ?? null;
      same.mmi ??= candidate.mmi ?? null;
      same.url ??= candidate.url;
    }
  }

  return merged.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
}
