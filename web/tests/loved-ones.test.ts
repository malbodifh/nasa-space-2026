import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const NOW = Date.now();
const nearQuake = {
  id: "seismic:RSN:9",
  source: "RSN",
  category: "earthquakes",
  categoryLabel: "Sismo",
  title: "M 5.4 · Cartago",
  level: "orange",
  date: new Date(NOW - 10 * 60_000).toISOString(),
  lat: 9.86,
  lon: -83.92,
  distanceKm: 8,
  url: null,
  magnitudeValue: 5.4,
} as const;

// La zona de Cartago tiene un sismo fuerte; cualquier otra zona, nada.
vi.mock("@/lib/sources/overlays", () => ({
  getEvents: async (point: { lat: number }) => ({
    alerts: point.lat < 9.9 ? [nearQuake] : [],
    history: [],
    fallbackSources: [],
    sources: [],
  }),
}));

const sentPushes = vi.hoisted(() => [] as { endpoint: string; payload: { title: string; body: string; href: string } }[]);
vi.mock("web-push", () => ({
  setVapidDetails: () => {},
  sendNotification: async (sub: { endpoint: string }, payload: string) => {
    sentPushes.push({ endpoint: sub.endpoint, payload: JSON.parse(payload) });
  },
}));

delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

import { POST as accept } from "@/app/api/links/accept/route";
import { GET as inviteInfo, POST as invite } from "@/app/api/links/invite/route";
import { POST as list } from "@/app/api/links/list/route";
import { POST as location } from "@/app/api/links/location/route";
import { POST as remove } from "@/app/api/links/remove/route";
import { ensureDevice, markLinked, readDevice } from "@/lib/device";
import { authenticate, sha256 } from "@/lib/links/auth";
import { memoryLinksStore } from "@/lib/links/store";
import type { LinksResponse } from "@/lib/links/types";
import { buildLovedPayload, pendingFor } from "@/lib/push/payload";
import { runPushCycle } from "@/lib/push/send";
import { getPushStore } from "@/lib/push/store";
import { readSavedLocation, saveLocation } from "@/lib/saved-location";
import type { DisasterAlert } from "@/lib/types";

function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  };
}

const json = (body: unknown) => new Request("http://local/api", { method: "POST", body: JSON.stringify(body) });
const juan = { id: "11111111-1111-4111-8111-111111111111", key: "a".repeat(43) };
const mama = { id: "22222222-2222-4222-8222-222222222222", key: "b".repeat(43) };

describe("ubicación guardada en el teléfono", () => {
  it("recuerda la última ubicación real, redondeada a ~100 m", () => {
    const storage = fakeStorage();
    expect(readSavedLocation(storage)).toBeNull();
    saveLocation({ lat: 9.934567, lon: -84.087654 }, storage);
    expect(readSavedLocation(storage)).toEqual({ lat: 9.935, lon: -84.088 });
  });

  it("ignora datos dañados", () => {
    const storage = fakeStorage();
    storage.setItem("gamma:ubicacion", "{no es json");
    expect(readSavedLocation(storage)).toBeNull();
    storage.setItem("gamma:ubicacion", JSON.stringify({ lat: 200, lon: 0 }));
    expect(readSavedLocation(storage)).toBeNull();
  });
});

