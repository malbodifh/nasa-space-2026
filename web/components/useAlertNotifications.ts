"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { displayDetail, eventTitle, intlLocale } from "@/lib/display-i18n";

import type { Toast } from "@/components/AlertToasts";
import { fromAlert, studyHref } from "@/lib/events";
import { isInstalledApp, refreshPush, subscribePush, type PushResult } from "@/lib/push-client";
import type { DisasterAlert, LatLon } from "@/lib/types";

type Permission = NotificationPermission | "unsupported";

const SEEN_KEY = "mdf:avisos:vistos:v2";

function subscribe() {
  return () => {};
}

function snapshot(): Permission {
  return "Notification" in window ? Notification.permission : "unsupported";
}

function readSeen(): Set<string> | null {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function saveSeen(seen: Set<string>) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-300)));
  } catch {
    // Sin almacenamiento: los avisos funcionan igual durante esta visita.
  }
}

/**
 * Muestra un aviso del sistema. Usa el service worker si está listo (único camino que funciona en
 * Chrome para Android) y, si no, el constructor clásico. Devuelve si el navegador lo aceptó.
 */
async function show(title: string, body: string, href: string | null, tag: string, lang: string): Promise<boolean> {
  const options = { body, tag, icon: "/icon.svg", lang, data: { href }, renotify: true } as NotificationOptions;
  try {
    const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (registration?.active) {
      await registration.showNotification(title, options);
      return true;
    }
  } catch {
    // Se intenta el camino clásico.
  }
  try {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      if (href) window.location.href = href;
    };
    return true;
  } catch {
    return false;
  }
}

/**
 * Avisos del navegador para alertas nuevas que afectan su ubicación, mientras la página está
 * abierta. Las alertas que ya estaban al abrir la página no se notifican.
 */
