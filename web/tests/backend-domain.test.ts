import { describe, expect, it, vi } from "vitest";

import { responseMeta } from "@/app/api/_lib/meta";
import { isCurrent, isOngoing, partitionCurrent } from "@/lib/alert-rules";
import { parseNhc, parsePtwc, rainAlert } from "@/lib/feeds-parse";
import { assessRisk, emptyFireStats } from "@/lib/risk";
import { parseOvsicori, parseUsgs, rsnTime } from "@/lib/seismic-parse";
import type { ClimateStats, DisasterAlert } from "@/lib/types";

const now = Date.parse("2026-11-15T12:00:00Z");
const point = { lat: 10, lon: -84 };
const alert = (date: string, source: DisasterAlert["source"] = "NASA EONET"): DisasterAlert => ({
  id: "x", source, category: "volcanoes", categoryLabel: "Volcán", title: "Evento",
  level: "red", date, lat: 10, lon: -84, distanceKm: 0, url: "https://example.test",
});

describe("BUG-API-3 fechas y fuente principal", () => {
  it.each(["", "null", "no-date", "2026-02-31", "2026-11-16T12:00:00Z"])(
    "fecha inválida/futura no está vigente ni en curso: %s", (date) => {
      for (const source of ["NASA EONET", "NHC", "Open-Meteo"] as const) {
        expect(isCurrent(alert(date, source), now)).toBe(false);
        expect(isOngoing(alert(date, source), now)).toBe(false);
      }
    },
  );
  it("una fecha desconocida se explica en historial", () => {
    const { current, stale } = partitionCurrent([alert("")], now);
    expect(current).toEqual([]);
    expect(stale[0].detail).toContain("Fecha del reporte desconocida");
  });
  it("POWER sin GIBS no produce score ni atribuye una observación a GIBS", () => {
    const climate: ClimateStats = {
      lastDate: "2026-11-12", rain30mm: 0, rain30Percentile: 0, daysSinceRain: 40,
      windMs: 15, rhPct: 10, tMaxC: 35, years: 40, source: "POWER", fallback: false,
    };
    const risk = assessRisk(emptyFireStats("2026-11-15"), climate, 50);
    expect(risk).toMatchObject({ level: "info", score: 0, confidence: "low" });
    expect(risk.sources.some((source) => source.name.includes("GIBS"))).toBe(false);
    expect(risk.sources.some((source) => source.name.includes("POWER"))).toBe(true);
    expect(risk.reasons[0].value).toContain("no se calcula un score");
  });
  it("PTWC no transforma coordenadas ausentes en 0,0 ni inventa fecha", () => {
    expect(parsePtwc("<entry><title>X</title></entry>", { lat: 0, lon: 0 })).toEqual([]);
    const [parsed] = parsePtwc("<entry><geo:lat>10</geo:lat><geo:long>-84</geo:long></entry>", point);
    expect(parsed.date).toBe("");
  });
  it("NHC no inventa hora del reporte si falta lastUpdate", () => {
    const [parsed] = parseNhc({ activeStorms: [
      { id: "a", name: "Test", classification: "HU", latitudeNumeric: 10, longitudeNumeric: -84 },
    ] }, point);
    expect(parsed.date).toBe("");
    expect(isCurrent(parsed, now)).toBe(false);
  });
  it("el pronóstico enlaza Open-Meteo, no se atribuye al IMN", () => {
    const forecast = rainAlert({
      hourly: {
        time: Array.from({ length: 24 }, (_, hour) => new Date(now + hour * 3_600_000).toISOString()),
        precipitation: Array(24).fill(5),
      },
    }, point, new Date(now));
    expect(forecast).toMatchObject({
      source: "Open-Meteo", quality: "pronóstico", url: "https://open-meteo.com/en/docs",
    });
    expect(forecast?.detail).toContain("no es un aviso oficial del IMN");
  });
  it("RSN rechaza calendarios y horas imposibles", () => {
    expect(rsnTime("31 de febrero del 2026", "10:00 am")).toBeNull();
    expect(rsnTime("15 de noviembre del 2026", "13:00 pm")).toBeNull();
    expect(rsnTime("15 de noviembre del 2026", "10:60 am")).toBeNull();
  });
  it("un sismo sin coordenadas o con fecha inválida no contamina la lista", () => {
    const feature = { id: "x", properties: { time: "bad", mag: 4, magnitudeValue: 4 }, geometry: { coordinates: [] } };
    expect(parseUsgs({ features: [feature] }, point)).toEqual([]);
    expect(parseOvsicori({ features: [feature] }, point, now)).toEqual([]);
  });
});

describe("BUG-API-4 metadata sin inventar observaciones", () => {
  it("no usa la hora de respuesta como fecha del dato ausente", () => {
    const meta = responseMeta(Date.now(), ["", "invalid", null], true);
    expect(meta.dataUpdatedAt).toBeNull();
    expect(meta.latencySeconds).toBeNull();
    expect(meta.requestedAt).toBeDefined();
    expect(meta.fallback).toBe(true);
  });
  it("usa el dato más reciente para medir frescura, no el más viejo del historial", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T00:00:00.000Z"));
    try {
      const meta = responseMeta(Date.now(), ["2026-01-01", "2026-02-01"], false);
      expect(meta.dataUpdatedAt).toBe("2026-02-01T00:00:00.000Z");
      // 28 días desde el dato más nuevo, no 59 desde el más antiguo.
      expect(meta.latencySeconds).toBe(28 * 24 * 60 * 60);
      expect(meta.updatedAt).not.toBe(meta.dataUpdatedAt);
    } finally {
      vi.useRealTimers();
    }
  });
});
