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
});
