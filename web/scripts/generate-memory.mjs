import { gunzipSync } from "node:zlib";
import { writeFile } from "node:fs/promises";
import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";

const DATE = "2024-02-03";
const ZOOM = 6;
const X = 24;
const Y = 27;
const LAT = -33.047;
const LON = -71.612;
const RADIUS_KM = 50;
const TILE_URL = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Combined_Thermal_Anomalies_All/default/${DATE}/1km/${ZOOM}/${Y}/${X}.mvt`;

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

const response = await fetch(TILE_URL, { headers: { "User-Agent": "AstralCodes-spike/0.1" } });
console.log("status", response.status, response.headers.get("content-type"));
if (!response.ok) process.exit(1);

const raw = new Uint8Array(await response.arrayBuffer());
const data = raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw;
const tile = new VectorTile(new PbfReader(data));

const points = [];
const seen = new Set();

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

await writeFile(new URL("../data/demo-memory.json", import.meta.url), JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output.stats));
console.log("first", points[0]);
