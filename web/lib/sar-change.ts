/**
 * Detección de cambio entre dos vistas previas de NISAR (RGBA, HH en rojo y azul, HV en verde).
 * Es la misma regla que usa `scripts/build-nisar.mjs`, pero corre en el navegador para cualquier
 * punto que el radar cubra.
 */

export type Bounds = [number, number, number, number];

export type PixelWindow = { x0: number; y0: number; width: number; height: number; bounds: Bounds };

export const CHANGE_THRESHOLD = 38;
export const DARK_IN_BOTH = 70;

export const DARKER_RGB: [number, number, number] = [82, 102, 235];
export const BRIGHTER_RGB: [number, number, number] = [232, 163, 23];

/** Ventana de píxeles de una imagen en grilla lat/lon que cubre `bbox`, recortada a la imagen. */
export function cropWindow(
  frame: Bounds,
  size: { width: number; height: number },
  bbox: Bounds,
): PixelWindow | null {
  const [W, S, E, N] = frame;
  const [w, s, e, n] = bbox;
  const x0 = Math.max(0, Math.floor(((w - W) / (E - W)) * size.width));
  const x1 = Math.min(size.width, Math.ceil(((e - W) / (E - W)) * size.width));
  const y0 = Math.max(0, Math.floor(((N - n) / (N - S)) * size.height));
  const y1 = Math.min(size.height, Math.ceil(((N - s) / (N - S)) * size.height));
  if (x1 <= x0 || y1 <= y0) return null;
  return {
    x0,
    y0,
    width: x1 - x0,
    height: y1 - y0,
    bounds: [
      W + (x0 / size.width) * (E - W),
      N - (y1 / size.height) * (N - S),
      W + (x1 / size.width) * (E - W),
      N - (y0 / size.height) * (N - S),
    ],
  };
}

export function cropPixels(data: Uint8ClampedArray, imageWidth: number, win: PixelWindow): Uint8ClampedArray {
  const out = new Uint8ClampedArray(win.width * win.height * 4);
  for (let y = 0; y < win.height; y += 1) {
    const from = ((win.y0 + y) * imageWidth + win.x0) * 4;
    out.set(data.subarray(from, from + win.width * 4), y * win.width * 4);
  }
  return out;
}

function valid(px: Uint8ClampedArray, i: number): boolean {
  return px[i + 3] > 0 && px[i] + px[i + 1] > 0;
}

/** Fracción de píxeles con dato. */
export function coverage(px: Uint8ClampedArray): number {
  let n = 0;
  for (let i = 0; i < px.length; i += 4) if (valid(px, i)) n += 1;
  return px.length ? n / (px.length / 4) : 0;
}

/** Media móvil 5x5 del canal HH; NaN donde no hay dato. */
export function smoothHH(px: Uint8ClampedArray, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height).fill(Number.NaN);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!valid(px, (y * width + x) * 4)) continue;
      let sum = 0;
      let n = 0;
      for (let dy = -2; dy <= 2; dy += 1) {
        const yy = y + dy;
        if (yy < 0 || yy >= height) continue;
        for (let dx = -2; dx <= 2; dx += 1) {
          const xx = x + dx;
          if (xx < 0 || xx >= width) continue;
          const i = (yy * width + xx) * 4;
          if (!valid(px, i)) continue;
          sum += px[i];
          n += 1;
        }
      }
      out[y * width + x] = sum / n;
    }
  }
  return out;
}

/** Mediana de la diferencia (después − antes): corrige un brillo general distinto entre imágenes. */
export function medianOffset(before: Float32Array, after: Float32Array): number {
  const diffs: number[] = [];
  for (let k = 0; k < before.length; k += 7) {
    const a = before[k];
    const b = after[k];
    if (!Number.isNaN(a) && !Number.isNaN(b)) diffs.push(b - a);
  }
  if (diffs.length === 0) return 0;
  diffs.sort((p, q) => p - q);
  return diffs[Math.floor(diffs.length / 2)];
}

export type ChangeResult = {
  mask: Uint8ClampedArray;
  darkerPct: number;
  brighterPct: number;
};

/** Píxeles que se oscurecieron o aclararon más que el umbral; ignora agua oscura en ambas fechas. */
export function changeMask(
  before: Float32Array,
  after: Float32Array,
  offset = 0,
  threshold = CHANGE_THRESHOLD,
  darkInBoth = DARK_IN_BOTH,
): ChangeResult {
  const mask = new Uint8ClampedArray(before.length * 4);
  let counted = 0;
  let darker = 0;
  let brighter = 0;
  for (let k = 0; k < before.length; k += 1) {
    const a = before[k];
    const b = after[k] - offset;
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    if (Math.max(a, b) < darkInBoth) continue;
    counted += 1;
    const d = b - a;
    const i = k * 4;
    if (d <= -threshold) {
      darker += 1;
      [mask[i], mask[i + 1], mask[i + 2]] = DARKER_RGB;
      mask[i + 3] = 220;
    } else if (d >= threshold) {
      brighter += 1;
      [mask[i], mask[i + 1], mask[i + 2]] = BRIGHTER_RGB;
      mask[i + 3] = 220;
    }
  }
  return {
    mask,
    darkerPct: counted ? (darker / counted) * 100 : 0,
    brighterPct: counted ? (brighter / counted) * 100 : 0,
  };
}

export type Pass = { date: string; status: "validado" | "provisional" };

export type PairNote = "antes-de-los-datos" | "sin-pasada-posterior" | null;

/**
 * Elige qué dos pasadas comparar para un evento: la última antes y la primera después.
 * Si el evento es anterior a los datos, compara la primera con la última; si todavía no hubo
 * pasada posterior, compara las dos últimas y lo avisa.
 */
export function pickPair<T extends Pass>(
  passes: T[],
  eventDate: string | null,
): { before: number; after: number; note: PairNote } | null {
  if (passes.length < 2) return null;
  const last = passes.length - 1;
  if (!eventDate) return { before: 0, after: last, note: null };
  const day = eventDate.slice(0, 10);
  const firstAfter = passes.findIndex((pass) => pass.date >= day);
  if (firstAfter === 0) return { before: 0, after: last, note: "antes-de-los-datos" };
  if (firstAfter === -1) return { before: last - 1, after: last, note: "sin-pasada-posterior" };
  return { before: firstAfter - 1, after: firstAfter, note: null };
}

/** Fecha aproximada de la próxima pasada (ciclo de 12 días). */
export function nextPass(lastDate: string): string {
  const date = new Date(`${lastDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 12);
  return date.toISOString().slice(0, 10);
}
