import type { ClimateStats, DailySeries } from "./types";

export function percentileRank(values: number[], value: number): number {
  const valid = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (valid.length === 0) return 0;
  const below = valid.filter((v) => v <= value).length;
  return Math.round((below / valid.length) * 1000) / 10;
}

export function daysSinceRain(series: DailySeries[], threshold = 1): number {
  let days = 0;
  for (let i = series.length - 1; i >= 0; i -= 1) {
    const value = series[i].precip;
    if (!Number.isFinite(value) || value < 0) continue;
    if (value >= threshold) return days;
    days += 1;
    if (days >= 365) return 365;
  }
  return days;
}

function sumWindow(series: DailySeries[], endIndex: number, size = 30): number | null {
  if (endIndex < size - 1) return null;
  let total = 0;
  for (let i = endIndex - size + 1; i <= endIndex; i += 1) {
    const value = series[i].precip;
    if (!Number.isFinite(value) || value < 0) return null;
    total += value;
  }
  return Math.round(total * 10) / 10;
}

export function computeClimate(input: DailySeries[]): ClimateStats | null {
  const series = input
    .filter((d) => Number.isFinite(d.precip) && d.precip >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (series.length < 30) return null;

  const last = series[series.length - 1];
  const last30 = sumWindow(series, series.length - 1, 30);
  if (last30 === null) return null;

  const targetMonthDay = last.date.slice(5);
  const historical: number[] = [];

  const byYear = new Map<string, DailySeries[]>();
  for (const day of series) {
    const year = day.date.slice(0, 4);
    const list = byYear.get(year) ?? [];
    list.push(day);
    byYear.set(year, list);
  }

  for (const [year, days] of byYear) {
    if (year === last.date.slice(0, 4)) continue;
    let best = -1;
    let bestDiff = 999;
    for (let i = 0; i < days.length; i += 1) {
      const diff = Math.abs(
        Number(days[i].date.slice(5, 7)) * 31 +
          Number(days[i].date.slice(8, 10)) -
          (Number(targetMonthDay.slice(0, 2)) * 31 + Number(targetMonthDay.slice(3, 5))),
      );
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    }
    if (best >= 0 && bestDiff <= 10) {
      const total = sumWindow(days, best, 30);
      if (total !== null) historical.push(total);
    }
  }

  return {
    lastDate: last.date,
    rain30mm: last30,
    rain30Percentile: percentileRank(historical, last30),
    daysSinceRain: daysSinceRain(series),
    tMaxC: Number.isFinite(last.tMax) ? Math.round((last.tMax as number) * 10) / 10 : null,
    rhPct: Number.isFinite(last.rh) ? Math.round((last.rh as number) * 10) / 10 : null,
    windMs: Number.isFinite(last.wind) ? Math.round((last.wind as number) * 10) / 10 : null,
    years: historical.length,
    source: "POWER",
    fallback: false,
  };
}
