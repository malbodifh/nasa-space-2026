import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { cached, withCacheTracking } from "@/lib/cache";

describe("falla suave de la caché", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sin dato previo, un fallo se propaga", async () => {
    const key = `stale-miss-${Math.random()}`;
    await expect(cached(key, 1_000, async () => Promise.reject(new Error("fuente caída")))).rejects.toThrow(
      "fuente caída",
    );
  });

  it("con dato previo, un refresco fallido devuelve el último dato y lo marca vencido", async () => {
    const key = `stale-hit-${Math.random()}`;
    await cached(key, 1_000, async () => "dato bueno");

    vi.advanceTimersByTime(2_000);

    const result = await withCacheTracking(() =>
      cached(key, 1_000, async () => Promise.reject(new Error("fuente caída"))),
    );

    expect(result.value).toBe("dato bueno");
    expect(result.stale).toBe(true);
  });

  it("no marca vencido cuando el refresco funciona", async () => {
    const key = `stale-ok-${Math.random()}`;
    await cached(key, 1_000, async () => "viejo");
    vi.advanceTimersByTime(2_000);

    const result = await withCacheTracking(() => cached(key, 1_000, async () => "nuevo"));

    expect(result.value).toBe("nuevo");
    expect(result.stale).toBe(false);
    expect(result.cached).toBe(false);
  });

  it("mantiene stale durante la gracia y lo limpia tras recuperarse", async () => {
    const key = `stale-grace-${Math.random()}`;
    await cached(key, 120_000, async () => "bueno");
    vi.advanceTimersByTime(120_001);
    await cached(key, 120_000, async () => { throw new Error("caída"); });
    const refresh = vi.fn(async () => "nuevo");
    expect(await withCacheTracking(() => cached(key, 120_000, refresh))).toEqual({
      value: "bueno", cached: true, stale: true,
    });
    expect(refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60_001);
    expect(await withCacheTracking(() => cached(key, 120_000, refresh))).toEqual({
      value: "nuevo", cached: false, stale: false,
    });
  });

  it("marca stale en todos los requests que comparten un refresco fallido", async () => {
    const key = `stale-concurrent-${Math.random()}`;
    await cached(key, 1_000, async () => "bueno");
    vi.advanceTimersByTime(1_001);
    let fail!: (error: Error) => void;
    const refresh = vi.fn(() => new Promise<string>((_, reject) => { fail = reject; }));
    const first = withCacheTracking(() => cached(key, 1_000, refresh));
    const second = withCacheTracking(() => cached(key, 1_000, refresh));
    fail(new Error("caída"));
    const results = await Promise.all([first, second]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(results.map((result) => result.stale)).toEqual([true, true]);
    expect(results.map((result) => result.value)).toEqual(["bueno", "bueno"]);
  });
});
