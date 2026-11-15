import { distanceKm } from "@/lib/geo";
import type { LatLon, SeismicEvent } from "@/lib/types";

const WINDOW_DAYS = 30;
const MAX_KM = 600;
const MIN_MAGNITUDE = 2.5;

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
    if (properties.time < cutoff) continue;

    const [lon, lat, depth] = coordinates;
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
      place: properties.place ?? "Sismo regional",
      distanceKm: Math.round(distance * 10) / 10,
      url: properties.url,
      reviewed: properties.status === "reviewed",
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
    if ((properties.magnitudeValue as number) < MIN_MAGNITUDE) continue;

    const time = properties.time * 1000;
    if (!Number.isFinite(time) || time < cutoff) continue;

    const [lon, lat] = coordinates;
    const distance = distanceKm(point, { lat, lon });
    if (distance > MAX_KM) continue;

    const place =
      [properties.pueblo, properties.canton].filter(Boolean).join(", ") ||
      properties.regionName ||
      "Costa Rica";

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
      reviewed: properties.evaluationMode === "reviewed",
    });
  }

  return events;
}

/** La red local gana sobre USGS cuando el mismo sismo aparece en ambas. */
export function mergeSeismic(local: SeismicEvent[], global: SeismicEvent[]): SeismicEvent[] {
  const merged = [...local];

  for (const candidate of global) {
    const duplicate = merged.some(
      (event) =>
        distanceKm(candidate, event) <= 30 &&
        Math.abs(Date.parse(candidate.time) - Date.parse(event.time)) <= 10 * 60 * 1000,
    );
    if (!duplicate) merged.push(candidate);
  }

  return merged.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
}