export function useAlertNotifications(relevant: DisasterAlert[] | null, point: LatLon | null = null) {
  const { locale, t } = useLocale();
  const browser = useSyncExternalStore<Permission>(subscribe, snapshot, () => "default");
  const [requested, setRequested] = useState<Permission | null>(null);
  const [notice, setNotice] = useState<{ es: string; en: string } | null>(null);
  const lat = point?.lat;
  const lon = point?.lon;
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Va después de los avisos: tests/notifications.test.ts lee los estados por posición.
  const [pushOn, setPushOn] = useState(false);
  const permission = requested ?? browser;
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (!relevant) return;
    // Se difiere un tick para no actualizar el estado dentro del propio efecto.
    const timer = window.setTimeout(() => {
      const firstVisit = seenRef.current === null && readSeen() === null;
      const seen = seenRef.current ?? readSeen() ?? new Set<string>();
      seenRef.current = seen;
      const fresh = relevant.filter((alert) => !seen.has(alert.id));
      for (const alert of relevant) seen.add(alert.id);
      saveSeen(seen);
      // Al abrir la página por primera vez no se avisa de lo que ya estaba, salvo el modo demo.
      const toSend = fresh.filter((alert) => (firstVisit ? alert.id.startsWith("demo-") : true));
      if (toSend.length === 0) return;
      const items = toSend.map((alert) => ({
        id: alert.id,
        title: [
          alert.id.startsWith("demo-") ? t("[Demostración]", "[Simulated]") : "",
          // Nunca se presenta un boletín regional como peligro en la ubicación de quien lo recibe.
          alert.category === "tsunami" ? t("Boletín regional de tsunami", "Regional tsunami bulletin") : "",
          eventTitle(fromAlert(alert), locale),
        ].filter(Boolean).join(" · "),
        body: [
          alert.detail ? displayDetail(alert.detail, locale) : null,
          alert.category === "tsunami" ? t("No determina si su costa está incluida; verifique en fuentes oficiales.", "Does not determine whether your coast is included; check official sources.") : null,
          `${t("A", "At")} ${Math.round(alert.distanceKm).toLocaleString(intlLocale(locale))} km · ${alert.source === "Demostración" ? t("Demostración", "Simulation") : alert.source}`,
        ].filter(Boolean).join(" · "),
        href: studyHref(fromAlert(alert)),
        alert,
      }));
      // El aviso dentro de la página siempre se muestra; el del sistema, solo con permiso.
      setToasts((current) => [...current, ...items.filter((item) => !current.some((c) => c.id === item.id))]);
      if (permission === "granted") {
        for (const item of items) void show(item.title, item.body, item.href, item.id, locale);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [relevant, permission, locale, t]);

  // Si ya hay suscripción push, se mantiene al día con la ubicación actual.
  useEffect(() => {
    if (lat === undefined || lon === undefined || permission !== "granted") return;
    let cancelled = false;
    void refreshPush({ lat, lon }, locale).then((active) => {
      if (!cancelled) setPushOn(active);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lon, permission, locale]);

  // Quien tiene la PWA instalada queda suscrito sin hacer nada. Algunos sistemas (iOS) exigen un
  // toque para mostrar el permiso: si no se pudo al abrir, se reintenta con el primer toque.
  useEffect(() => {
    if (lat === undefined || lon === undefined || !isInstalledApp()) return;
    if (!("Notification" in window) || Notification.permission === "denied") return;
    let cancelled = false;
    const attempt = async () => {
      const pushed: PushResult = await subscribePush({ lat, lon }, locale);
      if (cancelled) return;
      setRequested(Notification.permission);
      setPushOn(pushed === "ok");
      if (Notification.permission === "default") window.addEventListener("pointerdown", attempt, { once: true });
    };
    void attempt();
    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", attempt);
    };
  }, [lat, lon, locale]);

  const enable = useCallback(async (): Promise<Permission> => {
    if (!("Notification" in window)) {
      setRequested("unsupported");
      return "unsupported";
    }
    try {
      const result = await Notification.requestPermission();
      setRequested(result);
      if (result === "granted" && lat !== undefined && lon !== undefined) {
        const pushed: PushResult = await subscribePush({ lat, lon }, locale);
        setPushOn(pushed === "ok");
      }
      return result;
    } catch {
      setRequested("denied");
      return "denied";
    }
  }, [lat, lon, locale]);

  /** Pide permiso si falta y envía un aviso de prueba; `notice` cuenta qué pasó. */
  const test = useCallback(async () => {
    setToasts((current) => [
      { id: `prueba-${Date.now()}`, title: t("Aviso de prueba · demostración", "Test notification · simulated"), body: t("Así le llegará una alerta nueva para su ubicación. Este aviso es simulado.", "This is how a new alert for your location will appear. This notification is simulated."), href: null, simulatedTest: true },
      ...current,
    ]);
    const current = permission === "default" ? await enable() : permission;
    if (current === "unsupported") {
      setNotice({ es: "Este navegador no permite avisos del sistema; los verá dentro de la página.", en: "This browser does not support system notifications; you will see them on this page." });
      return;
    }
    if (current !== "granted") {
      setNotice({ es: "El sistema tiene los avisos bloqueados, por eso solo los verá dentro de la página. Para recibirlos fuera, actívelos con el candado junto a la dirección.", en: "System notifications are blocked, so you will only see them on this page. To receive them outside the page, enable them using the lock icon next to the address." });
      return;
    }
    const sent = await show(
      t("Aviso de prueba · demostración", "Test notification · simulated"),
      t("Así le llegará una alerta nueva para su ubicación. Este aviso es simulado.", "This is how a new alert for your location will appear. This notification is simulated."),
      null,
      `prueba-${Date.now()}`,
      locale,
    );
    setNotice(
      sent
        ? { es: "Aviso enviado. Si no lo ve, revise el modo «No molestar» o «Asistente de concentración» del sistema.", en: "Notification sent. If it doesn't appear, check your system's Do Not Disturb or Focus settings." }
        : { es: "El navegador rechazó el aviso. Pruebe con Chrome o Edge en una página https o localhost.", en: "The browser rejected the notification. Try Chrome or Edge on an HTTPS page or localhost." },
    );
  }, [permission, enable, locale, t]);

  const dismiss = useCallback((id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  return { permission, enable, test, pushOn, notice: notice ? t(notice.es, notice.en) : null, toasts, dismiss };
}
