import { describe, expect, it } from "vitest";

import { bboxForRadius, circlePolygon, distanceKm, pointInGeometry } from "@/lib/geo";

describe("geo", () => {
  it("calcula la distancia Valparaíso–Santiago en un rango razonable", () => {
    const km = distanceKm({ lat: -33.047, lon: -71.612 }, { lat: -33.45, lon: -70.65 });
    expect(km).toBeGreaterThan(80);
    expect(km).toBeLessThan(130);
  });

  it("genera un bbox que contiene el punto", () => {
    const [west, south, east, north] = bboxForRadius({ lat: -33.047, lon: -71.612 }, 50);
    expect(west).toBeLessThan(-71.612);
    expect(east).toBeGreaterThan(-71.612);
    expect(south).toBeLessThan(-33.047);
    expect(north).toBeGreaterThan(-33.047);
  });

  it("genera un polígono cerrado de radio", () => {
    const polygon = circlePolygon({ lat: -33.047, lon: -71.612 }, 25);
    expect(polygon.geometry.type).toBe("Polygon");
    const ring = polygon.geometry.coordinates[0];
    expect(ring.length).toBeGreaterThan(10);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it("detecta puntos dentro y fuera de un polígono", () => {
    const square = {
      type: "Polygon" as const,
      coordinates: [
        [
          [-72, -34],
          [-71, -34],
          [-71, -33],
          [-72, -33],
          [-72, -34],
        ] as [number, number][],
      ],
    };

    expect(pointInGeometry({ lat: -33.5, lon: -71.5 }, square)).toBe(true);
    expect(pointInGeometry({ lat: -32.5, lon: -71.5 }, square)).toBe(false);
    expect(pointInGeometry({ lat: -33.5, lon: -70.5 }, square)).toBe(false);
  });
});
