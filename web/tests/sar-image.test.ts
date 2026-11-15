import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type CanvasMock = {
  width: number;
  height: number;
  getContext: ReturnType<typeof vi.fn>;
  toDataURL: () => string;
};

describe("sar-image: caché de vistas previas", () => {
  let loadImageData: typeof import("@/lib/sar-image").loadImageData;
  let decode: ReturnType<typeof vi.fn<(url: string) => Promise<void>>>;
  let images: { src: string; removeAttribute: ReturnType<typeof vi.fn> }[];
  let canvases: CanvasMock[];
  let width: number;
  let height: number;
  let pixels: Uint8ClampedArray[];

  beforeEach(async () => {
    vi.resetModules();
    width = 8;
    height = 8;
    images = [];
    canvases = [];
    pixels = [];
    decode = vi.fn(async () => {});
    vi.stubGlobal("Image", class {
      src = "";
      decoding = "";
      naturalWidth = width;
      naturalHeight = height;
      removeAttribute = vi.fn();
      constructor() { images.push(this); }
      decode() { return decode(this.src); }
    });
    vi.stubGlobal("document", {
      createElement: vi.fn(() => {
        const canvas: CanvasMock = {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({
            drawImage: vi.fn(),
            getImageData: vi.fn(() => ({
              width: canvas.width,
              height: canvas.height,
              data: pixels.shift() ?? new Uint8ClampedArray(canvas.width * canvas.height * 4),
            })),
            putImageData: vi.fn(),
          })),
          toDataURL: () => "data:image/png;base64,test",
        };
        canvases.push(canvas);
        return canvas;
      }),
    });
    vi.stubGlobal("ImageData", class {
      constructor(public data: Uint8ClampedArray, public width: number, public height: number) {}
    });
    ({ loadImageData } = await import("@/lib/sar-image"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("comparte la petición y los píxeles de una URL repetida", async () => {
    const first = loadImageData("/radar/a.png");
    expect(loadImageData("/radar/a.png")).toBe(first);
    const pixels = await first;
    expect(await loadImageData("/radar/a.png")).toBe(pixels);
    expect(decode).toHaveBeenCalledTimes(1);
    expect(pixels.data).toHaveLength(8 * 8 * 4);
  });

  it.each(["dark", "no-overlap"])("propaga cero píxeles comparables: %s", async (scenario) => {
    const before = new Uint8ClampedArray(8 * 8 * 4);
    const after = new Uint8ClampedArray(before.length);
    for (let k = 0; k < 64; k += 1) {
      if (scenario === "dark" || k < 32) before.set([20, 20, 20, 255], k * 4);
      if (scenario === "dark" || k >= 32) after.set([60, 60, 60, 255], k * 4);
      if (scenario === "no-overlap") {
        if (k < 32) before.set([100, 100, 100, 255], k * 4);
        else after.set([150, 150, 150, 255], k * 4);
      }
    }
    pixels = [before, after];
    const { comparePair } = await import("@/lib/sar-image");
    const result = await comparePair("/before.png", "/after.png", [-86, 9, -84, 11], null);
    expect(result.comparableCount).toBe(0);
    expect(result.before).toMatch(/^data:image/);
    expect(result.after).toMatch(/^data:image/);
  });

  it("libera canvas e imagen después de leer los píxeles", async () => {
    await loadImageData("/radar/a.png");
    expect(canvases[0]).toMatchObject({ width: 0, height: 0 });
    expect(images[0].removeAttribute).toHaveBeenCalledWith("src");
  });

  it("permite reintentar una descarga fallida", async () => {
    decode.mockRejectedValueOnce(new Error("sin red"));
    await expect(loadImageData("/radar/a.png")).rejects.toThrow("sin red");
    await expect(loadImageData("/radar/a.png")).resolves.toMatchObject({ width: 8 });
    expect(decode).toHaveBeenCalledTimes(2);
    expect(canvases[0]).toMatchObject({ width: 0, height: 0 });
    expect(images[0].removeAttribute).toHaveBeenCalledWith("src");
  });

  it("limita a 32 MiB y expulsa la imagen menos recientemente utilizada", async () => {
    width = 2048;
    height = 2048; // 16 MiB RGBA por imagen.
    await loadImageData("/radar/a.png");
    await loadImageData("/radar/b.png");
    await loadImageData("/radar/a.png"); // a pasa a ser la más reciente.
    await loadImageData("/radar/c.png"); // expulsa b.
    await loadImageData("/radar/a.png");
    expect(decode).toHaveBeenCalledTimes(3);
    await loadImageData("/radar/b.png");
    expect(decode).toHaveBeenCalledTimes(4);
  });

  it("no retiene una vista que por sí sola supera 32 MiB", async () => {
    width = 4096;
    height = 2049;
    await loadImageData("/radar/large.png");
    await loadImageData("/radar/large.png");
    expect(decode).toHaveBeenCalledTimes(2);
  });

  it("acota también las entradas pequeñas a cuatro", async () => {
    for (const id of ["a", "b", "c", "d", "e"]) await loadImageData(`/radar/${id}.png`);
    await loadImageData("/radar/e.png");
    expect(decode).toHaveBeenCalledTimes(5);
    await loadImageData("/radar/a.png");
    expect(decode).toHaveBeenCalledTimes(6);
  });

  it("un fallo antiguo expulsado no elimina una petición nueva de la misma URL", async () => {
    let rejectOld!: (reason: Error) => void;
    decode.mockImplementationOnce(() => new Promise((_, reject) => { rejectOld = reject; }));
    const old = loadImageData("/radar/a.png");
    const rejected = expect(old).rejects.toThrow("petición antigua");
    for (const id of ["b", "c", "d", "e"]) await loadImageData(`/radar/${id}.png`);
    const current = loadImageData("/radar/a.png");
    await current;
    rejectOld(new Error("petición antigua"));
    await rejected;
    expect(loadImageData("/radar/a.png")).toBe(current);
  });

  it("termina la espera en 20 s, libera recursos y permite reintentar", async () => {
    vi.useFakeTimers();
    decode.mockImplementationOnce(() => new Promise(() => {}));
    const result = loadImageData("/radar/slow.png");
    const rejected = expect(result).rejects.toThrow("tardó demasiado");
    await vi.advanceTimersByTimeAsync(20_000);
    await rejected;
    expect(images[0].removeAttribute).toHaveBeenCalledWith("src");
    expect(canvases[0]).toMatchObject({ width: 0, height: 0 });
    await expect(loadImageData("/radar/slow.png")).resolves.toMatchObject({ width: 8 });
  });
});
