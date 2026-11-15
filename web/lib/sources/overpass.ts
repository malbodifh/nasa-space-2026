import "server-only";

import fallback from "@/data/overpass-valparaiso.json";
import { cached } from "@/lib/cache";
import { DEMO_POINT } from "@/lib/demo";
import { bboxForRadius, distanceKm } from "@/lib/geo";
import type {
  GeoCollection,
  GeoJsonGeometry,
  LatLon,
  ProtectedAreaProps,
  RoadProps,
} from "@/lib/types";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

type OverpassPoint = { lat: number; lon: number };
type OverpassGeometry = OverpassPoint[];
type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  tags?: Record<string, string>;
  geometry?: OverpassGeometry;
  members?: { type: string; role: string; geometry?: OverpassGeometry }[];
};
type OverpassPayload = { elements?: OverpassElement[] };

export type OsmOverlays = {
  roads: GeoCollection<RoadProps>;
  protectedAreas: GeoCollection<ProtectedAreaProps>;
  fallback: boolean;
  mode: "snapshot" | "live" | "empty";
  fetchedAt: string | null;
};

const round = (value: number) => Math.round(value * 1e4) / 1e4;

function line(coords: OverpassGeometry | undefined): [number, number][] | null {
  if (!coords || coords.length < 2) return null;
  return coords.map((p) => [round(p.lon), round(p.lat)]);
}

/** Douglas-Peucker en grados; 0.0008° ≈ 90 m alcanza para un overlay. */
function simplify(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length <= 2) return points;
  const sq = tolerance * tolerance;

  const segmentDistance = (p: [number, number], a: [number, number], b: [number, number]) => {
    let x = a[0];
    let y = a[1];
    let dx = b[0] - x;
    let dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b[0];
        y = b[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  };

  const keep = (first: number, last: number, output: [number, number][]) => {
    let max = sq;
    let index = -1;
    for (let i = first + 1; i < last; i += 1) {
      const d = segmentDistance(points[i], points[first], points[last]);
      if (d > max) {
        max = d;
        index = i;
      }
    }
    if (index > 0) {
      keep(first, index, output);
      output.push(points[index]);
      keep(index, last, output);
    }
  };

  const output: [number, number][] = [points[0]];
  keep(0, points.length - 1, output);
  output.push(points[points.length - 1]);
  return output;
}

