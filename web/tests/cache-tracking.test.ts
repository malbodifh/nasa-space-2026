import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { cached, withCacheTracking } from "@/lib/cache";

describe("meta.cached", () => {
  it("marca cached=false cuando la fuente no estaba en memoria", async () => {
    const key = `test-miss-${Math.random()}`;
    const { value, cached: hit } = await withCacheTracking(() => cached(key, 60_000, async () => 7));
    expect(value).toBe(7);
    expect(hit).toBe(false);
  });

  it("marca cached=true cuando una fuente se sirvió de la caché", async () => {
    const key = `test-hit-${Math.random()}`;
    await cached(key, 60_000, async () => 7);
    const { cached: hit } = await withCacheTracking(() => cached(key, 60_000, async () => 7));
    expect(hit).toBe(true);
  });

  it("no arrastra el estado entre consultas concurrentes", async () => {
    const key = `test-iso-${Math.random()}`;
    await cached(key, 60_000, async () => 1);
    const [first, second] = await Promise.all([
      withCacheTracking(() => cached(key, 60_000, async () => 1)),
      withCacheTracking(() => cached(`test-miss-iso-${Math.random()}`, 60_000, async () => 2)),
    ]);
    expect(first.cached).toBe(true);
    expect(second.cached).toBe(false);
  });
});
