import { gunzipSync } from "node:zlib";
import { writeFile } from "node:fs/promises";
import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";

/**
 * Genera el fixture de memoria (fallback offline) para un punto y fecha.
 * Uso: node scripts/generate-memory.mjs [YYYY-MM-DD] [lat] [lon] [radioKm] [salida]
 */
const DATE = process.argv[2] ?? "2024-04-05";
const LAT = Number(process.argv[3] ?? 10.635);
const LON = Number(process.argv[4] ?? -85.4377);
const RADIUS_KM = Number(process.argv[5] ?? 50);
const OUTPUT = process.argv[6] ?? "../data/demo-memory.json";

const ZOOM = 6;
// Rejilla EPSG:4326 de GIBS: 80 columnas x 40 filas en el nivel 6.
const N_LON = 80;
const N_LAT = 40;
const BASE = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Combined_Thermal_Anomalies_All/default";

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const x0 = Math.floor(((LON + 180) / 360) * N_LON);
const y0 = Math.floor(((90 - LAT) / 180) * N_LAT);

const points = [];
const seen = new Set();

for (let x = x0 - 1; x <= x0 + 1; x += 1) {
  for (let y = y0 - 1; y <= y0 + 1; y += 1) {
    if (x < 0 || y < 0 || x >= N_LON || y >= N_LAT) continue;
    const url = `${BASE}/${DATE}/1km/${ZOOM}/${y}/${x}.mvt`;
    const response = await fetch(url, { headers: { "User-Agent": "AstralCodes-MemoriaDeFuego/0.2" } });
    console.log(url.split("/default/")[1], response.status);
    if (!response.ok) continue;
    const raw = new Uint8Array(await response.arrayBuffer());
    if (raw.length === 0) continue;
    const data = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw;
    const tile = new VectorTile(new PbfReader(data));

    for (const layer of Object.values(tile.layers)) {
      for (let i = 0; i < layer.length; i += 1) {
        const p = layer.feature(i).properties;
        const lat = Number(p.LATITUDE);
        const lon = Number(p.LONGITUDE);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const d = distanceKm(LAT, LON, lat, lon);
        if (d > RADIUS_KM + 0.5) continue;
        const id = `${DATE}:${lat.toFixed(4)}:${lon.toFixed(4)}:${p.ACQ_TIME ?? ""}:${p.SATELLITE ?? ""}`;
        if (seen.has(id)) continue;
        seen.add(id);
        points.push({
          id,
          lat,
          lon,
          date: String(p.ACQ_DATE ?? DATE),
          time: p.ACQ_TIME ? String(p.ACQ_TIME) : undefined,
          satellite: p.SATELLITE ? String(p.SATELLITE) : undefined,
          instrument: p.INSTRUMENT ? String(p.INSTRUMENT) : undefined,
          confidence: p.CONFIDENCE ? String(p.CONFIDENCE) : undefined,
          frp: Number.isFinite(Number(p.FRP)) ? Number(p.FRP) : undefined,
          distanceKm: Math.round(d * 10) / 10,
        });
      }
    }
  }
}

points.sort((a, b) => a.distanceKm - b.distanceKm);
const maxFrp = points.reduce((m, p) => Math.max(m, p.frp ?? 0), 0);

const output = {
  date: DATE,
  source: "NASA GIBS MVT · MODIS_Combined_Thermal_Anomalies_All",
  center: { lat: LAT, lon: LON, radiusKm: RADIUS_KM },
  stats: {
    count: points.length,
    nearestKm: points[0]?.distanceKm ?? null,
    maxFrp: maxFrp || null,
  },
  points,
};

await writeFile(new URL(OUTPUT, import.meta.url), JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output.stats));
console.log("first", points[0]);
