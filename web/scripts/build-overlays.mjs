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
const GVP =
  "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0" +
  "&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes" +
  "&outputFormat=application/json&bbox=-87,7,-81,12.5";
const BORDERS =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/" +
  "ne_110m_admin_0_boundary_lines_land.geojson";

const round = (n) => Math.round(n * 1e4) / 1e4;

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

  const features = payload.features.map((feature) =>
    feature.geometry.type === "MultiLineString"
      ? {
          type: "Feature",
          properties: {},
          geometry: {
            type: "MultiLineString",
            coordinates: feature.geometry.coordinates.map((part) =>
              part.map((pair) => [round(pair[0]), round(pair[1])]),
            ),
          },
        }
      : {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: feature.geometry.coordinates.map((pair) => [round(pair[0]), round(pair[1])]),
          },
        },
  );

  return {
    source: "Natural Earth · Admin 0 boundary lines (110m)",
    generatedAt: new Date().toISOString(),
    type: "FeatureCollection",
    features,
  };
}

await mkdir(new URL("../data", import.meta.url), { recursive: true });

const volcanoes = await buildVolcanoes();
const volcanoesJson = JSON.stringify(volcanoes);
await writeFile(new URL("../data/volcanoes.json", import.meta.url), volcanoesJson);
console.log("volcanes", volcanoes.features.length, "bytes", volcanoesJson.length);

const borders = await buildBorders();
const bordersJson = JSON.stringify(borders);
await writeFile(new URL("../data/borders.json", import.meta.url), bordersJson);
console.log("fronteras", borders.features.length, "bytes", bordersJson.length);
