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
  const key = `eonet:${point.lat.toFixed(1)}:${point.lon.toFixed(1)}`;

  return cached(key, 30 * 60 * 1000, async () => {
    const [west, south, east, north] = bboxForRadius(point, MAX_ALERT_KM);
    const url =
      `${EONET_URL}?status=open&limit=200` +
      `&bbox=${west.toFixed(2)},${south.toFixed(2)},${east.toFixed(2)},${north.toFixed(2)}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.1 (hackathon)" },
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
      if (Date.now() - new Date(geometry.date).getTime() > freshDays * 24 * 60 * 60 * 1000) continue;

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
        title: event.title,
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
