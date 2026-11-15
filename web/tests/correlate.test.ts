import { describe, expect, it } from "vitest";

import { correlate } from "@/lib/correlate";
import type {
  DisasterAlert,
  FirePoint,
  GeoCollection,
  ProtectedAreaProps,
  RoadProps,
  VolcanoProps,
} from "@/lib/types";

const roads: GeoCollection<RoadProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { kind: "primary" },
      geometry: {
        type: "MultiLineString",
        coordinates: [
          [
            [-71.62, -33.0],
            [-71.6, -33.0],
          ],
        ],
      },
    },
  ],
};

const protectedAreas: GeoCollection<ProtectedAreaProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Parque de prueba", kind: "Parque nacional" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-71.56, -33.06],
            [-71.54, -33.06],
            [-71.54, -33.04],
            [-71.56, -33.04],
            [-71.56, -33.06],
          ],
        ],
      },
    },
  ],
};

const volcanoes: GeoCollection<VolcanoProps> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Volcán de prueba",
        country: "Chile",
        type: "Estratovolcán",
        elevation: 3000,
        lastEruption: 1900,
        url: null,
      },
      geometry: { type: "Point", coordinates: [-71.0, -33.0] },
    },
  ],
};

const fires: FirePoint[] = [
  { id: "a", lat: -33.0005, lon: -71.61, date: "2024-02-03" },
  { id: "b", lat: -33.05, lon: -71.55, date: "2024-02-03" },
  { id: "c", lat: -33.3, lon: -71.9, date: "2024-02-03" },
];

const alerts: DisasterAlert[] = [
  {
    id: "GDACS-WF-1",
    source: "GDACS",
    category: "WF",
    categoryLabel: "Incendio",
    title: "Incendio de prueba",
    level: "orange",
    date: "2026-11-01",
    lat: -33.1,
    lon: -71.6,
    distanceKm: 6,
    url: "https://example.com",
  },
  {
    id: "GDACS-VO-2",
    source: "GDACS",
    category: "VO",
    categoryLabel: "Volcán",
    title: "Volcán lejano",
    level: "green",
    date: "2026-11-01",
    lat: -36.8,
    lon: -71.4,
    distanceKm: 420,
    url: "https://example.com",
  },
];

const result = correlate({
  point: { lat: -33.047, lon: -71.612 },
  fires,
  roads,
  protectedAreas,
  volcanoes,
  alerts,
  radiusKm: 50,
  memoryMode: true,
});

describe("correlate", () => {
  it("cuenta focos cerca de caminos", () => {
    const roadsCorrelation = result.find((item) => item.kind === "roads");
    expect(roadsCorrelation?.value).toContain("1 de 3 detecciones");
    expect(roadsCorrelation?.tone).toBe("attention");
  });

  it("detecta focos dentro de áreas protegidas", () => {
    const protectedCorrelation = result.find((item) => item.kind === "protected");
    expect(protectedCorrelation?.value).toBe("1 de 3 detecciones");
    expect(protectedCorrelation?.items[0]).toEqual({
      name: "Parque de prueba",
      meta: "1 detección",
    });
  });

  it("calcula el volcán más cercano desde el punto y no desde el volcán", () => {
    const volcanoCorrelation = result.find((item) => item.kind === "volcano");
    expect(volcanoCorrelation?.value).toContain("Volcán de prueba");
    const km = Number(volcanoCorrelation?.value.match(/([\d.,]+) km/)?.[1].replace(",", "."));
    expect(km).toBeGreaterThan(50);
    expect(km).toBeLessThan(80);
  });

  it("separa alertas dentro del radio de las regionales", () => {
    const alertsCorrelation = result.find((item) => item.kind === "alerts");
    expect(alertsCorrelation?.value).toBe("1 dentro de 50 km");
    expect(alertsCorrelation?.items[0].meta).toContain("GDACS");
  });
});
