import "server-only";

import { sendNotification, setVapidDetails } from "web-push";

import { getEvents } from "@/lib/sources/overlays";
import { buildPayload, pendingFor } from "@/lib/push/payload";
import { getPushStore, type PushSub } from "@/lib/push/store";

const MAX_CELLS = 40;
const MAX_PER_SUB = 3;
const BUDGET_MS = 45_000;

export function pushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export type RunResult = { subscribers: number; cells: number; sent: number; removed: number; failed: number; skipped: boolean };

/** Revisa las alertas de cada zona con suscriptores y envía las nuevas, una sola vez por suscripción. */
export async function runPushCycle(): Promise<RunResult> {
  const result: RunResult = { subscribers: 0, cells: 0, sent: 0, removed: 0, failed: 0, skipped: false };
  if (!pushConfigured()) return { ...result, skipped: true };

  setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:alertas@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );

  const store = getPushStore();
  const [subs, sent] = await Promise.all([store.list(), store.sent()]);
  result.subscribers = subs.length;

  // Las suscripciones cercanas comparten la consulta: se agrupan por celda de ~1 km.
  const cells = new Map<string, PushSub[]>();
  for (const sub of subs) {
    const key = `${sub.lat.toFixed(2)}:${sub.lon.toFixed(2)}`;
    cells.set(key, [...(cells.get(key) ?? []), sub]);
  }

  const started = Date.now();
  const done: { endpoint: string; alertId: string }[] = [];
  const dead: string[] = [];

  for (const [key, members] of [...cells].slice(0, MAX_CELLS)) {
    if (Date.now() - started > BUDGET_MS) break;
    result.cells += 1;
    const [lat, lon] = key.split(":").map(Number);
    let alerts;
    try {
      alerts = (await getEvents({ lat, lon })).alerts;
    } catch {
      result.failed += members.length;
      continue;
    }

    for (const sub of members) {
      const pending = pendingFor(sub.endpoint, alerts, sent).slice(0, MAX_PER_SUB);
      for (const alert of pending) {
        try {
          await sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(buildPayload(alert, sub.lang)),
            { TTL: 3600, urgency: "high" },
          );
          done.push({ endpoint: sub.endpoint, alertId: alert.id });
          result.sent += 1;
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            dead.push(sub.endpoint);
            break;
          }
          result.failed += 1;
        }
      }
      // Lo que no se envió por el tope también se marca: no se acumula ni se reenvía después.
      for (const alert of pendingFor(sub.endpoint, alerts, sent).slice(MAX_PER_SUB)) {
        done.push({ endpoint: sub.endpoint, alertId: alert.id });
      }
    }
  }

  await store.markSent(done).catch(() => {});
  for (const endpoint of new Set(dead)) {
    await store.remove(endpoint).catch(() => {});
    result.removed += 1;
  }
  return result;
}
