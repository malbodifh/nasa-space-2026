import { describe, expect, it } from "vitest";

import {
  changeMask,
  cropWindow,
  medianOffset,
  nextPass,
  pickPair,
  smoothHH,
  type Pass,
} from "@/lib/sar-change";

function solid(width: number, height: number, hh: number, hv = hh): Uint8ClampedArray {
  const px = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = hh;
    px[i + 1] = hv;
    px[i + 2] = hh;
    px[i + 3] = 255;
  }
  return px;
}

const passes: Pass[] = [
  { date: "2026-07-20", status: "provisional" },
  { date: "2026-08-01", status: "provisional" },
  { date: "2026-08-13", status: "provisional" },
  { date: "2026-11-05", status: "validado" },
];

describe("sar-change", () => {
  it("recorta la ventana de un bbox dentro del cuadro", () => {
    const win = cropWindow([-86, 9, -84, 11], { width: 200, height: 200 }, [-85.5, 9.5, -85, 10]);
    expect(win).toMatchObject({ x0: 50, y0: 100, width: 50, height: 50 });
    expect(win?.bounds[0]).toBeCloseTo(-85.5);
    expect(win?.bounds[3]).toBeCloseTo(10);
  });

  it("devuelve null si el bbox queda fuera del cuadro", () => {
    expect(cropWindow([-86, 9, -84, 11], { width: 100, height: 100 }, [-80, 0, -79, 1])).toBeNull();
  });

  it("marca un área que se aclaró", () => {
    const before = smoothHH(solid(10, 10, 100), 10, 10);
    const afterPx = solid(10, 10, 100);
    for (let y = 0; y < 10; y += 1) for (let x = 0; x < 5; x += 1) afterPx[(y * 10 + x) * 4] = 200;
    const after = smoothHH(afterPx, 10, 10);
    const result = changeMask(before, after);
    expect(result.comparableCount).toBe(100);
    expect(result.brighterPct).toBeGreaterThan(30);
    expect(result.darkerPct).toBe(0);
  });

  it("ignora el agua oscura en las dos fechas", () => {
    const before = smoothHH(solid(8, 8, 10), 8, 8);
    const after = smoothHH(solid(8, 8, 60), 8, 8);
    const result = changeMask(before, after);
    expect(result.comparableCount).toBe(0);
    expect(result.brighterPct).toBe(0);
    expect(result.darkerPct).toBe(0);
  });

  it("no cuenta píxeles sin solapamiento válido en ambas fechas", () => {
    const result = changeMask(
      new Float32Array([100, NaN, NaN]),
      new Float32Array([NaN, 150, NaN]),
    );
    expect(result.comparableCount).toBe(0);
    expect(result.mask.every((value) => value === 0)).toBe(true);
  });

  it("corrige un brillo general distinto con la mediana", () => {
    const before = smoothHH(solid(8, 8, 100), 8, 8);
    const after = smoothHH(solid(8, 8, 150), 8, 8);
    const offset = medianOffset(before, after);
    expect(offset).toBeCloseTo(50);
    expect(changeMask(before, after, offset).brighterPct).toBe(0);
  });

  it("elige la última pasada antes y la primera después del evento", () => {
    expect(pickPair(passes, "2026-08-05")).toEqual({ before: 1, after: 2, note: null });
  });

  it("avisa si el evento es anterior a los datos", () => {
    expect(pickPair(passes, "2026-04-27T00:00:00Z")).toEqual({
      before: 0,
      after: 3,
      note: "antes-de-los-datos",
    });
  });

  it("avisa si todavía no hubo pasada después del evento", () => {
    expect(pickPair(passes, "2026-11-10")).toEqual({
      before: 2,
      after: 3,
      note: "sin-pasada-posterior",
    });
    expect(nextPass("2026-11-05")).toBe("2026-11-17");
  });

  it("no compara con menos de dos pasadas", () => {
    expect(pickPair(passes.slice(0, 1), null)).toBeNull();
  });
});
