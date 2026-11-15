import { describe, expect, it } from "vitest";

import { computeClimate, daysSinceRain, percentileRank } from "@/lib/stats";
import type { DailySeries } from "@/lib/types";

function makeSeries(years: number): DailySeries[] {
  const series: DailySeries[] = [];
  for (let year = 2020; year < 2020 + years; year += 1) {
    for (let day = 0; day < 365; day += 1) {
      const date = new Date(Date.UTC(year, 0, 1 + day));
      const iso = date.toISOString().slice(0, 10);
      const rain = day > 350 ? 2 : 0;
      series.push({
        date: iso,
        precip: rain,
        tMax: 20,
        rh: 60,
        wind: 3,
      });
    }
  }
  return series;
}

describe("stats", () => {
  it("calcula el percentil empírico", () => {
    expect(percentileRank([1, 2, 3, 4, 5], 3)).toBe(60);
    expect(percentileRank([], 3)).toBe(0);
  });

  it("cuenta días desde la última lluvia", () => {
    const series: DailySeries[] = [
      { date: "2026-11-01", precip: 5 },
      { date: "2026-11-02", precip: 0 },
      { date: "2026-11-03", precip: 0 },
      { date: "2026-11-04", precip: 0 },
    ];
    expect(daysSinceRain(series)).toBe(3);
  });

  it("devuelve null con menos de 30 días", () => {
    expect(computeClimate([{ date: "2026-11-01", precip: 0 }])).toBeNull();
  });

  it("calcula lluvia de 30 días y años históricos", () => {
    const climate = computeClimate(makeSeries(3));
    expect(climate).not.toBeNull();
    expect(climate?.rain30mm).toBeGreaterThan(0);
    expect(climate?.years).toBeGreaterThan(0);
    expect(climate?.source).toBe("POWER");
  });
});
