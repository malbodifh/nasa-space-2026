import circle from "@turf/circle";
import distance from "@turf/distance";
import type { GeoJsonGeometry, LatLon } from "./types";

export function distanceKm(a: LatLon, b: LatLon): number {
  return distance([a.lon, a.lat], [b.lon, b.lat], { units: "kilometers" });
}

export function bboxForRadius(point: LatLon, radiusKm: number): [number, number, number, number] {
  const latDelta = radiusKm / 111.32;
  const lonDelta = radiusKm / (111.32 * Math.max(Math.cos((point.lat * Math.PI) / 180), 0.05));
  return [
    Math.max(-180, point.lon - lonDelta),
    Math.max(-89.9, point.lat - latDelta),
    Math.min(180, point.lon + lonDelta),
    Math.min(89.9, point.lat + latDelta),
  ];
}

export function circlePolygon(point: LatLon, radiusKm: number) {
  return circle([point.lon, point.lat], radiusKm, {
    steps: 64,
    units: "kilometers",
  });
}

function pointInRing(lon: number, lat: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = yi > lat !== yj > lat;
    if (crosses && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function pointInGeometry(
  point: LatLon,
  geometry: GeoJsonGeometry,
): boolean {
  if (geometry.type === "Polygon") {
    const [outer, ...holes] = geometry.coordinates;
    if (!outer || !pointInRing(point.lon, point.lat, outer)) return false;
    return !holes.some((hole) => pointInRing(point.lon, point.lat, hole));
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) => {
      const [outer, ...holes] = polygon;
      if (!outer || !pointInRing(point.lon, point.lat, outer)) return false;
      return !holes.some((hole) => pointInRing(point.lon, point.lat, hole));
    });
  }
  return false;
}

/** Distancia mínima en km de un punto a una línea o polígono, en proyección local. */
export function distanceToGeometryKm(point: LatLon, geometry: GeoJsonGeometry): number | null {
  const lines: [number, number][][] = [];
  if (geometry.type === "LineString") lines.push(geometry.coordinates);
  if (geometry.type === "MultiLineString") lines.push(...geometry.coordinates);
  if (geometry.type === "Polygon") lines.push(...geometry.coordinates);
  if (geometry.type === "MultiPolygon") lines.push(...geometry.coordinates.flat());
  if (shapeHasPoint(geometry) && pointInGeometry(point, geometry)) return 0;
  if (lines.length === 0) return null;

  const kx = 111.32 * Math.cos((point.lat * Math.PI) / 180);
  const ky = 110.57;
  let best = Number.POSITIVE_INFINITY;

  for (const line of lines) {
    for (let i = 1; i < line.length; i += 1) {
      const ax = (line[i - 1][0] - point.lon) * kx;
      const ay = (line[i - 1][1] - point.lat) * ky;
      const bx = (line[i][0] - point.lon) * kx;
      const by = (line[i][1] - point.lat) * ky;
      const dx = bx - ax;
      const dy = by - ay;
      const lengthSq = dx * dx + dy * dy;
      const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSq));
      const x = ax + dx * t;
      const y = ay + dy * t;
      best = Math.min(best, Math.hypot(x, y));
    }
  }

  return Number.isFinite(best) ? best : null;
}

function shapeHasPoint(geometry: GeoJsonGeometry): boolean {
  return geometry.type === "Polygon" || geometry.type === "MultiPolygon";
}

export function geometryBBox(geometry: GeoJsonGeometry): [number, number, number, number] {
  let west = 180;
  let south = 90;
  let east = -180;
  let north = -90;

  const visit = (coords: unknown): void => {
    if (!Array.isArray(coords) || coords.length === 0) return;
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      const [lon, lat] = coords as [number, number];
      west = Math.min(west, lon);
      east = Math.max(east, lon);
      south = Math.min(south, lat);
      north = Math.max(north, lat);
      return;
    }
    for (const item of coords) visit(item);
  };

  visit(geometry.coordinates);
  return [west, south, east, north];
}

