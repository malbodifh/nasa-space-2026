import { describe, expect, it } from "vitest";

import { mergeSeismic, parseOvsicori, parseUsgs } from "@/lib/seismic-parse";

const point = { lat: 10.635, lon: -85.4377 };
const now = Date.now();

const usgsPayload = {
  features: [
    {
      id: "us1",
      geometry: { coordinates: [-85.5, 10.7, 12] },
      properties: {
        mag: 4.4,
        place: "20 km N of Liberia, Costa Rica",
        time: now - 30.5 * 60 * 1000,
        url: "https://earthquake.usgs.gov/event/us1",
        status: "reviewed",
        type: "earthquake",
      },
    },
    {
      id: "us2",
      geometry: { coordinates: [-70.5, -33.5, 30] },
      properties: {
        mag: 5.2,
        place: "Chile",
        time: now - 60 * 60 * 1000,
        url: null,
        status: "reviewed",
        type: "earthquake",
      },
    },
    {
      id: "us3",
      geometry: { coordinates: [-85.5, 10.7, 10] },
      properties: {
        mag: 1.8,
        place: "Débil",
        time: now - 60 * 60 * 1000,
        url: null,
        status: "automatic",
        type: "earthquake",
      },
    },
  ],
};

const ovsicoriPayload = {
  features: [
    {
      id: "ov1",
      geometry: { coordinates: [-85.44, 10.64] },
      properties: {
        time: (now - 30 * 60 * 1000) / 1000,
        depthKm: 8.2,
        magnitudeValue: 4.1,
        evid: "ov2026abc",
        evaluationMode: "automatic",
        pueblo: "Liberia",
        canton: "Liberia",
        regionName: "Costa Rica",
      },
    },
    {
      id: "ov2",
      geometry: { coordinates: [-83.0, 9.0] },
      properties: {
        time: (now - 30 * 60 * 1000) / 1000,
        depthKm: 20,
        magnitudeValue: 2.0,
        evid: "ov2026def",
        evaluationMode: "automatic",
        pueblo: "Limón",
        canton: "Limón",
        regionName: "Costa Rica",
      },
    },
  ],
};

describe("seismic", () => {
  it("parsea USGS y descarta lejanos y de magnitud baja", () => {
    const events = parseUsgs(usgsPayload, point);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: "us1",
      source: "USGS",
      magnitude: 4.4,
      depthKm: 12,
      reviewed: true,
    });
    expect(events[0].place).toContain("Liberia");
  });

  it("parsea OVSICORI con nombre local y profundidad, incluidos los sismos pequeños", () => {
    const events = parseOvsicori(ovsicoriPayload, point);
    expect(events).toHaveLength(2);
    expect(events.map((event) => event.magnitude)).toContain(2);
    expect(events[0]).toMatchObject({
      id: "ov2026abc",
      source: "OVSICORI",
      magnitude: 4.1,
      depthKm: 8.2,
      place: "Liberia, Liberia",
      reviewed: false,
    });
  });

  it("prefiere la red local y descarta el duplicado de USGS", () => {
    const local = parseOvsicori(ovsicoriPayload, point);
    const global = parseUsgs(usgsPayload, point);
    const merged = mergeSeismic(local, global);
    expect(merged).toHaveLength(2);
    expect(merged.find((event) => event.magnitude === 4.1)?.source).toBe("OVSICORI");
  });

  it("mantiene los eventos globales que no duplican", () => {
    const local = parseOvsicori(ovsicoriPayload, point);
    const global = parseUsgs(usgsPayload, point).map((event) => ({
      ...event,
      id: "us-lejano",
      lat: 11.5,
      lon: -86.5,
      distanceKm: 200,
    }));
    const merged = mergeSeismic(local, global);
    expect(merged.some((event) => event.source === "USGS")).toBe(true);
  });
});
