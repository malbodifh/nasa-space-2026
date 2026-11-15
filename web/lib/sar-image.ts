"use client";

import {
  changeMask,
  coverage,
  cropPixels,
  cropWindow,
  medianOffset,
  smoothHH,
  type Bounds,
  type PixelWindow,
} from "@/lib/sar-change";

// Dos vistas RGBA de ~3,88 MP caben; no retenemos todas las fechas visitadas.
const MAX_CACHE_BYTES = 32 * 1024 * 1024;
const MAX_CACHE_ENTRIES = 4;
const IMAGE_TIMEOUT_MS = 20_000;
type CachedImage = { pending: Promise<ImageData>; bytes: number };
const cache = new Map<string, CachedImage>();

function trimCache() {
  let bytes = [...cache.values()].reduce((total, entry) => total + entry.bytes, 0);
  for (const [url, entry] of cache) {
    if (cache.size <= MAX_CACHE_ENTRIES && bytes <= MAX_CACHE_BYTES) break;
    cache.delete(url);
    bytes -= entry.bytes;
  }
}

async function decodeImage(url: string): Promise<ImageData> {
  const image = new Image();
  image.decoding = "async";
  const canvas = document.createElement("canvas");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    image.src = url;
    await Promise.race([
      image.decode(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("La imagen de radar tardó demasiado")), IMAGE_TIMEOUT_MS);
      }),
    ]);
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Sin canvas 2D");
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  } finally {
    clearTimeout(timer);
    // ImageData tiene su propia copia: soltar el backing store y el recurso decodificado.
    canvas.width = 0;
    canvas.height = 0;
    image.removeAttribute("src");
  }
}

/** Vistas previas PNG del mismo origen; LRU acotada, nunca descarga el HDF5. */
export function loadImageData(url: string): Promise<ImageData> {
  const hit = cache.get(url);
  if (hit) {
    cache.delete(url);
    cache.set(url, hit);
    return hit.pending;
  }
  const entry: CachedImage = { pending: decodeImage(url), bytes: 0 };
  const pending = entry.pending.then(
    (data) => {
      if (cache.get(url) === entry) {
        if (data.data.byteLength > MAX_CACHE_BYTES) cache.delete(url);
        else {
          entry.bytes = data.data.byteLength;
          trimCache();
        }
      }
      return data;
    },
    (error: unknown) => {
      // Una petición antigua expulsada no debe borrar un reintento más reciente.
      if (cache.get(url) === entry) cache.delete(url);
      throw error;
    },
  );
  entry.pending = pending;
  cache.set(url, entry);
  trimCache();
  return pending;
}

function toDataUrl(px: Uint8ClampedArray, width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return "";
  try {
    context.putImageData(new ImageData(new Uint8ClampedArray(px), width, height), 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export type PairResult = {
  before: string;
  after: string;
  change: string;
  bounds: Bounds;
  width: number;
  height: number;
  comparableCount: number;
  darkerPct: number;
  brighterPct: number;
};

export class CoverageError extends Error {}

/**
 * Recorta las dos imágenes a la misma ventana y calcula el mapa de cambio.
 * `frame` = límites de la imagen completa; `region` = lo que se quiere mostrar (o null para todo).
 */
export async function comparePair(
  beforeUrl: string,
  afterUrl: string,
  frame: Bounds,
  region: Bounds | null,
): Promise<PairResult> {
  const [a, b] = await Promise.all([loadImageData(beforeUrl), loadImageData(afterUrl)]);
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error("Las dos imágenes no comparten la misma grilla");
  }
  const win: PixelWindow | null = region
    ? cropWindow(frame, a, region)
    : { x0: 0, y0: 0, width: a.width, height: a.height, bounds: frame };
  if (!win) throw new CoverageError("El punto queda fuera de la imagen de radar");

  const pa = cropPixels(a.data, a.width, win);
  const pb = cropPixels(b.data, b.width, win);
  if (coverage(pa) < 0.5 || coverage(pb) < 0.5) {
    throw new CoverageError("El radar no cubre bien este lugar en alguna de las dos fechas");
  }

  const ha = smoothHH(pa, win.width, win.height);
  const hb = smoothHH(pb, win.width, win.height);
  const result = changeMask(ha, hb, medianOffset(ha, hb));

  return {
    before: toDataUrl(pa, win.width, win.height),
    after: toDataUrl(pb, win.width, win.height),
    change: toDataUrl(result.mask, win.width, win.height),
    bounds: win.bounds,
    width: win.width,
    height: win.height,
    comparableCount: result.comparableCount,
    darkerPct: result.darkerPct,
    brighterPct: result.brighterPct,
  };
}
