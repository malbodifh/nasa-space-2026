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

const cache = new Map<string, Promise<ImageData>>();

/** Descarga una imagen del mismo origen y devuelve sus píxeles (con caché en memoria). */
export function loadImageData(url: string): Promise<ImageData> {
  let pending = cache.get(url);
  if (!pending) {
    pending = (async () => {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Sin canvas 2D");
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height);
    })();
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}

function toDataUrl(px: Uint8ClampedArray, width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.putImageData(new ImageData(new Uint8ClampedArray(px), width, height), 0, 0);
  return canvas.toDataURL("image/png");
}

export type PairResult = {
  before: string;
  after: string;
  change: string;
  bounds: Bounds;
  width: number;
  height: number;
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
    darkerPct: result.darkerPct,
    brighterPct: result.brighterPct,
  };
}
