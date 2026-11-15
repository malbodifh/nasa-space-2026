import { affecting, fromAlert, studyHref } from "@/lib/events";
import { displayDetail, eventTitle } from "@/lib/display-i18n";
import type { DisasterAlert } from "@/lib/types";

/** Solo se avisa de lo reciente: una suscripción nueva no debe recibir el archivo de la semana. */
export const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type PushPayload = { title: string; body: string; href: string; tag: string; lang: "es" | "en" };

/** Clave de envío: la alerta y, si es por un ser querido, de quién se trata. */
export function sentKey(alertId: string, lovedId: string | null = null): string {
  return lovedId ? `${alertId}@${lovedId}` : alertId;
}

/**
 * Alertas que afectan ese punto, son recientes y todavía no se enviaron a esa suscripción.
 * Con `lovedId`, el punto es el de un ser querido y el registro de enviados es aparte del propio.
 */
export function pendingFor(
  endpoint: string,
  alerts: DisasterAlert[],
  sent: Set<string>,
  now = Date.now(),
  lovedId: string | null = null,
): DisasterAlert[] {
  return affecting(alerts).filter((alert) => {
    const age = now - Date.parse(alert.date);
    return Number.isFinite(age) && age <= MAX_AGE_MS && !sent.has(`${endpoint}|${sentKey(alert.id, lovedId)}`);
  });
}

/** Aviso de que un ser querido está en riesgo. Abre la app, donde aparece marcado en el mapa. */
export function buildLovedPayload(alert: DisasterAlert, alias: string, lovedId: string, lang: "es" | "en"): PushPayload {
  const item = fromAlert(alert);
  const km = Math.round(alert.distanceKm).toLocaleString(lang === "en" ? "en-US" : "es-CR");
  const title = lang === "en" ? `${alias} may be at risk` : `${alias} podría estar en riesgo`;
  const body = [
    eventTitle(item, lang),
    lang === "en" ? `${km} km from ${alias}'s area` : `A ${km} km de la zona de ${alias}`,
    alert.source,
  ].join(" · ");
  return { title, body, href: `/?ser=${encodeURIComponent(lovedId)}#seres-queridos`, tag: sentKey(alert.id, lovedId), lang };
}

export function buildPayload(alert: DisasterAlert, lang: "es" | "en"): PushPayload {
  const item = fromAlert(alert);
  const km = Math.round(alert.distanceKm).toLocaleString(lang === "en" ? "en-US" : "es-CR");
  const body = [alert.detail ? displayDetail(alert.detail, lang) : null, `${lang === "en" ? "At" : "A"} ${km} km · ${alert.source}`]
    .filter(Boolean)
    .join(" · ");
  return { title: eventTitle(item, lang), body, href: studyHref(item), tag: alert.id, lang };
}
