import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/alerts/route";
import { getFireStats } from "@/lib/sources/gibs";
import { getOverlays } from "@/lib/sources/overlays";
import { getClimate } from "@/lib/sources/power";

vi.mock("@/lib/sources/gibs", () => ({ getFireStats: vi.fn() }));
vi.mock("@/lib/sources/power", () => ({ getClimate: vi.fn() }));
vi.mock("@/lib/sources/overlays", () => ({ getOverlays: vi.fn() }));

const request = (query: string) => new Request(`https://app.test/api/alerts?${query}`);
const pointQuery = "lat=9.93&lon=-84.08";
const empty = { type: "FeatureCollection" as const, features: [] };
const fire = {
  date: "2026-11-15", count: 0, nearestKm: null, maxFrp: null, points: [],
  available: true, fallback: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-15T12:00:00Z"));
  vi.mocked(getFireStats).mockResolvedValue(fire);
  vi.mocked(getClimate).mockResolvedValue({
    lastDate: "2026-11-12", rain30mm: 120, rain30Percentile: 98, daysSinceRain: 0,
    tMaxC: 24, rhPct: 88, windMs: 2, years: 40, source: "POWER", fallback: false,
  });
  vi.mocked(getOverlays).mockResolvedValue({
    data: {
      roads: empty, protectedAreas: empty, volcanoes: empty, borders: empty, alerts: [], seismic: [], sources: [],
    },
    fallbackSources: [],
  });
});
afterEach(() => vi.useRealTimers());

describe("GET /api/alerts · parámetros extra", () => {
  it("ignora tracking y claves raras sin romper el enlace compartido", async () => {
    const response = await GET(request(`${pointQuery}&utm_source=whatsapp&__proto__=x`));
    expect(response.status).toBe(200);
  });
});

describe("GET /api/alerts", () => {
  it.each([
    ["fire", "Foco de calor", "NASA FIRMS"],
    ["earthquake", "Sismo", "USGS"],
    ["volcano", "Volcán", "OVSICORI"],
    ["flood", "Inundación", "GDACS"],
    ["storm", "Tormenta", "NHC"],
  ])("simula %s sin red ni contaminación de datos reales", async (hazard, title, source) => {
    const response = await GET(request(`${pointQuery}&test=1&hazard=${hazard}`));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.data.alerts).toHaveLength(1);
    expect(body.data.alerts[0]).toMatchObject({
      kind: "test", id: `test:${hazard}:1794744000000`,
      createdAt: "2026-11-15T12:00:00.000Z",
    });
    expect(body.data.alerts[0].title).toContain(title);
    expect(body.data.alerts[0].title).toContain("[DEMO]");
    expect(body.data.alerts[0].source).toContain(source);
    expect(body.data.alerts[0].body).toContain("no implica peligro real");
    expect(body.meta.fallbackSources).toEqual([]);
    expect(getFireStats).not.toHaveBeenCalled();
    expect(getClimate).not.toHaveBeenCalled();
    expect(getOverlays).not.toHaveBeenCalled();
  });

  it.each(["fire", "earthquake", "volcano", "flood", "storm"])(
    "test=0 con hazard=%s consulta fuentes y no incluye DEMO", async (hazard) => {
      await GET(request(`${pointQuery}&test=1&hazard=${hazard}`));
      const response = await GET(request(`${pointQuery}&test=0&hazard=${hazard}`));
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).not.toContain("no-store");
      expect(body.data.alerts).toEqual([]);
      expect(getFireStats).toHaveBeenCalledTimes(1);
      expect(getClimate).toHaveBeenCalledTimes(1);
      expect(getOverlays).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    "", "lat=9.9", "lon=-84", "lat=&lon=", "lat=%20&lon=-84", "lat=NaN&lon=-84",
    "lat=91&lon=-84", "lat=10&lon=181", `${pointQuery}&radius=4`, `${pointQuery}&radius=101`,
    `${pointQuery}&radius=`, `${pointQuery}&test=true`, `${pointQuery}&hazard=meteorito`,
    `${pointQuery}&hazard=tsunami`, `${pointQuery}&hazard=`, `${pointQuery}&lat=0`,
  ])("rechaza parámetros inválidos: %s", async (query) => {
    const response = await GET(request(query));
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).error).toBe("Parámetros inválidos");
    expect(getFireStats).not.toHaveBeenCalled();
  });

  it("acepta cero explícito y conserva defaults", async () => {
    const response = await GET(request("lat=0&lon=0&test=1"));
    const { data } = await response.json();
    expect(response.status).toBe(200);
    expect(data.point).toEqual({ lat: 0, lon: 0 });
    expect(data.radiusKm).toBe(50);
    expect(data.alerts[0].id).toContain("test:fire:");
  });

  it("reporta todas las fuentes sin respuesta al vencer el presupuesto", async () => {
    vi.mocked(getFireStats).mockReturnValue(new Promise(() => {}));
    vi.mocked(getClimate).mockReturnValue(new Promise(() => {}));
    vi.mocked(getOverlays).mockReturnValue(new Promise(() => {}));
    const pending = GET(request(pointQuery));
    await vi.advanceTimersByTimeAsync(8_001);
    const response = await pending;
    const { data, meta } = await response.json();
    expect(response.status).toBe(200);
    expect(data.alerts).toEqual([]);
    expect(meta.fallback).toBe(true);
    expect(meta.fallbackSources).toEqual(expect.arrayContaining(["osm", "eonet", "gdacs", "seismic", "gibs", "power"]));
  });

  it("conserva una alerta oficial aunque GIBS y POWER fallen", async () => {
    vi.mocked(getFireStats).mockRejectedValue(new Error("falló"));
    vi.mocked(getClimate).mockRejectedValue(new Error("falló"));
    const overlays = await getOverlays({ lat: 9.93, lon: -84.08 }, 50);
    overlays.data.alerts = [{
      id: "event", source: "GDACS", category: "FL", categoryLabel: "Inundación",
      title: "Evento real", level: "orange", date: "2026-11-15T10:00:00Z",
      lat: 9.93, lon: -84.08, distanceKm: 0, url: "https://www.gdacs.org/",
    }];
    const { data, meta } = await (await GET(request(pointQuery))).json();
    expect(data.alerts).toHaveLength(1);
    expect(data.alerts[0]).toMatchObject({ kind: "official", title: "Evento real" });
    expect(meta.fallbackSources).toEqual(["gibs", "power"]);
  });
});
