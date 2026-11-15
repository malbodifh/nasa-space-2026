import { writeFile } from "node:fs/promises";

/**
 * Genera el fixture de clima (fallback offline) para un punto.
 * Uso: node scripts/generate-climate.mjs [lat] [lon] [salida]
 * Usa la misma función de dominio que la app (lib/stats.ts).
 */
const LAT = Number(process.argv[2] ?? 10.635);
const LON = Number(process.argv[3] ?? -85.4377);
const OUTPUT = process.argv[4] ?? "../data/demo-climate.json";

const { computeClimate } = await import("../lib/stats.ts");

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > -900 ? n : null;
}

function isoDate(yyyymmdd) {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

const end = new Date().toISOString().slice(0, 10).replaceAll("-", "");
const url =
  `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,RH2M,WS2M` +
  `&community=AG&longitude=${LON}&latitude=${LAT}&start=19810101&end=${end}&format=JSON`;

const response = await fetch(url, {
  headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.2" },
  signal: AbortSignal.timeout(60_000),
});
console.log("power", response.status);
if (!response.ok) process.exit(1);
const payload = await response.json();
const parameter = payload?.properties?.parameter;
if (!parameter?.PRECTOTCORR) process.exit(1);

const series = [];
for (const date of Object.keys(parameter.PRECTOTCORR)) {
  const precip = numberOrNull(parameter.PRECTOTCORR[date]);
  if (precip === null) continue;
  series.push({
    date: isoDate(date),
    precip,
    tMax: numberOrNull(parameter.T2M_MAX?.[date]) ?? undefined,
    rh: numberOrNull(parameter.RH2M?.[date]) ?? undefined,
    wind: numberOrNull(parameter.WS2M?.[date]) ?? undefined,
  });
}

const climate = computeClimate(series);
if (!climate) {
  console.error("serie insuficiente");
  process.exit(1);
}

const fixture = {
  ...climate,
  source: "POWER_FALLBACK",
  fallback: true,
};

await writeFile(new URL(OUTPUT, import.meta.url), JSON.stringify(fixture, null, 2) + "\n");
console.log(fixture);
