import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildPayload, MAX_AGE_MS, pendingFor } from "@/lib/push/payload";
import { memoryStore } from "@/lib/push/store";
import type { DisasterAlert } from "@/lib/types";

const NOW = Date.parse("2026-11-15T12:00:00Z");

function quake(partial: Partial<DisasterAlert>): DisasterAlert {
  return {
    id: "seismic:OVSICORI:1",
    source: "OVSICORI",
    category: "earthquakes",
    categoryLabel: "Sismo",
    title: "M 4.6 · San José",
    level: "green",
    date: new Date(NOW - 20 * 60_000).toISOString(),
    lat: 9.9,
    lon: -84.1,
    distanceKm: 20,
    url: "https://www.ovsicori.una.ac.cr/",
    magnitudeValue: 4.6,
    ...partial,
  };
}

describe("selección de avisos push", () => {
  it("envía los sismos que afectan y son recientes, y no los pequeños ni los viejos", () => {
    const alerts = [
      quake({ id: "a" }),
      quake({ id: "pequeño", magnitudeValue: 2.1, title: "M 2.1 · Jacó" }),
      quake({ id: "viejo", date: new Date(NOW - MAX_AGE_MS - 60_000).toISOString() }),
    ];
    expect(pendingFor("https://push/x", alerts, new Set(), NOW).map((a) => a.id)).toEqual(["a"]);
  });

  it("no repite lo que ya se envió a esa suscripción, pero sí a otra", () => {
    const sent = new Set(["https://push/x|a"]);
    expect(pendingFor("https://push/x", [quake({ id: "a" })], sent, NOW)).toHaveLength(0);
    expect(pendingFor("https://push/y", [quake({ id: "a" })], sent, NOW)).toHaveLength(1);
  });
});

describe("contenido del aviso", () => {
  it("lleva título, distancia, fuente y enlace al estudio", () => {
    const payload = buildPayload(quake({ id: "a" }), "es");
    expect(payload.title).toContain("M 4.6");
    expect(payload.body).toContain("20 km");
    expect(payload.body).toContain("OVSICORI");
    expect(payload.href).toMatch(/^\/superficie/);
    expect(payload.tag).toBe("a");
  });
});

describe("almacén en memoria", () => {
  it("guarda, actualiza y quita suscripciones y recuerda lo enviado", async () => {
    const store = memoryStore();
    const sub = { endpoint: "https://push/x", p256dh: "k".repeat(12), auth: "a".repeat(12), lat: 9.93, lon: -84.08, lang: "es" as const };
    await store.upsert(sub);
    await store.upsert({ ...sub, lat: 10.0 });
    expect(await store.list()).toEqual([{ ...sub, lat: 10.0 }]);
    await store.markSent([{ endpoint: sub.endpoint, alertId: "a" }]);
    expect((await store.sent()).has("https://push/x|a")).toBe(true);
    await store.remove(sub.endpoint);
    expect(await store.list()).toEqual([]);
  });
});
