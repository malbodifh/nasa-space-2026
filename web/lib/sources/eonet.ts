import "server-only";

import { cached } from "@/lib/cache";
import { bboxForRadius, distanceKm } from "@/lib/geo";
import type { AlertLevel, DisasterAlert, LatLon } from "@/lib/types";

const EONET_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";
const MAX_ALERT_KM = 600;
/** Un volcán o una sequía siguen abiertos meses; un incendio no. */
const FRESH_DAYS: Record<string, number> = {
  wildfires: 30,
  severeStorms: 30,
  floods: 60,
  earthquakes: 30,
  landslides: 90,
  volcanoes: 365,
  drought: 365,
  default: 120,
};

const CATEGORY_LABEL: Record<string, string> = {
  wildfires: "Incendio",
  volcanoes: "Volcán",
  severeStorms: "Tormenta",
  floods: "Inundación",
  drought: "Sequía",
  dustHaze: "Polvo",
  earthquakes: "Sismo",
  landslides: "Deslizamiento",
  seaLakeIce: "Hielo",
  snow: "Nieve",
  temperatureExtremes: "Temperatura extrema",
  waterColor: "Agua",
  manmade: "Antrópico",
};

type EonetGeometry = {
  date: string;
  type: string;
  coordinates: number[] | number[][] | number[][][];
};

type EonetEvent = {
  id: string;
  title: string;
  categories: { id: string; title: string }[];
  sources: { id: string; url: string }[];
  geometry: EonetGeometry[];
};

/** EONET titula en inglés; las inundaciones de GDACS vienen como «Flood in País 123». */
function translateTitle(title: string): string {
  const flood = title.match(/^Flood in (.+?)(?:\s+\d+)?$/);
  if (flood) return `Inundación en ${flood[1]}`;
  const fire = title.match(/^Wildfires? in (.+?)(?:\s+\d+)?$/i);
  if (fire) return `Incendio en ${fire[1]}`;
  const volcano = title.match(/^(.+?)\s+Volcano(.*)$/);
  if (volcano) return `Volcán ${volcano[1]}${volcano[2]}`;
  return title
    .replace(/^Tropical Storm\s+/i, "Tormenta tropical ")
    .replace(/^Hurricane\s+/i, "Huracán ")
    .replace(/^Tropical Depression\s+/i, "Depresión tropical ");
}

function lastCoordinate(geometry: EonetGeometry): [number, number] | null {
  if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
    const [lon, lat] = geometry.coordinates as number[];
    if (Number.isFinite(lon) && Number.isFinite(lat)) return [lon, lat];
    return null;
  }
  if (geometry.type === "Polygon") {
    const ring = geometry.coordinates as number[][][];
    const [lon, lat] = ring[0]?.[0] ?? [];
    if (Number.isFinite(lon) && Number.isFinite(lat)) return [lon, lat];
  }
  return null;
}

export async function getEonetAlerts(point: LatLon): Promise<DisasterAlert[]> {
  return fetchEonet(point, "open");
}

/** Eventos ya cerrados de los últimos `days` días: el historial de la región. */
export async function getEonetHistory(point: LatLon, days = 365): Promise<DisasterAlert[]> {
  return fetchEonet(point, "closed", days);
}

async function fetchEonet(
  point: LatLon,
  status: "open" | "closed",
  days?: number,
): Promise<DisasterAlert[]> {
  const key = `eonet:${status}:${days ?? ""}:${point.lat}:${point.lon}`;

  return cached(key, 30 * 60 * 1000, async () => {
    const [west, south, east, north] = bboxForRadius(point, MAX_ALERT_KM);
    const url =
      `${EONET_URL}?status=${status}&limit=200` +
      (days ? `&days=${days}` : "") +
      `&bbox=${west.toFixed(2)},${north.toFixed(2)},${east.toFixed(2)},${south.toFixed(2)}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "AstralCodes-GammaAlert/0.1 (hackathon)" },
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`EONET ${response.status}`);

    const payload = (await response.json()) as { events?: EonetEvent[] };
    const alerts: DisasterAlert[] = [];

    for (const event of payload.events ?? []) {
      const geometry = [...(event.geometry ?? [])].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
      if (!geometry) continue;
      const category = event.categories?.[0]?.id ?? "otros";
      const freshDays = FRESH_DAYS[category] ?? FRESH_DAYS.default;
      const age = Date.now() - new Date(geometry.date).getTime();
      if (status === "open" && age > freshDays * 24 * 60 * 60 * 1000) continue;

      const coordinate = lastCoordinate(geometry);
      if (!coordinate) continue;

      const [lon, lat] = coordinate;
      const distance = distanceKm(point, { lat, lon });
      if (distance > MAX_ALERT_KM) continue;

      alerts.push({
        id: event.id,
        source: "NASA EONET",
        category,
        categoryLabel: CATEGORY_LABEL[category] ?? category,
        title: translateTitle(event.title),
        level: "info" as AlertLevel,
        date: geometry.date,
        lat,
        lon,
        distanceKm: Math.round(distance * 10) / 10,
        url: event.sources?.[0]?.url ?? `https://eonet.gsfc.nasa.gov/api/v3/events/${event.id}`,
      });
    }

    return alerts;
  });
}
