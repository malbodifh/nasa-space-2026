import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withCacheTracking } from "@/lib/cache";
import { getEonetAlerts, getEonetHistory } from "@/lib/sources/eonet";
import { getOsmOverlays } from "@/lib/sources/overpass";
import { getSeismic } from "@/lib/sources/seismic";
import { getGdacsAlerts } from "@/lib/sources/gdacs";
import { getFires, getRainForecast, getStorms, getTsunamiBulletins } from "@/lib/sources/feeds";
import { getFireStats } from "@/lib/sources/gibs";
import { getClimate } from "@/lib/sources/power";
import { DEFAULT_MEMORY_DATE, DEMO_POINT } from "@/lib/demo";
import { distanceKm } from "@/lib/geo";

vi.mock("server-only", () => ({}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-15T12:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("regresiones de caché en fuentes", () => {
  it("GIBS recalcula distancias y respeta el radio manteniendo el fallback", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 404 })));
    const firstPoint = { lat: 10.6301, lon: DEMO_POINT.lon };
    const secondPoint = { lat: 10.6349, lon: DEMO_POINT.lon };
    expect(firstPoint.lat.toFixed(2)).toBe(secondPoint.lat.toFixed(2));
    const first = await getFireStats(firstPoint, 25, DEFAULT_MEMORY_DATE);
    const second = await getFireStats(secondPoint, 25, DEFAULT_MEMORY_DATE);
    expect(first.fallback).toBe(true);
    expect(second.fallback).toBe(true);
    expect(first.count).toBeGreaterThan(0);
    expect(second.count).toBeGreaterThan(0);
    expect(first.nearestKm).not.toBe(second.nearestKm);
    for (const fire of second.points) {
      expect(fire.distanceKm).toBe(Math.round(distanceKm(secondPoint, fire) * 10) / 10);
    }
    const smaller = await getFireStats(secondPoint, 1, DEFAULT_MEMORY_DATE);
    expect(smaller).toMatchObject({ count: 0, nearestKm: null, available: true, fallback: true });
  });

  it("POWER no comparte fallback entre puntos a ambos lados del límite de 30 km", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    const kmPerDegree = distanceKm(DEMO_POINT, { lat: DEMO_POINT.lat + 1, lon: DEMO_POINT.lon });
    const inside = { lat: DEMO_POINT.lat + 29.99 / kmPerDegree, lon: DEMO_POINT.lon };
    const outside = { lat: DEMO_POINT.lat + 30.01 / kmPerDegree, lon: DEMO_POINT.lon };
    expect(inside.lat.toFixed(2)).toBe(outside.lat.toFixed(2));
    expect(distanceKm(inside, DEMO_POINT)).toBeLessThan(30);
    expect(distanceKm(outside, DEMO_POINT)).toBeGreaterThan(30);
    expect(await getClimate(inside)).toMatchObject({ source: "POWER_FALLBACK", fallback: true });
    await expect(getClimate(outside)).rejects.toThrow("POWER 503");
  });

  it.each([
    {
      name: "GDACS", getAlerts: getGdacsAlerts,
      response: () => Response.json({ features: [{
        geometry: { coordinates: [-84, 9.56] },
        properties: { eventtype: "EQ", eventid: 1, datemodified: "2026-11-15T11:00:00Z" },
      }] }),
    },
    {
      name: "NHC", getAlerts: getStorms,
      response: () => Response.json({ activeStorms: [{
        id: "near", name: "Test", classification: "HU", latitudeNumeric: 9.56, longitudeNumeric: -84,
      }] }),
    },
    {
      name: "PTWC", getAlerts: getTsunamiBulletins,
      response: () => new Response("<feed><entry><id>near</id><geo:lat>9.56</geo:lat><geo:long>-84</geo:long></entry></feed>"),
    },
    {
      name: "FIRMS", getAlerts: getFires,
      response: () => new Response(
        "latitude,longitude,confidence,frp,daynight,acq_date,acq_time,satellite\n" +
        "9.56,-84,h,40,D,2026-11-15,1000,N20\n9.56,-84,h,40,D,2026-11-15,1100,N21",
      ),
    },
  ])("$name no comparte distancias entre puntos de la misma décima", async ({ getAlerts, response }) => {
    vi.stubEnv("FIRMS_MAP_KEY", "FAKE_TEST_KEY");
    vi.spyOn(console, "info").mockImplementation(() => {});
    const fetcher = vi.fn(async () => response());
    vi.stubGlobal("fetch", fetcher);
    const first = await getAlerts({ lat: 10.049, lon: -84 });
    const calls = fetcher.mock.calls.length;
    const second = await getAlerts({ lat: 10.001, lon: -84 });
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(first[0].distanceKm).toBeGreaterThan(50);
    expect(second[0].distanceKm).toBeLessThan(50);
    expect(fetcher.mock.calls.length).toBe(calls * 2);
    expect(await getAlerts({ lat: 10.001, lon: -84 })).toEqual(second);
    expect(fetcher.mock.calls.length).toBe(calls * 2);
  });

  it("lluvia conserva las coordenadas exactas y no reutiliza otro pronóstico de la centésima", async () => {
    const fetcher = vi.fn<typeof fetch>(async (url) => Response.json({ hourly: {
      time: ["2026-11-15T12:00:00Z"],
      precipitation: [Number(new URL(String(url)).searchParams.get("latitude")) > 10.003 ? 100 : 50],
    } }));
    vi.stubGlobal("fetch", fetcher);
    const first = await getRainForecast({ lat: 10.0049, lon: -84 });
    const second = await getRainForecast({ lat: 10.0001, lon: -84 });
    expect(first[0]).toMatchObject({ lat: 10.0049, lon: -84, level: "orange" });
    expect(second[0]).toMatchObject({ lat: 10.0001, lon: -84, level: "info" });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("Overpass distingue punto y radio exactos para la geometría consultada", async () => {
    const fetcher = vi.fn(async () => Response.json({ elements: [] }));
    vi.stubGlobal("fetch", fetcher);
    await getOsmOverlays({ lat: 40.0049, lon: -3 }, 25.1);
    await getOsmOverlays({ lat: 40.0001, lon: -3 }, 25.1);
    await getOsmOverlays({ lat: 40.0001, lon: -3 }, 25.2);
    expect(fetcher).toHaveBeenCalledTimes(3);
    await getOsmOverlays({ lat: 40.0001, lon: -3 }, 25.2);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("calcula la distancia sísmica para cada punto aunque compartan décima", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("usgs")) return Response.json({ features: [{
        id: "near", geometry: { coordinates: [-84, 9.56, 10] },
        properties: { mag: 4.1, time: Date.now() - 1_000, type: "earthquake" },
      }] });
      return url.includes("ovsicori") ? Response.json({ features: [] }) : new Response("<rss/>");
    }));
    const first = await getSeismic({ lat: 10.049, lon: -84 });
    const second = await getSeismic({ lat: 10.001, lon: -84 });
    expect(first.events[0].distanceKm).toBeGreaterThan(50);
    expect(second.events[0].distanceKm).toBeLessThan(50);
  });

  it.each([getEonetAlerts, getEonetHistory])("EONET usa oeste,norte,este,sur y distancias por punto (%#)", async (getAlerts) => {
    const fetcher = vi.fn<typeof fetch>(async () => Response.json({ events: [{
      id: "near", title: "Volcano", categories: [{ id: "volcanoes" }], sources: [],
      geometry: [{ date: "2026-11-15T11:00:00Z", type: "Point", coordinates: [-84, 9.56] }],
    }] }));
    vi.stubGlobal("fetch", fetcher);
    const first = await getAlerts({ lat: 10.049, lon: -84 });
    const second = await getAlerts({ lat: 10.001, lon: -84 });
    expect(first[0].distanceKm).toBeGreaterThan(50);
    expect(second[0].distanceKm).toBeLessThan(50);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const [west, north, east, south] = new URL(String(fetcher.mock.calls[0][0])).searchParams.get("bbox")!.split(",").map(Number);
    expect(west).toBeLessThan(east);
    expect(south).toBeLessThan(north);
    expect(north).toBeGreaterThan(10);
    expect(south).toBeLessThan(10);
  });

  it("Overpass reintenta tras vacío y conserva el último dato bueno al fallar", async () => {
    const point = { lat: 40, lon: -3 };
    const fetcher = vi.fn(async () => new Response("", { status: 503 }));
    vi.stubGlobal("fetch", fetcher);
    expect((await getOsmOverlays(point, 25)).mode).toBe("empty");
    expect(fetcher).toHaveBeenCalledTimes(2);
    fetcher.mockImplementation(async () => Response.json({ elements: [{
      type: "way", id: 1, tags: { highway: "primary" },
      geometry: [{ lat: 40, lon: -3 }, { lat: 40.01, lon: -3.01 }],
    }] }));
    const good = await getOsmOverlays(point, 25);
    expect(good.mode).toBe("live");
    expect(good.roads.features).toHaveLength(1);
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);
    fetcher.mockImplementation(async () => new Response("", { status: 503 }));
    const failed = await withCacheTracking(() => getOsmOverlays(point, 25));
    expect(failed.value).toEqual(good);
    expect(failed.stale).toBe(true);
    const calls = fetcher.mock.calls.length;
    expect((await withCacheTracking(() => getOsmOverlays(point, 25))).stale).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(calls);
    vi.advanceTimersByTime(60_001);
    await getOsmOverlays(point, 25);
    expect(fetcher).toHaveBeenCalledTimes(calls + 2);
  });
});
