#!/usr/bin/env node
/**
 * Construye las capas de radar NISAR de la app.
 *
 * 1. Busca en NASA CMR los productos NISAR L2 GCOV (validados y provisionales) de cada zona.
 * 2. Descarga la vista previa pública de ASF (`*_LATLON.png`, sin login) a `.cache/nisar/`.
 * 3. Recorta cada zona, calcula el cambio contra la primera fecha y escribe WebP livianos en
 *    `public/nisar/<zona>/`, más el manifiesto `data/nisar.json`.
 *
 * Uso: node scripts/build-nisar.mjs            (usa la caché si existe)
 *      node scripts/build-nisar.mjs --refresh  (vuelve a consultar CMR y a descargar)
 *
 * Las vistas previas son PNG de 8 bits: HH va en rojo y azul, HV en verde (R y B son iguales
 * en todos los píxeles). No están calibradas en dB, así que los porcentajes son aproximados.
 * Para valores físicos (gamma0) hay que bajar el HDF5 con Earthdata Login.
 */
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// sharp llega como dependencia de Next; se resuelve desde ahí para no sumar dependencias.
const sharp = createRequire(createRequire(import.meta.url).resolve("next/package.json"))("sharp");

const CACHE = path.join(ROOT, ".cache", "nisar");
const PUBLIC = path.join(ROOT, "public", "nisar");
const MANIFEST = path.join(ROOT, "data", "nisar.json");
const REFRESH = process.argv.includes("--refresh");

const CMR = "https://cmr.earthdata.nasa.gov/search/granules.json";
const COLLECTIONS = [
  { shortName: "NISAR_L2_GCOV_V1", status: "validado" },
  { shortName: "NISAR_L2_GCOV_PROVISIONAL_V1", status: "provisional" },
];

/** Zonas de estudio. `frame` = pista_dirección_cuadro_modo del nombre del producto. */
const ZONES = [
  {
    id: "palo-verde",
    frame: "170_D_083_4005",
    bbox: [-85.62, 10.08, -85.02, 10.62],
    baseline: "2026-07-20",
  },
  {
    id: "cano-negro",
    frame: "170_D_083_4005",
    bbox: [-85.05, 10.62, -84.45, 11.16],
    baseline: "2026-07-20",
  },
  {
    id: "rincon-de-la-vieja",
    frame: "170_D_083_4005",
    bbox: [-85.62, 10.6, -85.02, 11.08],
    baseline: "2026-07-20",
  },
  {
    id: "tortuguero",
    frame: "004_A_007_4005",
    bbox: [-83.86, 10.2, -83.26, 10.74],
  },
];

const MIN_COVERAGE = 0.85;
const CHANGE_THRESHOLD = 38; // diferencia en niveles de 8 bits (0–255) del canal HH suavizado
// Los valores oscuros en ambas fechas se excluyen como filtro exploratorio (posible agua
// abierta o señal baja). No es una máscara validada de agua ni una clasificación superficial.
const DARK_BOTH = 70;

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function download(url, file) {
  if (!REFRESH && existsSync(file)) return true;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) return false;
  const buffer = Buffer.from(await response.arrayBuffer());
  // ASF responde 200 con una página HTML cuando el archivo no existe.
  const head = buffer.subarray(0, 64).toString().toLowerCase();
  if (head.includes("<html") || head.includes("<!doctype")) return false;
  await writeFile(file, buffer);
  return true;
}

function parseTitle(title) {
  const p = title.split("_");
  // NISAR_L2_PR_GCOV_<ciclo>_<pista>_<dir>_<cuadro>_<modo>_<pol>_...
  return {
    cycle: Number(p[4]),
    frame: `${p[5]}_${p[6]}_${p[7]}_${p[8]}`,
    pol: p[9],
    date: title.match(/_(\d{8})T\d{6}_/)?.[1].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
  };
}

