import { describe, expect, it } from "vitest";

import { assessRisk, emptyFireStats } from "@/lib/risk";
import type { ClimateStats, FireStats } from "@/lib/types";

const dryClimate: ClimateStats = {
  lastDate: "2026-11-11",
  rain30mm: 2,
  rain30Percentile: 5,
  daysSinceRain: 40,
  tMaxC: 31,
  rhPct: 18,
  windMs: 9,
  years: 40,
  source: "POWER",
  fallback: false,
};

const wetClimate: ClimateStats = {
  lastDate: "2026-11-11",
  rain30mm: 120,
  rain30Percentile: 98,
  daysSinceRain: 0,
  tMaxC: 16,
  rhPct: 88,
  windMs: 2,
  years: 40,
  source: "POWER",
  fallback: false,
};

function fireAt(distanceKm: number): FireStats {
  return {
    date: "2026-11-14",
    count: 1,
    nearestKm: distanceKm,
    maxFrp: 120,
    points: [],
    available: true,
    fallback: false,
  };
}

describe("risk", () => {
  it("devuelve info cuando no hay datos", () => {
    const risk = assessRisk(emptyFireStats("2026-11-14"), null, 50);
    expect(risk.level).toBe("info");
    expect(risk.score).toBe(0);
    expect(risk.confidence).toBe("low");
  });

  it("sube a alto con un foco cercano", () => {
    const risk = assessRisk(fireAt(5), dryClimate, 50);
    expect(["high", "extreme"]).toContain(risk.level);
    expect(risk.score).toBeGreaterThanOrEqual(50);
    expect(risk.reasons.length).toBeLessThanOrEqual(3);
  });

  it("queda bajo con clima húmedo y sin focos", () => {
    const risk = assessRisk(emptyFireStats("2026-11-14"), wetClimate, 50);
    expect(["low", "moderate"]).toContain(risk.level);
    expect(risk.score).toBeLessThan(50);
  });
});
