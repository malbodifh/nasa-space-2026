import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET as assess } from "@/app/api/assess/route";
import { GET as events } from "@/app/api/events/route";
import { GET as search } from "@/app/api/nisar/search/route";
import { GET as overlays } from "@/app/api/overlays/route";
import { fetchLimited } from "@/app/api/_lib/remote";
import { getEvents } from "@/lib/sources/overlays";

vi.mock("@/app/api/_lib/remote", () => ({
  fetchLimited: vi.fn(async () => ({
    status: 200, bytes: new TextEncoder().encode('{"feed":{"entry":[]}}'),
  })),
}));
vi.mock("@/lib/sources/gibs", () => ({
  getFireStats: vi.fn(async (_point, _radius, date) => ({
    date, count: 0, nearestKm: null, maxFrp: null, points: [], available: false, fallback: true,
  })),
}));
vi.mock("@/lib/sources/power", () => ({ getClimate: vi.fn(async () => { throw new Error("offline"); }) }));
vi.mock("@/lib/sources/overlays", () => ({
  getEvents: vi.fn(async () => ({ alerts: [], history: [], fallbackSources: [], sources: [] })),
  getOverlays: vi.fn(async () => ({
    data: {
      roads: { type: "FeatureCollection", features: [] },
      protectedAreas: { type: "FeatureCollection", features: [] },
      volcanoes: { type: "FeatureCollection", features: [] },
      borders: { type: "FeatureCollection", features: [] },
      alerts: [], seismic: [], sources: [],
    },
    fallbackSources: [],
  })),
}));

beforeEach(() => vi.clearAllMocks());
const handlers = { assess, events, search, overlays };

describe.each(Object.entries(handlers))("parámetros extra /api/%s", (name, handler) => {
  // Un enlace compartido con ?utm_source=… no debe romper la consulta.
  it("ignora parámetros desconocidos sin depender de la red", async () => {
    const response = await handler(
      new Request(`https://app.test/api/${name}?lat=9.9&lon=-84.1&utm_source=whatsapp&fbclid=x`),
    );
    expect(response.status).toBe(200);
  });
});

describe.each(Object.entries(handlers))("validación /api/%s", (name, handler) => {
  it.each([
    "", "lat=&lon=", "lat=9.9", "lon=-84.1", "lat=%20&lon=-84.1",
    "lat=null&lon=-84.1", "lat=9.9&lon=NaN", "lat=91&lon=0", "lat=0&lon=-181",
    "lat=9.9&lon=-84.1&lat=0",
  ])("no consulta fuentes con %s", async (query) => {
    const response = await handler(new Request(`https://app.test/api/${name}?${query}`));
    expect(response.status).toBe(400);
    expect(fetchLimited).not.toHaveBeenCalled();
  });
});

describe("/api/assess fechas", () => {
  it.each(["2026-02-29", "2026-02-31", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "2026-1-1"])(
    "rechaza fecha inexistente %s", async (date) => {
      const response = await assess(new Request(`https://app.test/api/assess?lat=10&lon=-84&date=${date}`));
      expect(response.status).toBe(400);
    },
  );
  it("acepta un 29 de febrero bisiesto y declara sin dato principal", async () => {
    const response = await assess(new Request("https://app.test/api/assess?lat=10&lon=-84&date=2024-02-29"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.memory.date).toBe("2024-02-29");
    expect(body.data.risk.level).toBe("info");
    expect(body.meta.fallback).toBe(true);
  });
});

it("events distingue el conteo recibido del visible tras filtros", async () => {
  vi.mocked(getEvents).mockResolvedValueOnce({
    alerts: [], history: [], fallbackSources: [],
    sources: [{ id: "eonet", label: "NASA EONET", ok: true, count: 3, latest: "2026-05-30" }],
  });
  const response = await events(new Request("https://app.test/api/events?lat=10&lon=-84"));
  const { meta } = await response.json();
  expect(meta.sources[0]).toMatchObject({ count: 3, visibleCount: 0 });
  expect(meta.dataUpdatedAt).toBe("2026-05-30T00:00:00.000Z");
});