async function findGranules(zone) {
  const [w, s, e, n] = zone.bbox;
  const byDate = new Map();
  for (const collection of COLLECTIONS) {
    const url = `${CMR}?short_name=${collection.shortName}&bounding_box=${w},${s},${e},${n}&page_size=200&sort_key=start_date`;
    const body = await getJson(url);
    for (const entry of body.feed.entry) {
      const info = parseTitle(entry.title);
      if (info.frame !== zone.frame || info.pol !== "DHDH" || !info.date) continue;
      const browse = entry.links.find(
        (l) => l.href.startsWith("https") && l.href.endsWith("_LATLON.png"),
      )?.href;
      const h5 = entry.links.find((l) => l.href.startsWith("https") && l.href.endsWith(".h5"))?.href;
      if (!browse) continue;
      const current = byDate.get(info.date);
      // Si hay validado y provisional de la misma fecha, gana el validado.
      if (current && current.status === "validado") continue;
      byDate.set(info.date, {
        date: info.date,
        cycle: info.cycle,
        status: collection.status,
        collection: collection.shortName,
        granule: entry.title,
        browse,
        h5: h5 ?? null,
        sizeMB: Math.round(Number(entry.granule_size) || 0),
      });
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function frameBounds(granules) {
  // Los productos validados traen el KML con las esquinas de la grilla LATLON del cuadro.
  for (const granule of [...granules].reverse()) {
    const file = path.join(CACHE, `${granule.granule}_LATLON.kml`);
    const ok = await download(granule.browse.replace(/\.png$/, ".kml"), file);
    if (!ok) continue;
    const kml = await readFile(file, "utf8");
    const coords = kml.match(/<coordinates>([^<]+)<\/coordinates>/)?.[1];
    if (!coords) continue;
    const points = coords.trim().split(/\s+/).map((pair) => pair.split(",").map(Number));
    const lons = points.map((p) => p[0]);
    const lats = points.map((p) => p[1]);
    return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
  }
  throw new Error("Ningún producto del cuadro trae KML con esquinas");
}

async function loadRaw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Promedio de HH y HV de todo el cuadro, para compensar diferencias de estiramiento. */
function frameMeans(raw) {
  let hh = 0;
  let hv = 0;
  let n = 0;
  for (let i = 0; i < raw.data.length; i += 16) {
    if (raw.data[i + 3] === 0 || raw.data[i] + raw.data[i + 1] === 0) continue;
    hh += raw.data[i];
    hv += raw.data[i + 1];
    n += 1;
  }
  return { hh: hh / n, hv: hv / n };
}

function cropWindow(bounds, size, bbox) {
  const [W, S, E, N] = bounds;
  const [w, s, e, n] = bbox;
  const x0 = Math.max(0, Math.floor(((w - W) / (E - W)) * size.width));
  const x1 = Math.min(size.width, Math.ceil(((e - W) / (E - W)) * size.width));
  const y0 = Math.max(0, Math.floor(((N - n) / (N - S)) * size.height));
  const y1 = Math.min(size.height, Math.ceil(((N - s) / (N - S)) * size.height));
  // Límites geográficos exactos de los píxeles recortados.
  const exact = [
    W + (x0 / size.width) * (E - W),
    N - (y1 / size.height) * (N - S),
    W + (x1 / size.width) * (E - W),
    N - (y0 / size.height) * (N - S),
  ];
  return { x0, y0, width: x1 - x0, height: y1 - y0, bounds: exact };
}

function crop(raw, win) {
  const out = Buffer.alloc(win.width * win.height * 4);
  for (let y = 0; y < win.height; y += 1) {
    const from = ((win.y0 + y) * raw.width + win.x0) * 4;
    raw.data.copy(out, y * win.width * 4, from, from + win.width * 4);
  }
  return out;
}

function isValid(px, i) {
  return px[i + 3] > 0 && px[i] + px[i + 1] > 0;
}

/** Media móvil 5x5 de un canal, ignorando píxeles sin dato. */
function smooth(px, width, height, channel, offset) {
  const out = new Float32Array(width * height).fill(Number.NaN);
  const r = 2;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let n = 0;
      for (let dy = -r; dy <= r; dy += 1) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -r; dx <= r; dx += 1) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          const i = (yy * width + xx) * 4;
          if (!isValid(px, i)) continue;
          sum += px[i + channel];
          n += 1;
        }
      }
      if (n > 0 && isValid(px, (y * width + x) * 4)) out[y * width + x] = sum / n + offset;
    }
  }
  return out;
}

function coverageOf(px) {
  let valid = 0;
  for (let i = 0; i < px.length; i += 4) if (isValid(px, i)) valid += 1;
  return valid / (px.length / 4);
}

function changeMap(base, current, width, height) {
  const out = Buffer.alloc(width * height * 4);
  let both = 0;
  let darker = 0;
  let brighter = 0;
  for (let k = 0; k < width * height; k += 1) {
    const a = base[k];
    const b = current[k];
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    if (Math.max(a, b) < DARK_BOTH) continue;
    both += 1;
    const d = b - a;
    const i = k * 4;
    if (d <= -CHANGE_THRESHOLD) {
      darker += 1;
      out[i] = 37;
      out[i + 1] = 99;
      out[i + 2] = 235;
      out[i + 3] = 215;
    } else if (d >= CHANGE_THRESHOLD) {
      brighter += 1;
      out[i] = 234;
      out[i + 1] = 88;
      out[i + 2] = 12;
      out[i + 3] = 215;
    }
  }
  return {
    buffer: out,
    darkerPct: both ? (darker / both) * 100 : 0,
    brighterPct: both ? (brighter / both) * 100 : 0,
  };
}

