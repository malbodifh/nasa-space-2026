"use client";

import { X } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

import type { AppAlert } from "@/lib/types";

const ACCENT: Record<AppAlert["severity"], string> = {
  critical: "border-l-wine",
  warning: "border-l-burnt",
  watch: "border-l-ochre",
  info: "border-l-ash",
};

const LABEL: Record<AppAlert["severity"], string> = {
  critical: "Crítico",
  warning: "Alerta",
  watch: "Vigilancia",
  info: "Informativo",
};

export default function AlertToast({
  alert,
  onClose,
}: {
  alert: AppAlert;
  onClose: () => void;
}) {
  const { t } = useLocale();
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 right-4 z-50 w-[min(92vw,360px)] border border-rule border-l-[3px] bg-sheet p-3 shadow-[5px_5px_0_rgba(27,26,23,0.12)] ${ACCENT[alert.severity]}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ash">
          {t(LABEL[alert.severity], { critical: "Critical", warning: "Warning", watch: "Watch", info: "Information" }[alert.severity])} · {alert.source}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("Cerrar alerta", "Dismiss alert")}
          className="-mr-1 -mt-1 p-1 text-ash hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <p className="mt-1 font-display text-[17px] leading-tight text-ink">{alert.title}</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ash">{alert.body}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        {alert.url ? (
          <a
            href={alert.url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink underline underline-offset-4 hover:text-burnt"
          >
            {t("Ver fuente", "View source")}
          </a>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ash">
            {t("Prototipo", "Prototype")}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[9px] uppercase tracking-[0.12em] text-ash underline underline-offset-4 hover:text-ink"
        >
          {t("Entendido", "Got it")}
        </button>
      </div>
    </div>
  );
}