function stitch(segments: [number, number][][]): [number, number][][] {
  const rings: [number, number][][] = [];
  const pool = segments.map((s) => [...s]);

  while (pool.length > 0) {
    const ring = pool.shift();
    if (!ring) break;
    for (let guard = 0; guard < 400; guard += 1) {
      const last = ring[ring.length - 1];
      const first = ring[0];
      if (first[0] === last[0] && first[1] === last[1]) break;
      const index = pool.findIndex((candidate) => {
        const head = candidate[0];
        const tail = candidate[candidate.length - 1];
        return (
          (head[0] === last[0] && head[1] === last[1]) ||
          (tail[0] === last[0] && tail[1] === last[1])
        );
      });
      if (index === -1) break;
      const next = pool.splice(index, 1)[0];
      const head = next[0];
      if (head[0] === last[0] && head[1] === last[1]) ring.push(...next.slice(1));
      else ring.push(...next.slice(0, -1).reverse());
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (ring.length > 3 && first[0] === last[0] && first[1] === last[1]) rings.push(ring);
  }

  return rings;
}

function areaGeometry(element: OverpassElement): GeoJsonGeometry | null {
  if (element.type === "way") {
    const shape = line(element.geometry);
    if (!shape) return null;
    const closed = shape[0][0] === shape[shape.length - 1][0] && shape[0][1] === shape[shape.length - 1][1];
    return closed
      ? { type: "Polygon", coordinates: [simplify(shape, 0.0005)] }
      : { type: "LineString", coordinates: simplify(shape, 0.0005) };
  }

  if (element.type === "relation") {
    const outer = (element.members ?? [])
      .filter((member) => member.type === "way" && member.role !== "inner")
      .map((member) => line(member.geometry))
      .filter((value): value is [number, number][] => value !== null);
    if (outer.length === 0) return null;
    const rings = stitch(outer).map((ring) => simplify(ring, 0.0005));
    if (rings.length === 0) return { type: "MultiLineString", coordinates: outer };
    return rings.length === 1
      ? { type: "Polygon", coordinates: [rings[0]] }
      : { type: "MultiPolygon", coordinates: rings.map((ring) => [ring]) };
  }

  return null;
}

function kindOf(tags: Record<string, string>): string {
  if (tags.boundary === "national_park") return "Parque nacional";
  if (tags.leisure === "nature_reserve") return "Reserva natural";
  if (tags.boundary === "protected_area") return "Área protegida";
  return "Área protegida";
}

function convert(payload: OverpassPayload): Pick<OsmOverlays, "roads" | "protectedAreas"> {
  const byKind = new Map<string, [number, number][][]>();
  const areas: GeoCollection<ProtectedAreaProps>["features"] = [];

  for (const element of payload.elements ?? []) {
    const tags = element.tags ?? {};

    if (tags.highway) {
      const shape = line(element.geometry);
      if (!shape) continue;
      const kind = tags.highway;
      if (!byKind.has(kind)) byKind.set(kind, []);
      byKind.get(kind)?.push(simplify(shape, kind === "secondary" ? 0.0016 : 0.0008));
      continue;
    }

    const geometry = areaGeometry(element);
    if (!geometry) continue;
    areas.push({
      type: "Feature",
      properties: {
        name: tags.name ?? "Área protegida sin nombre",
        kind: kindOf(tags),
        protectClass: tags.protect_class ? Number(tags.protect_class) : null,
      },
      geometry,
    });
  }

  const roads = Array.from(byKind.entries()).map(([kind, lines]) => ({
    type: "Feature" as const,
    properties: { kind },
    geometry: { type: "MultiLineString" as const, coordinates: lines },
  }));

  return {
    roads: { type: "FeatureCollection", features: roads },
    protectedAreas: { type: "FeatureCollection", features: areas },
  };
}

function countCoordinates(overlays: Pick<OsmOverlays, "roads" | "protectedAreas">): number {
  let total = 0;
  for (const feature of overlays.roads.features) {
    if (feature.geometry.type === "MultiLineString") {
      for (const part of feature.geometry.coordinates) total += part.length;
    }
  }
  return total;
}

const SNAPSHOT_RADIUS_KM = 70;

/**
 * El snapshot del repositorio cubre la región demo. Se sirve directo para que
 * el mapa no espere a Overpass; fuera de esa región se consulta la API viva.
 */
function fromSnapshot(point: LatLon): OsmOverlays | null {
  if (distanceKm(point, DEMO_POINT) > SNAPSHOT_RADIUS_KM) return null;
  const snapshot = fallback as unknown as {
    roads: GeoCollection<RoadProps>;
    protectedAreas: GeoCollection<ProtectedAreaProps>;
    generatedAt: string;
  };
  return {
    roads: snapshot.roads,
    protectedAreas: snapshot.protectedAreas,
    fallback: false,
    mode: "snapshot",
    fetchedAt: snapshot.generatedAt,
  };
}

async function fetchOverpass(point: LatLon, radiusKm: number): Promise<OsmOverlays> {
  const [west, south, east, north] = bboxForRadius(point, radiusKm + 6);
  const bboxFilter = `(${south.toFixed(3)},${west.toFixed(3)},${north.toFixed(3)},${east.toFixed(3)})`;
  const query = `[out:json][timeout:30];
(
  way["highway"~"^(motorway|trunk|primary|secondary)$"]${bboxFilter};
  way["boundary"~"protected_area|national_park"]${bboxFilter};
  way["leisure"="nature_reserve"]${bboxFilter};
  relation["boundary"~"protected_area|national_park"]${bboxFilter};
  relation["leisure"="nature_reserve"]${bboxFilter};
);
out geom;`;

  let lastError: unknown = null;
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.1 (hackathon)" },
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Overpass ${response.status}`);
      const payload = (await response.json()) as OverpassPayload;
      const overlays = convert(payload);

      if (countCoordinates(overlays) > 80_000) {
        overlays.roads.features = overlays.roads.features.map((feature) =>
          feature.geometry.type === "MultiLineString"
            ? {
                ...feature,
                geometry: {
                  type: "MultiLineString",
                  coordinates: feature.geometry.coordinates.map((part) => simplify(part, 0.003)),
                },
              }
            : feature,
        );
      }

      return {
        ...overlays,
        fallback: false,
        mode: "live",
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Overpass no respondió");
}

export async function getOsmOverlays(point: LatLon, radiusKm: number): Promise<OsmOverlays> {
  const snapshot = fromSnapshot(point);
  if (snapshot) return snapshot;

  const key = `osm:${point.lat.toFixed(2)}:${point.lon.toFixed(2)}:${Math.round(radiusKm)}`;

  return cached(key, 24 * 60 * 60 * 1000, async () => {
    try {
      return await fetchOverpass(point, radiusKm);
    } catch {
      // Fuera de la región demo no hay snapshot: devolvemos capas vacías.
      return {
        roads: { type: "FeatureCollection", features: [] },
        protectedAreas: { type: "FeatureCollection", features: [] },
        fallback: true,
        mode: "empty" as const,
        fetchedAt: null,
      };
    }
  });
}