const round = (value, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

async function main() {
  await mkdir(CACHE, { recursive: true });
  const zonesOut = [];

  for (const zone of ZONES) {
    console.log(`\n▸ ${zone.id} · cuadro ${zone.frame}`);
    const granules = await findGranules(zone);
    console.log(`  ${granules.length} fechas en CMR`);
    const bounds = await frameBounds(granules);
    const outDir = path.join(PUBLIC, zone.id);
    await mkdir(outDir, { recursive: true });

    // 1) Cargar y recortar todas las fechas utilizables.
    const items = [];
    let gridSize = null;
    for (const granule of granules) {
      const file = path.join(CACHE, `${granule.granule}_LATLON.png`);
      if (!(await download(granule.browse, file))) {
        console.log(`  ✗ ${granule.date} sin vista previa`);
        continue;
      }
      const raw = await loadRaw(file);
      gridSize ??= [raw.width, raw.height];
      if (raw.width !== gridSize[0] || raw.height !== gridSize[1]) {
        console.log(`  · ${granule.date} tiene otra grilla (${raw.width}x${raw.height}), se omite`);
        continue;
      }
      const win = cropWindow(bounds, raw, zone.bbox);
      const px = crop(raw, win);
      const coverage = coverageOf(px);
      if (coverage < MIN_COVERAGE) {
        console.log(`  · ${granule.date} cubre ${Math.round(coverage * 100)} % de la zona, se omite`);
        continue;
      }
      items.push({ granule, win, px, coverage, means: frameMeans(raw) });
    }

    // 2) Fecha base: la configurada en la zona o, si no, la primera.
    const base = items.find((item) => item.granule.date === zone.baseline) ?? items[0];
    const baseHh = smooth(base.px, base.win.width, base.win.height, 0, 0);
    console.log(`  fecha base ${base.granule.date}`);

    const acquisitions = [];
    for (const { granule, win, px, coverage, means } of items) {
      const hh = smooth(px, win.width, win.height, 0, base.means.hh - means.hh);

      const imageName = `${granule.date}.webp`;
      await sharp(px, { raw: { width: win.width, height: win.height, channels: 4 } })
        .webp({ quality: 82, alphaQuality: 90 })
        .toFile(path.join(outDir, imageName));

      let change = null;
      let darkerPct = 0;
      let brighterPct = 0;
      if (granule.date !== base.granule.date) {
        const result = changeMap(baseHh, hh, win.width, win.height);
        darkerPct = result.darkerPct;
        brighterPct = result.brighterPct;
        change = `change-${granule.date}.webp`;
        await sharp(result.buffer, { raw: { width: win.width, height: win.height, channels: 4 } })
          .webp({ quality: 80, alphaQuality: 80 })
          .toFile(path.join(outDir, change));
      }

      acquisitions.push({
        date: granule.date,
        cycle: granule.cycle,
        status: granule.status,
        collection: granule.collection,
        granule: granule.granule,
        h5Url: granule.h5,
        sizeMB: granule.sizeMB,
        image: `/nisar/${zone.id}/${imageName}`,
        change: change ? `/nisar/${zone.id}/${change}` : null,
        coverage: round(coverage * 100, 0),
        darkerPct: round(darkerPct),
        brighterPct: round(brighterPct),
      });
      console.log(
        `  ✓ ${granule.date} ${granule.status.padEnd(11)} ` +
          `más oscuro ${round(darkerPct)} % · más brillante ${round(brighterPct)} %`,
      );
      zone.imageBounds = win.bounds;
      zone.imageSize = [win.width, win.height];
    }

    zonesOut.push({
      id: zone.id,
      frame: zone.frame,
      frameBounds: bounds.map((v) => round(v, 5)),
      bounds: zone.imageBounds.map((v) => round(v, 5)),
      imageSize: zone.imageSize,
      baseline: base.granule.date,
      acquisitions,
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: {
      mission: "NASA-ISRO NISAR (L-SAR, banda L)",
      product: "L2 GCOV · Geocoded Polarimetric Covariance",
      browse: "Vista previa pública de ASF DAAC (*_LATLON.png)",
      catalog: "https://cmr.earthdata.nasa.gov/search/",
      docs: "https://nisar-docs.asf.alaska.edu/gcov/",
    },
    method: {
      channels: "HH en rojo y azul, HV en verde",
      changeThreshold: CHANGE_THRESHOLD,
      ignoreDarkInBoth: DARK_BOTH,
      minCoverage: MIN_COVERAGE,
      note: "Vistas previas de 8 bits sin calibrar: los porcentajes son aproximados.",
    },
    zones: zonesOut,
  };
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nManifiesto: ${path.relative(ROOT, MANIFEST)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
