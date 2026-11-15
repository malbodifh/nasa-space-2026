#!/usr/bin/env node
/**
 * Regenera los snapshots estáticos de overlays (caminos, áreas protegidas,
 * volcanes y fronteras) que usa el BFF cuando una fuente viva falla.
 *
 * Uso: node scripts/build-overlays.mjs
 * Salidas: data/overpass-valparaiso.json, data/volcanoes.json, data/borders.json
 */
import { mkdir, writeFile } from "node:fs/promises";

const UA = "AstralCodes-MemoriaDeFuego/0.1 (hackathon)";
const CENTER = { lat: -33.047, lon: -71.612 };
const RADIUS_KM = 60;
const BBOX = [-72.15, -33.65, -71.05, -32.55]; // oeste, sur, este, norte

const OVERPASS = "https://overpass-api.de/api/interpreter";
const GVP =
  "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0" +
  "&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes" +
  "&outputFormat=application/json&bbox=-82,-57,-58,-15";
const BORDERS =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/" +
  "ne_110m_admin_0_boundary_lines_land.geojson";

const round = (n) => Math.round(n * 1e4) / 1e4;

function haversine(a, b) {
  const R = 6371;
  const rad = (v) => (v * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lineFrom(geometry) {
  if (!Array.isArray(geometry) || geometry.length < 2) return null;
  return geometry.map((p) => [round(p.lon), round(p.lat)]);
}

/** Douglas-Peucker en grados; 0.0004° ≈ 44 m, suficiente para un overlay. */
function simplify(points, tolerance = 0.0008) {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance * tolerance;

  const sqSegDist = (p, a, b) => {
    let x = a[0];
    let y = a[1];
    let dx = b[0] - x;
    let dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b[0];
        y = b[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  };

  const sqDistToSegment = (p, a, b) => sqSegDist(p, a, b);

  const step = (first, last, output) => {
    let maxSq = sqTolerance;
    let index = -1;
    for (let i = first + 1; i < last; i += 1) {
      const sq = sqDistToSegment(points[i], points[first], points[last]);
      if (sq > maxSq) {
        index = i;
        maxSq = sq;
      }
    }
    if (index > 0) {
      step(first, index, output);
      output.push(points[index]);
      step(index, last, output);
    }
  };

  const output = [points[0]];
  step(0, points.length - 1, output);
  output.push(points[points.length - 1]);
  return output;
}

/** Une segmentos sueltos (ways de una relación) en anillos cerrados. */
function stitchRings(segments) {
  const rings = [];
  const pool = segments.map((s) => s.slice());
  while (pool.length > 0) {
    const ring = pool.shift();
    let guard = 0;
    while (guard < 500) {
      guard += 1;
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] === last[0] && first[1] === last[1]) break;
      const idx = pool.findIndex((s) => {
        const head = s[0];
        const tail = s[s.length - 1];
        return (
          (head[0] === last[0] && head[1] === last[1]) ||
          (tail[0] === last[0] && tail[1] === last[1])
        );
      });
      if (idx === -1) break;
      const next = pool.splice(idx, 1)[0];
      const head = next[0];
      if (head[0] === last[0] && head[1] === last[1]) ring.push(...next.slice(1));
      else ring.push(...next.slice(0, -1).reverse());
    }
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (ring.length > 3 && first[0] === last[0] && first[1] === last[1]) rings.push(ring);
  }
  return rings;
}

function simplifyGeometry(geometry) {
  if (geometry.type === "LineString") {
    return { type: "LineString", coordinates: simplify(geometry.coordinates, 0.0004) };
  }
  if (geometry.type === "MultiLineString") {
    return { type: "MultiLineString", coordinates: geometry.coordinates.map((l) => simplify(l, 0.0004)) };
  }
  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: geometry.coordinates.map((r) => simplify(r, 0.0004)) };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map((poly) => poly.map((r) => simplify(r, 0.0004))),
    };
  }
  return geometry;
}

function areaFeature(element) {
  const tags = element.tags ?? {};
  const props = {
    name: tags.name ?? "Área protegida sin nombre",
    kind: tags.boundary === "national_park" ? "Parque nacional" : tags.leisure === "nature_reserve" ? "Reserva natural" : "Área protegida",
    protectClass: tags.protect_class ? Number(tags.protect_class) : null,
  };

  if (element.type === "way" && Array.isArray(element.geometry)) {
    const ring = lineFrom(element.geometry);
    if (!ring || ring.length < 4) return null;
    const closed =
      ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
    if (!closed) return { type: "Feature", properties: props, geometry: { type: "LineString", coordinates: ring } };
    return { type: "Feature", properties: props, geometry: { type: "Polygon", coordinates: [ring] } };
  }

  if (element.type === "relation" && Array.isArray(element.members)) {
    const outer = element.members
      .filter((m) => m.type === "way" && (m.role === "outer" || m.role === ""))
      .map((m) => lineFrom(m.geometry))
      .filter(Boolean);
    if (outer.length === 0) return null;
    const rings = stitchRings(outer);
    if (rings.length === 0) {
      return {
        type: "Feature",
        properties: props,
        geometry: { type: "MultiLineString", coordinates: outer },
      };
    }
    return {
      type: "Feature",
      properties: props,
      geometry:
        rings.length === 1
          ? { type: "Polygon", coordinates: [rings[0]] }
          : { type: "MultiPolygon", coordinates: rings.map((r) => [r]) },
    };
  }

  return null;
}

