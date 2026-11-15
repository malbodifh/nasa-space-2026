#!/usr/bin/env node
/**
 * Regenera los catálogos estáticos de volcanes (GVP) y fronteras (Natural Earth).
 * Los caminos y áreas protegidas salen del PBF con scripts/build-osm-cr.py.
 *
 * Uso: node scripts/build-overlays.mjs
 * Salidas: data/volcanoes.json, data/borders.json
 */
import { mkdir, writeFile } from "node:fs/promises";

const UA = "AstralCodes-MemoriaDeFuego/0.2 (hackathon)";

const AREAS = [
  {
    id: "guanacaste",
    label: "Guanacaste · Liberia",
    center: { lat: 10.635, lon: -85.4377 },
    radiusKm: 60,
    bbox: [-86.1, 10.1, -84.9, 11.05],
  },
  {
    id: "valle-central",
    label: "Valle Central · San José",
    center: { lat: 9.9325, lon: -84.0796 },
    radiusKm: 55,
    bbox: [-84.6, 9.65, -83.6, 10.2],
  },
  {
    id: "arenal",
    label: "Arenal · La Fortuna",
    center: { lat: 10.471, lon: -84.645 },
    radiusKm: 45,
    bbox: [-85.05, 10.2, -84.05, 10.75],
  },
];

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const GVP =
  "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0" +
  "&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes" +
  "&outputFormat=application/json&bbox=-87,7,-81,12.5";
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

/** Douglas-Peucker en grados; 0.0008° ≈ 90 m, suficiente para un overlay. */
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

  const step = (first, last, output) => {
    let maxSq = sqTolerance;
    let index = -1;
    for (let i = first + 1; i < last; i += 1) {
      const sq = sqSegDist(points[i], points[first], points[last]);
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
    kind:
      tags.boundary === "national_park"
        ? "Parque nacional"
        : tags.leisure === "nature_reserve"
          ? "Reserva natural"
          : "Área protegida",
    protectClass: tags.protect_class ? Number(tags.protect_class) : null,
  };

  if (element.type === "way" && Array.isArray(element.geometry)) {
    const ring = lineFrom(element.geometry);
    if (!ring || ring.length < 4) return null;
    const closed =
      ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
    if (!closed) {
      return { type: "Feature", properties: props, geometry: { type: "LineString", coordinates: ring } };
    }
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

function roadFeature(element, center) {
  const tags = element.tags ?? {};
  const line = lineFrom(element.geometry);
  if (!line) return null;
  const mid = line[Math.floor(line.length / 2)];
  if (haversine(center, { lon: mid[0], lat: mid[1] }) > 75) return null;
  return {
    type: "Feature",
    properties: { kind: tags.highway ?? "camino" },
    geometry: { type: "LineString", coordinates: line },
  };
}

async function queryOverpass(query, label) {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(180_000),
      });
      console.log(label, endpoint.split("/")[2], response.status);
      if (!response.ok) continue;
      return await response.json();
    } catch (error) {
      console.log(label, "error", error.message);
    }
  }
  throw new Error(`Overpass no respondió para ${label}`);
}

async function buildArea(area) {
  const [w, s, e, n] = area.bbox;
  const roadsQuery = `[out:json][timeout:120];
way["highway"~"^(motorway|trunk|primary|secondary)$"](${s},${w},${n},${e});
out geom;`;
  const areasQuery = `[out:json][timeout:120];
(
  way["boundary"~"protected_area|national_park"](${s},${w},${n},${e});
  way["leisure"="nature_reserve"](${s},${w},${n},${e});
  relation["boundary"~"protected_area|national_park"](${s},${w},${n},${e});
  relation["leisure"="nature_reserve"](${s},${w},${n},${e});
);
out geom;`;

  const roadsPayload = await queryOverpass(roadsQuery, `${area.id}-caminos`);
  const areasPayload = await queryOverpass(areasQuery, `${area.id}-áreas`);

  const byKind = new Map();
  const areas = [];
  for (const element of [...(roadsPayload.elements ?? []), ...(areasPayload.elements ?? [])]) {
    if (element.tags?.highway) {
      const feature = roadFeature(element, area.center);
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

  const roads = Array.from(byKind.entries()).map(([kind, lines]) => ({
    type: "Feature",
    properties: { kind },
    geometry: { type: "MultiLineString", coordinates: lines },
  }));

  return {
    ...area,
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

  const features = payload.features.map((feature) => {
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
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: feature.geometry.coordinates.map((pair) => [round(pair[0]), round(pair[1])]),
      },
    };
  });

  return {
    source: "Natural Earth · Admin 0 boundary lines (110m)",
    generatedAt: new Date().toISOString(),
    type: "FeatureCollection",
    features,
  };
}

await mkdir(new URL("../data", import.meta.url), { recursive: true });

// Caminos y áreas protegidas se generan desde el PBF con scripts/build-osm-cr.py.
// Este script solo refresca los catálogos estáticos de volcanes y fronteras.
const volcanoes = await buildVolcanoes();
const volcanoesJson = JSON.stringify(volcanoes);
await writeFile(new URL("../data/volcanoes.json", import.meta.url), volcanoesJson);
console.log("volcanes", volcanoes.features.length, "bytes", volcanoesJson.length);

const borders = await buildBorders();
const bordersJson = JSON.stringify(borders);
await writeFile(new URL("../data/borders.json", import.meta.url), bordersJson);
console.log("fronteras", borders.features.length, "bytes", bordersJson.length);
