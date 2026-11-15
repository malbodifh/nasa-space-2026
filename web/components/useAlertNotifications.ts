"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { Toast } from "@/components/AlertToasts";
import { fromAlert, studyHref } from "@/lib/events";
import type { DisasterAlert } from "@/lib/types";

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
async function show(title: string, body: string, href: string | null, tag: string): Promise<boolean> {
  const options = { body, tag, icon: "/icon.svg", lang: "es", data: { href }, renotify: true } as NotificationOptions;
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
export function useAlertNotifications(relevant: DisasterAlert[] | null) {
  const browser = useSyncExternalStore<Permission>(subscribe, snapshot, () => "default");
  const [requested, setRequested] = useState<Permission | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
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
      const toSend = fresh.filter((alert) => (firstVisit ? alert.id.startsWith("demo-") : true)).slice(0, 3);
      if (toSend.length === 0) return;
      const items = toSend.map((alert) => ({
        id: alert.id,
        title: alert.id.startsWith("demo-") ? `[Demo] ${alert.title}` : alert.title,
        body: [alert.detail, `A ${Math.round(alert.distanceKm)} km · ${alert.source}`].filter(Boolean).join(" · "),
        href: studyHref(fromAlert(alert)),
      }));
      // El aviso dentro de la página siempre se muestra; el del sistema, solo con permiso.
      setToasts((current) => [...items.filter((item) => !current.some((c) => c.id === item.id)), ...current].slice(0, 4));
      if (permission === "granted") {
        for (const item of items) void show(item.title, item.body, item.href, item.id);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [relevant, permission]);

  const enable = useCallback(async (): Promise<Permission> => {
    if (!("Notification" in window)) {
      setRequested("unsupported");
      return "unsupported";
    }
    try {
      const result = await Notification.requestPermission();
      setRequested(result);
      return result;
    } catch {
      setRequested("denied");
      return "denied";
    }
  }, []);

  /** Pide permiso si falta y envía un aviso de prueba; `notice` cuenta qué pasó. */
  const test = useCallback(async () => {
    setToasts((current) => [
      { id: `prueba-${Date.now()}`, title: "Aviso de prueba", body: "Así le llegará una alerta nueva para su ubicación.", href: null },
      ...current,
    ].slice(0, 4));
    const current = permission === "default" ? await enable() : permission;
    if (current === "unsupported") {
      setNotice("Este navegador no permite avisos del sistema; los verá dentro de la página.");
      return;
    }
    if (current !== "granted") {
      setNotice("El sistema tiene los avisos bloqueados, por eso solo los verá dentro de la página. Para recibirlos fuera, actívelos con el candado junto a la dirección.");
      return;
    }
    const sent = await show(
      "Aviso de prueba",
      "Así le llegará una alerta nueva para su ubicación.",
      null,
      `prueba-${Date.now()}`,
    );
    setNotice(
      sent
        ? "Aviso enviado. Si no lo ve, revise el modo «No molestar» o «Asistente de concentración» del sistema."
        : "El navegador rechazó el aviso. Pruebe con Chrome o Edge en una página https o localhost.",
    );
  }, [permission, enable]);

  const dismiss = useCallback((id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  return { permission, enable, test, notice, toasts, dismiss };
}