function roadFeature(element) {
  const tags = element.tags ?? {};
  const line = lineFrom(element.geometry);
  if (!line) return null;
  const mid = line[Math.floor(line.length / 2)];
  if (haversine(CENTER, { lon: mid[0], lat: mid[1] }) > RADIUS_KM + 15) return null;
  return {
    type: "Feature",
    properties: {
      name: tags.name ?? tags.ref ?? null,
      kind: tags.highway ?? "camino",
    },
    geometry: { type: "LineString", coordinates: line },
  };
}

async function buildOverpass() {
  const query = `[out:json][timeout:90];
(
  way["highway"~"^(motorway|trunk|primary|secondary)$"](${BBOX[1]},${BBOX[0]},${BBOX[3]},${BBOX[2]});
  way["boundary"~"protected_area|national_park"](${BBOX[1]},${BBOX[0]},${BBOX[3]},${BBOX[2]});
  way["leisure"="nature_reserve"](${BBOX[1]},${BBOX[0]},${BBOX[3]},${BBOX[2]});
  relation["boundary"~"protected_area|national_park"](${BBOX[1]},${BBOX[0]},${BBOX[3]},${BBOX[2]});
  relation["leisure"="nature_reserve"](${BBOX[1]},${BBOX[0]},${BBOX[3]},${BBOX[2]});
);
out geom;`;

  const response = await fetch(`${OVERPASS}?data=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(120_000),
  });
  console.log("overpass", response.status);
  if (!response.ok) throw new Error(`Overpass ${response.status}`);
  const payload = await response.json();

  const byKind = new Map();
  const areas = [];
  for (const element of payload.elements ?? []) {
    if (element.tags?.highway) {
      const feature = roadFeature(element);
      if (!feature) continue;
      const kind = feature.properties.kind;
      if (!byKind.has(kind)) byKind.set(kind, []);
      byKind.get(kind).push(simplify(feature.geometry.coordinates, kind === "secondary" ? 0.0016 : 0.0007));
    } else {
      const feature = areaFeature(element);
      if (feature) {
        feature.geometry = simplifyGeometry(feature.geometry);
        areas.push(feature);
      }
    }
  }

  // Caminos agrupados por tipo: 4 features en vez de miles.
  const roads = Array.from(byKind.entries()).map(([kind, lines]) => ({
    type: "Feature",
    properties: { kind },
    geometry: { type: "MultiLineString", coordinates: lines },
  }));

  return {
    source: "OpenStreetMap · Overpass API",
    generatedAt: new Date().toISOString(),
    center: CENTER,
    radiusKm: RADIUS_KM,
    roads: { type: "FeatureCollection", features: roads },
    protectedAreas: { type: "FeatureCollection", features: areas },
  };
}

async function buildVolcanoes() {
  const response = await fetch(GVP, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(60_000),
  });
  console.log("gvp", response.status);
  if (!response.ok) throw new Error(`GVP ${response.status}`);
  const payload = await response.json();

  const features = payload.features.map((feature) => {
    const p = feature.properties ?? {};
    return {
      type: "Feature",
      properties: {
        name: p.Volcano_Name ?? "Volcán sin nombre",
        country: p.Country ?? null,
        type: p.Primary_Volcano_Type ?? null,
        elevation: Number.isFinite(Number(p.Elevation)) ? Number(p.Elevation) : null,
        lastEruption: p.Last_Eruption_Year ?? null,
        url: p.Volcano_Number ? `https://volcano.si.edu/volcano.cfm?vn=${p.Volcano_Number}` : null,
      },
      geometry: {
        type: "Point",
        coordinates: [round(feature.geometry.coordinates[0]), round(feature.geometry.coordinates[1])],
      },
    };
  });

  return {
    source: "Smithsonian GVP · Holocene Volcanoes",
    generatedAt: new Date().toISOString(),
    type: "FeatureCollection",
    features,
  };
}

async function buildBorders() {
  const response = await fetch(BORDERS, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(60_000),
  });
  console.log("borders", response.status);
  if (!response.ok) throw new Error(`Natural Earth ${response.status}`);
  const payload = await response.json();

  const features = payload.features
    .map((feature) => {
      const coords =
        feature.geometry.type === "LineString"
          ? feature.geometry.coordinates
          : feature.geometry.coordinates.flat();
      const line = coords.map((pair) => [round(pair[0]), round(pair[1])]);
      if (feature.geometry.type === "MultiLineString") {
        return {
          type: "Feature",
          properties: {},
          geometry: {
            type: "MultiLineString",
            coordinates: feature.geometry.coordinates.map((part) =>
              part.map((pair) => [round(pair[0]), round(pair[1])]),
            ),
          },
        };
      }
      return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: line } };
    })
    .filter(Boolean);

  return {
    source: "Natural Earth · Admin 0 boundary lines (110m)",
    generatedAt: new Date().toISOString(),
    type: "FeatureCollection",
    features,
  };
}

await mkdir(new URL("../data", import.meta.url), { recursive: true });

const overpass = await buildOverpass();
await writeFile(
  new URL("../data/overpass-valparaiso.json", import.meta.url),
  JSON.stringify(overpass),
);
console.log(
  "caminos",
  overpass.roads.features.length,
  "áreas",
  overpass.protectedAreas.features.length,
  "bytes",
  JSON.stringify(overpass).length,
);

const volcanoes = await buildVolcanoes();
await writeFile(new URL("../data/volcanoes.json", import.meta.url), JSON.stringify(volcanoes));
console.log("volcanes", volcanoes.features.length, "bytes", JSON.stringify(volcanoes).length);

const borders = await buildBorders();
await writeFile(new URL("../data/borders.json", import.meta.url), JSON.stringify(borders));
console.log("fronteras", borders.features.length, "bytes", JSON.stringify(borders).length);