describe("identidad del teléfono", () => {
  it("crea un id y una clave una sola vez y recuerda si ya tiene vínculos", () => {
    const storage = fakeStorage();
    const first = ensureDevice(storage);
    expect(first.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(first.key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.linked).toBe(false);
    expect(ensureDevice(storage)).toEqual(first);
    markLinked(storage);
    expect(readDevice(storage)).toEqual({ ...first, linked: true });
  });

  it("solo acepta la clave correcta", async () => {
    const store = memoryLinksStore();
    expect(await authenticate(store, juan)).toBeNull();
    const created = await authenticate(store, juan, { create: true });
    expect(created?.keyHash).toBe(sha256(juan.key));
    expect(await authenticate(store, juan)).not.toBeNull();
    expect(await authenticate(store, { ...juan, key: "c".repeat(43) })).toBeNull();
  });
});

describe("avisos por un ser querido", () => {
  const alert = nearQuake as unknown as DisasterAlert;

  it("lleva un registro de enviados aparte del propio", () => {
    const sent = new Set([`https://push/x|${alert.id}`]);
    expect(pendingFor("https://push/x", [alert], sent, NOW)).toHaveLength(0);
    expect(pendingFor("https://push/x", [alert], sent, NOW, mama.id)).toHaveLength(1);
    sent.add(`https://push/x|${alert.id}@${mama.id}`);
    expect(pendingFor("https://push/x", [alert], sent, NOW, mama.id)).toHaveLength(0);
  });

  it("dice quién está en riesgo y abre el mapa en esa persona", () => {
    const payload = buildLovedPayload(alert, "Mamá", mama.id, "es");
    expect(payload.title).toBe("Mamá podría estar en riesgo");
    expect(payload.body).toContain("A 8 km de la zona de Mamá");
    expect(payload.href).toBe(`/?ser=${mama.id}#seres-queridos`);
    expect(buildLovedPayload(alert, "Mom", mama.id, "en").title).toBe("Mom may be at risk");
  });
});

describe("vincular con un link", () => {
  let code: string;

  beforeEach(async () => {
    const response = await invite(json({ device: juan, inviterName: "Juan", alias: "Mamá" }));
    expect(response.status).toBe(200);
    ({ code } = (await response.json()) as { code: string });
  });

  it("el invitado ve quién lo invita, acepta y aparece marcado si está en riesgo", async () => {
    const info = await inviteInfo(new Request(`http://local/api/links/invite?code=${code}`));
    expect(await info.json()).toMatchObject({ inviterName: "Juan" });

    const accepted = await accept(json({ device: mama, code, lat: 9.8644, lon: -83.9194, reciprocal: true }));
    expect(accepted.status).toBe(200);

    const forJuan = (await (await list(json({ device: juan }))).json()) as LinksResponse;
    expect(forJuan.following).toHaveLength(1);
    expect(forJuan.following[0]).toMatchObject({ alias: "Mamá", located: true, point: { lat: 9.86, lon: -83.92 } });
    expect(forJuan.following[0].risk?.count).toBe(1);
    expect(forJuan.followers).toEqual([{ id: mama.id, name: "Mamá" }]);

    // Juan está en San José, sin alertas: Mamá lo sigue, pero no se revela su zona.
    await location(json({ device: juan, lat: 9.93, lon: -84.08 }));
    const forMama = (await (await list(json({ device: mama }))).json()) as LinksResponse;
    expect(forMama.following[0]).toMatchObject({ alias: "Juan", located: true, point: null });
  });

  it("el link sirve una sola vez y no se puede aceptar uno mismo", async () => {
    expect((await accept(json({ device: juan, code, lat: 9.9, lon: -84 }))).status).toBe(400);
    expect((await accept(json({ device: mama, code, lat: 9.9, lon: -84 }))).status).toBe(200);
    expect((await accept(json({ device: mama, code, lat: 9.9, lon: -84 }))).status).toBe(410);
    expect((await inviteInfo(new Request(`http://local/api/links/invite?code=${code}`))).status).toBe(410);
  });

  it("cualquiera de los dos puede quitar el vínculo; una clave ajena no", async () => {
    await accept(json({ device: mama, code, lat: 9.86, lon: -83.92 }));
    expect((await remove(json({ device: { ...mama, key: "z".repeat(43) }, other: juan.id, role: "follower" }))).status).toBe(403);
    expect((await remove(json({ device: mama, other: juan.id, role: "follower" }))).status).toBe(200);
    const forJuan = (await (await list(json({ device: juan }))).json()) as LinksResponse;
    expect(forJuan.following).toHaveLength(0);
  });
});

describe("aviso con las apps cerradas", () => {
  it("el envío automático avisa a Juan cuando Mamá está en riesgo, una sola vez", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "publica";
    process.env.VAPID_PRIVATE_KEY = "privada";
    const { code } = (await (await invite(json({ device: juan, inviterName: "Juan", alias: "Mamá" }))).json()) as { code: string };
    await accept(json({ device: mama, code, lat: 9.8644, lon: -83.9194 }));
    // Juan está en San José (sin alertas) y su suscripción quedó asociada a su teléfono.
    await getPushStore().upsert({ endpoint: "https://push/juan", p256dh: "k".repeat(12), auth: "a".repeat(12), lat: 9.93, lon: -84.08, lang: "es", deviceId: juan.id });
    sentPushes.length = 0;

    const first = await runPushCycle();
    expect(first.loved).toBe(1);
    expect(sentPushes).toEqual([
      { endpoint: "https://push/juan", payload: expect.objectContaining({ title: "Mamá podría estar en riesgo", href: `/?ser=${mama.id}#seres-queridos` }) },
    ]);

    await runPushCycle();
    expect(sentPushes).toHaveLength(1);
  });
});
