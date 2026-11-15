"use client";

import { BellRing, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { displayDetail, eventTitle, intlLocale } from "@/lib/display-i18n";
import { fromAlert } from "@/lib/events";
import type { DisasterAlert } from "@/lib/types";

export type Toast = { id: string; title: string; body: string; href: string | null; alert?: DisasterAlert; simulatedTest?: boolean };

const SHOW_MS = 9000;

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const { locale, t } = useLocale();
  const title = toast.simulatedTest ? t("Aviso de prueba · demostración", "Test notification · simulated")
    : toast.alert?.id.startsWith("demo-") ? `${t("[Demostración]", "[Simulated]")} ${eventTitle(fromAlert(toast.alert), locale)}` : toast.alert ? eventTitle(fromAlert(toast.alert), locale) : toast.title;
  const body = toast.simulatedTest ? t("Así le llegará una alerta nueva para su ubicación. Este aviso es simulado.", "This is how a new alert for your location will appear. This notification is simulated.")
    : toast.alert ? [
      toast.alert.detail ? displayDetail(toast.alert.detail, locale) : null,
      `${t("A", "At")} ${Math.round(toast.alert.distanceKm).toLocaleString(intlLocale(locale))} km · ${toast.alert.source === "Demostración" ? t("Demostración", "Simulation") : toast.alert.source}`,
    ].filter(Boolean).join(" · ") : toast.body;
  useEffect(() => {
    const timer = window.setTimeout(() => onClose(toast.id), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <li
      role="alert"
      className="pointer-events-auto flex gap-3 rounded-[14px] border border-linea bg-elevada p-4"
      style={{ boxShadow: "var(--sombra-tarjeta)" }}
    >
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primario-suave text-primario-fuerte">
        <BellRing className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-snug font-semibold text-tinta">{title}</p>
        {body ? <p className="mt-0.5 text-[13px] leading-snug text-tinta-suave">{body}</p> : null}
        {toast.href ? (
          <Link href={toast.href} prefetch={false} aria-label={`${t("Ver cómo cambió la superficie", "See how the surface changed")}: ${title}`} className="mt-1.5 inline-block text-[13px] font-semibold text-primario-fuerte underline underline-offset-4">
            {t("Ver cómo cambió la superficie", "See how the surface changed")}
          </Link>
        ) : null}
      </div>
      <button type="button" onClick={() => onClose(toast.id)} aria-label={t("Cerrar aviso", "Dismiss notification")} className="h-fit text-tinta-suave hover:text-tinta">
        <X className="size-4" aria-hidden />
      </button>
    </li>
  );
}

/** Avisos dentro de la página: funcionan aunque el navegador bloquee las notificaciones del sistema. */
export default function AlertToasts({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <ul className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]">
      {toasts.slice(0, 3).map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </ul>
  );
}
