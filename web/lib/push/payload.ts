import { affecting, fromAlert, studyHref } from "@/lib/events";
import { displayDetail, eventTitle } from "@/lib/display-i18n";
import type { DisasterAlert } from "@/lib/types";

/** Solo se avisa de lo reciente: una suscripción nueva no debe recibir el archivo de la semana. */
export const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type PushPayload = { title: string; body: string; href: string; tag: string; lang: "es" | "en" };

/** Alertas que afectan ese punto, son recientes y todavía no se enviaron a esa suscripción. */
export function pendingFor(endpoint: string, alerts: DisasterAlert[], sent: Set<string>, now = Date.now()): DisasterAlert[] {
  return affecting(alerts).filter((alert) => {
    const age = now - Date.parse(alert.date);
    return Number.isFinite(age) && age <= MAX_AGE_MS && !sent.has(`${endpoint}|${alert.id}`);
  });
}

export function buildPayload(alert: DisasterAlert, lang: "es" | "en"): PushPayload {
  const item = fromAlert(alert);
  const km = Math.round(alert.distanceKm).toLocaleString(lang === "en" ? "en-US" : "es-CR");
  const body = [alert.detail ? displayDetail(alert.detail, lang) : null, `${lang === "en" ? "At" : "A"} ${km} km · ${alert.source}`]
    .filter(Boolean)
    .join(" · ");
  return { title: eventTitle(item, lang), body, href: studyHref(item), tag: alert.id, lang };
}
