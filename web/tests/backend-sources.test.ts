import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getEonetAlerts, getEonetHistory } from "@/lib/sources/eonet";
import { getFires, getRainForecast, getStorms, getTsunamiBulletins } from "@/lib/sources/feeds";
import { getGdacsAlerts } from "@/lib/sources/gdacs";
import { getOsmOverlays } from "@/lib/sources/overpass";
import { dedupe, getEvents, getOverlays } from "@/lib/sources/overlays";
import { getSeismic } from "@/lib/sources/seismic";
import type { DisasterAlert } from "@/lib/types";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/sources/eonet", () => ({ getEonetAlerts: vi.fn(), getEonetHistory: vi.fn() }));
vi.mock("@/lib/sources/feeds", () => ({
  getFires: vi.fn(), getRainForecast: vi.fn(), getStorms: vi.fn(), getTsunamiBulletins: vi.fn(),
}));
vi.mock("@/lib/sources/gdacs", () => ({ getGdacsAlerts: vi.fn() }));
vi.mock("@/lib/sources/seismic", () => ({ getSeismic: vi.fn() }));
vi.mock("@/lib/sources/overpass", () => ({ getOsmOverlays: vi.fn() }));
vi.mock("@/lib/sources/static-overlays", () => ({
  getVolcanoes: () => ({ collection: { type: "FeatureCollection", features: [] } }),
  getBorders: () => ({ type: "FeatureCollection", features: [] }),
}));

const point = { lat: 10, lon: -84 };
const alert = (overrides: Partial<DisasterAlert> = {}): DisasterAlert => ({
  id: "x", source: "USGS", category: "earthquakes", categoryLabel: "Sismo", title: "Evento",
  date: "2026-11-15T11:00:00Z", level: "orange", lat: 10, lon: -84,
  distanceKm: 0, url: "https://example.test/", ...overrides,
});
const empty = { type: "FeatureCollection" as const, features: [] };

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-15T12:00:00Z"));
  for (const fn of [getEonetAlerts, getEonetHistory, getGdacsAlerts, getRainForecast, getStorms, getTsunamiBulletins]) {
    vi.mocked(fn).mockResolvedValue([]);
  }
  vi.mocked(getSeismic).mockResolvedValue({
    events: [], local: 0, global: 0, rsn: 0, fallback: false, failed: [],
    latest: { USGS: null, OVSICORI: null, RSN: null }, ovsicoriGeneratedAt: null,
  });
  vi.mocked(getOsmOverlays).mockResolvedValue({
    roads: empty, protectedAreas: empty, fallback: false, mode: "snapshot", fetchedAt: "2026-11-14",
  });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("BUG-API-5 deduplicación conservadora", () => {
  it("no borra un sismo cercano por un GDACS de otro mes", () => {
    const merged = dedupe([
      alert({ id: "old", source: "GDACS", category: "EQ", date: "2026-10-09T11:00:00Z" }),
      alert({ id: "new" }),
    ]);
    expect(merged.map((event) => event.id)).toEqual(["old", "new"]);
  });
  it("une fuentes del mismo sismo en 40km/5min y conserva confirmación/revisión", () => {
    const merged = dedupe([
      alert({ id: "first", quality: "preliminar" }),
      alert({ id: "other", source: "GDACS", category: "EQ", lat: 10.1, date: "2026-11-15T11:04:00Z", quality: "revisado" }),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ id: "first", alsoReportedBy: ["GDACS"], quality: "revisado" });
  });
  it("no fusiona reportes independientes de una misma fuente ni fechas desconocidas", () => {
    expect(dedupe([alert({ id: "a" }), alert({ id: "b" })])).toHaveLength(2);
    expect(dedupe([alert({ date: "" }), alert({ source: "GDACS", category: "EQ" })])).toHaveLength(2);
  });
});

describe("fuentes parciales", () => {
  it("una fuente colgada no borra las otras ni aparece OK", async () => {
    vi.mocked(getEonetAlerts).mockReturnValue(new Promise(() => {}));
    vi.mocked(getGdacsAlerts).mockResolvedValue([alert({ source: "GDACS", category: "EQ" })]);
    const pending = getEvents(point);
    await vi.advanceTimersByTimeAsync(6_001);
    const result = await pending;
    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].source).toBe("GDACS");
    expect(result.fallbackSources).toEqual(["eonet"]);
    expect(result.sources.find((source) => source.id === "eonet")).toMatchObject({ ok: false, latest: null });
    expect(getFires).not.toHaveBeenCalled();
  });
  it("mantiene incendios ocultos también en /api/overlays", async () => {
    vi.mocked(getEonetAlerts).mockResolvedValue([alert({ source: "NASA EONET", category: "wildfires" })]);
    vi.mocked(getGdacsAlerts).mockResolvedValue([alert({ source: "GDACS", category: "WF" })]);
    expect((await getEvents(point)).alerts).toEqual([]);
    expect((await getOverlays(point, 50)).data.alerts).toEqual([]);
    expect(getFires).not.toHaveBeenCalled();
  });
  it("propaga redes sísmicas caídas aunque otras respondan", async () => {
    const seismic = await getSeismic(point);
    seismic.failed = ["USGS"];
    const result = await getOverlays(point, 50);
    expect(result.fallbackSources).toContain("usgs");
    expect(result.data.sources.find((source) => source.id === "usgs")?.fallback).toBe(true);
    expect(result.data.sources.find((source) => source.id === "ovsicori")?.fallback).toBe(false);
  });
  it("overlays no devuelve como vigente una alerta oficial sin fecha", async () => {
    vi.mocked(getGdacsAlerts).mockResolvedValue([alert({ date: "", source: "GDACS" })]);
    expect((await getOverlays(point, 50)).data.alerts).toEqual([]);
  });
  it("una red sísmica lenta no descarta los sismos ya recibidos de USGS", async () => {
    const actual = await vi.importActual<typeof import("@/lib/sources/seismic")>("@/lib/sources/seismic");
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("usgs")) return Response.json({ features: [{
        id: "kept", geometry: { coordinates: [-84, 10, 10] },
        properties: { mag: 4.1, time: Date.parse("2026-11-15T11:00:00Z"), type: "earthquake", status: "reviewed" },
      }] });
      if (url.includes("ovsicori")) return Response.json({ features: [] });
      return new Promise(() => {});
    }));
    const pending = actual.getSeismic({ lat: 10.01, lon: -84.01 });
    await vi.advanceTimersByTimeAsync(5_501);
    const result = await pending;
    expect(result.events).toHaveLength(1);
    expect(result.failed).toEqual(["RSN"]);
    expect(result.latest.RSN).toBeNull();
    expect(result.latest.USGS).toBe("2026-11-15T11:00:00.000Z");
  });
  it("no expone una clave FIRMS en errores o logs públicos", async () => {
    const actual = await vi.importActual<typeof import("@/lib/sources/feeds")>("@/lib/sources/feeds");
    vi.stubEnv("FIRMS_MAP_KEY", "FAKE_TEST_KEY_NOT_A_SECRET");
    vi.stubGlobal("fetch", vi.fn(async (url) => { throw new Error(`Falló ${url}`); }));
    const logger = vi.spyOn(console, "info");
    await expect(actual.getFires({ lat: 10.02, lon: -84.02 })).rejects.toThrow("FIRMS no respondió");
    expect(JSON.stringify(logger.mock.calls)).not.toContain("FAKE_TEST_KEY");
    logger.mockRestore();
  });
});
