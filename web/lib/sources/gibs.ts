import "server-only";

import { VectorTile } from "@mapbox/vector-tile";
import { gunzipSync } from "node:zlib";
import { PbfReader } from "pbf";

import demoMemoryJson from "@/data/demo-memory.json";
import { cached } from "@/lib/cache";
import { DEMO_POINT, DEFAULT_MEMORY_DATE, todayISO } from "@/lib/demo";
import { bboxForRadius, distanceKm } from "@/lib/geo";
import type { FirePoint, FireStats, LatLon } from "@/lib/types";

const LAYER = "MODIS_Combined_Thermal_Anomalies_All";
const MATRIX_1KM = [2, 3, 5, 10, 20, 40, 80];
const ZOOM = 6;

const demoMemory = demoMemoryJson as {
  date: string;
  source: string;
  points: FirePoint[];
};

type TileRange = { x0: number; x1: number; y0: number; y1: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function tileRange(bbox: [number, number, number, number]): TileRange {
  const [west, south, east, north] = bbox;
  const nLon = MATRIX_1KM[ZOOM];
  const nLat = Math.ceil(nLon / 2);
  return {
    x0: clamp(Math.floor(((west + 180) / 360) * nLon), 0, nLon - 1),
    x1: clamp(Math.floor(((east + 180) / 360) * nLon), 0, nLon - 1),
    y0: clamp(Math.floor(((90 - north) / 180) * nLat), 0, nLat - 1),
    y1: clamp(Math.floor(((90 - south) / 180) * nLat), 0, nLat - 1),
  };
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function decodeTile(buffer: Uint8Array): FirePoint[] {
  const data =
    buffer.length > 2 && buffer[0] === 0x1f && buffer[1] === 0x8b ? gunzipSync(buffer) : buffer;
  const tile = new VectorTile(new PbfReader(data));
  const points: FirePoint[] = [];

  for (const layer of Object.values(tile.layers)) {
    for (let i = 0; i < layer.length; i += 1) {
      const properties = layer.feature(i).properties as Record<string, unknown>;
      const lat = toNumber(properties.LATITUDE ?? properties.latitude);
      const lon = toNumber(properties.LONGITUDE ?? properties.longitude);
      if (lat === null || lon === null) continue;

      const date = String(properties.ACQ_DATE ?? properties.acq_date ?? "");
      const time = properties.ACQ_TIME ? String(properties.ACQ_TIME) : undefined;
      const satellite = properties.SATELLITE ? String(properties.SATELLITE) : undefined;
      const instrument = properties.INSTRUMENT ? String(properties.INSTRUMENT) : undefined;
      const confidence = properties.CONFIDENCE ? String(properties.CONFIDENCE) : undefined;
      const frp = toNumber(properties.FRP ?? properties.frp) ?? undefined;

      points.push({
        id: `${date}:${lat.toFixed(4)}:${lon.toFixed(4)}:${time ?? ""}:${satellite ?? ""}`,
        lat,
        lon,
        date,
        time,
        satellite,
        instrument,
        confidence,
        frp,
      });
    }
  }

  return points;
}

async function fetchTile(date: string, x: number, y: number): Promise<FirePoint[] | null> {
  const url = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${LAYER}/default/${date}/1km/${ZOOM}/${y}/${x}.mvt`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(8_000),
    headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.1" },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GIBS ${response.status}`);

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("xml") || contentType.includes("html")) return null;

  return decodeTile(new Uint8Array(await response.arrayBuffer()));
}

function fromPoints(
  date: string,
  radiusKm: number,
  point: LatLon,
  input: FirePoint[],
  available: boolean,
  fallback: boolean,
): FireStats {
  const dedup = new Map<string, FirePoint>();

  for (const fire of input) {
    const distance = distanceKm(point, { lat: fire.lat, lon: fire.lon });
    if (distance > radiusKm + 0.5) continue;
    dedup.set(fire.id, { ...fire, distanceKm: Math.round(distance * 10) / 10 });
  }

  const points = [...dedup.values()].sort(
    (a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999),
  );
  const maxFrp = points.reduce((max, fire) => Math.max(max, fire.frp ?? 0), 0);

  return {
    date,
    count: points.length,
    nearestKm: points[0]?.distanceKm ?? null,
    maxFrp: maxFrp > 0 ? Math.round(maxFrp * 10) / 10 : null,
    points,
    available,
    fallback,
  };
}

export async function getFireStats(
  point: LatLon,
  radiusKm: number,
  date: string,
): Promise<FireStats> {
  const key = `gibs:${date}:${point.lat}:${point.lon}:${radiusKm}`;
  const ttl = date === todayISO() ? 5 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  return cached(key, ttl, async () => {
    const range = tileRange(bboxForRadius(point, radiusKm));
    const points: FirePoint[] = [];
    let available = false;
    let missing = false;

    const tasks: Promise<void>[] = [];
    for (let x = range.x0; x <= range.x1; x += 1) {
      for (let y = range.y0; y <= range.y1; y += 1) {
        tasks.push(
          fetchTile(date, x, y)
            .then((tile) => {
              if (tile !== null) {
                available = true;
                points.push(...tile);
              } else missing = true;
            })
            .catch(() => { missing = true; }),
        );
      }
    }
    await Promise.all(tasks);

    if (!available && date === DEFAULT_MEMORY_DATE && distanceKm(point, DEMO_POINT) <= 30) {
      return fromPoints(date, radiusKm, point, demoMemory.points, true, true);
    }

    // Una parte del radio sin respuesta no equivale a ausencia de focos en todo el radio.
    return fromPoints(date, radiusKm, point, points, available && !missing, missing || !available);
  });
}
