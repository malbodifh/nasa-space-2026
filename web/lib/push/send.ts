import "server-only";

import { sendNotification, setVapidDetails } from "web-push";

import { getLinksStore, type Device } from "@/lib/links/store";
import { alertsByCell } from "@/lib/links/risk";
import { buildLovedPayload, buildPayload, pendingFor, sentKey } from "@/lib/push/payload";
import { getPushStore, type PushSub } from "@/lib/push/store";

const MAX_CELLS = 60;
const MAX_PER_SUB = 3;
const BUDGET_MS = 45_000;

export function pushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export type RunResult = { subscribers: number; cells: number; sent: number; loved: number; removed: number; failed: number; skipped: boolean };

/** A quién se avisa y por quién: la propia ubicación (`loved` null) o la de un ser querido. */
type Target = { sub: PushSub; loved: { id: string; alias: string } | null };

/**
 * Suscripciones de seres queridos: cada suscripción de quien sigue recibe, además de su zona, la
 * zona de cada persona que aceptó compartirla. Si falla la base de vínculos, se sigue sin ellos.
 */
async function lovedTargets(subs: PushSub[]): Promise<{ point: { lat: number; lon: number }; target: Target }[]> {
  const byDevice = new Map<string, PushSub[]>();
  for (const sub of subs) if (sub.deviceId) byDevice.set(sub.deviceId, [...(byDevice.get(sub.deviceId) ?? []), sub]);
  if (byDevice.size === 0) return [];
  try {
    const store = getLinksStore();
    const links = (await store.allLinks()).filter((link) => byDevice.has(link.follower));
    const devices = new Map<string, Device>((await store.devices([...new Set(links.map((link) => link.followed))])).map((d) => [d.id, d]));
    return links.flatMap((link) => {
      const other = devices.get(link.followed);
      if (other?.lat == null || other.lon == null) return [];
      const point = { lat: other.lat, lon: other.lon };
      return (byDevice.get(link.follower) ?? []).map((sub) => ({ point, target: { sub, loved: { id: link.followed, alias: link.alias } } }));
    });
  } catch {
    return [];
  }
}

/** Revisa las alertas de cada zona con suscriptores y envía las nuevas, una sola vez por suscripción. */
export async function runPushCycle(): Promise<RunResult> {
  const result: RunResult = { subscribers: 0, cells: 0, sent: 0, loved: 0, removed: 0, failed: 0, skipped: false };
  if (!pushConfigured()) return { ...result, skipped: true };

  setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:alertas@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );

  const store = getPushStore();
  const [subs, sent] = await Promise.all([store.list(), store.sent()]);
  result.subscribers = subs.length;

  // Las zonas cercanas comparten la consulta: se agrupan por celda de ~1 km.
  const cells = new Map<string, { point: { lat: number; lon: number }; targets: Target[] }>();
  const add = (point: { lat: number; lon: number }, target: Target) => {
    const key = `${point.lat.toFixed(2)}:${point.lon.toFixed(2)}`;
    const cell = cells.get(key) ?? { point, targets: [] };
    cell.targets.push(target);
    cells.set(key, cell);
  };
  for (const sub of subs) add({ lat: sub.lat, lon: sub.lon }, { sub, loved: null });
  for (const { point, target } of await lovedTargets(subs)) add(point, target);

  const alertsAt = alertsByCell();
  const started = Date.now();
  const done: { endpoint: string; alertId: string }[] = [];
  const dead = new Set<string>();

  for (const { point, targets } of [...cells.values()].slice(0, MAX_CELLS)) {
    if (Date.now() - started > BUDGET_MS) break;
    result.cells += 1;
    let alerts;
    try {
      alerts = await alertsAt(point);
    } catch {
      result.failed += targets.length;
      continue;
    }

    for (const { sub, loved } of targets) {
      if (dead.has(sub.endpoint)) continue;
      const lovedId = loved?.id ?? null;
      const pending = pendingFor(sub.endpoint, alerts, sent, Date.now(), lovedId);
      for (const alert of pending.slice(0, MAX_PER_SUB)) {
        const payload = loved ? buildLovedPayload(alert, loved.alias, loved.id, sub.lang) : buildPayload(alert, sub.lang);
        try {
          await sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), {
            TTL: 3600,
            urgency: "high",
          });
          done.push({ endpoint: sub.endpoint, alertId: sentKey(alert.id, lovedId) });
          result.sent += 1;
          if (loved) result.loved += 1;
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            dead.add(sub.endpoint);
            break;
          }
          result.failed += 1;
        }
      }
      // Lo que no se envió por el tope también se marca: no se acumula ni se reenvía después.
      for (const alert of pending.slice(MAX_PER_SUB)) done.push({ endpoint: sub.endpoint, alertId: sentKey(alert.id, lovedId) });
    }
  }

  await store.markSent(done).catch(() => {});
  for (const endpoint of dead) {
    await store.remove(endpoint).catch(() => {});
    result.removed += 1;
  }
  return result;
}
