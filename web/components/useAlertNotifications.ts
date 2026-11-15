"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

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

function show(title: string, body: string, href: string | null, tag: string) {
  try {
    const notification = new Notification(title, { body, tag, icon: "/icon.svg", lang: "es" });
    notification.onclick = () => {
      window.focus();
      if (href) window.location.href = href;
    };
  } catch {
    // Algunos navegadores solo notifican desde un service worker.
  }
}

/**
 * Avisos del navegador para alertas nuevas que afectan su ubicación, mientras la página está
 * abierta. Las alertas que ya estaban al abrir la página no se notifican.
 */
export function useAlertNotifications(relevant: DisasterAlert[] | null) {
  const browser = useSyncExternalStore<Permission>(subscribe, snapshot, () => "default");
  const [requested, setRequested] = useState<Permission | null>(null);
  const permission = requested ?? browser;
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!relevant) return;
    const firstVisit = seenRef.current === null && readSeen() === null;
    const seen = seenRef.current ?? readSeen() ?? new Set<string>();
    seenRef.current = seen;
    const fresh = relevant.filter((alert) => !seen.has(alert.id));
    for (const alert of relevant) seen.add(alert.id);
    saveSeen(seen);
    if (firstVisit || permission !== "granted") return;
    for (const alert of fresh.slice(0, 3)) {
      show(
        alert.title,
        [alert.detail, `A ${Math.round(alert.distanceKm)} km · ${alert.source}`].filter(Boolean).join(" · "),
        studyHref(fromAlert(alert)),
        alert.id,
      );
    }
  }, [relevant, permission]);

  const enable = useCallback(async () => {
    if (!("Notification" in window)) {
      setRequested("unsupported");
      return;
    }
    try {
      setRequested(await Notification.requestPermission());
    } catch {
      setRequested("denied");
    }
  }, []);

  const test = useCallback(() => {
    show("Aviso de prueba", "Así le llegará una alerta nueva para su ubicación.", null, "prueba");
  }, []);

  return { permission, enable, test };
}
