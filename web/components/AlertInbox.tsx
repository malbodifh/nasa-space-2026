"use client";

import { Bell, BellOff, BellRing, FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AlertSeverity, AppAlert } from "@/lib/types";

const SEVERITY: Record<AlertSeverity, { label: string; dot: string; text: string }> = {
  critical: { label: "Crítico", dot: "bg-wine", text: "text-wine" },
  warning: { label: "Alerta", dot: "bg-burnt", text: "text-burnt" },
  watch: { label: "Vigilancia", dot: "bg-ochre", text: "text-ochre" },
  info: { label: "Informativo", dot: "bg-ash", text: "text-ash" },
};

const SCOPE: Record<AppAlert["scope"], string> = {
  point: "en tu punto",
  radius: "en tu radio",
  region: "en la región",
};

function clock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  }).format(date);
}

export default function AlertInbox({
  alerts,
  loading,
  failed,
  permission,
  testing,
  testMode,
  onEnable,
  onTest,
  onToggleTestMode,
}: {
  alerts: AppAlert[];
  loading: boolean;
  failed: boolean;
  permission: NotificationPermission | "unsupported";
  testing: boolean;
  testMode: boolean;
  onEnable: () => void;
  onTest: () => void;
  onToggleTestMode: () => void;
}) {
  const visible = alerts.slice(0, 4);

  return (
    <section aria-labelledby="alerts-title" className="border-t border-ink/80 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Alertas</p>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-ash">
          {permission === "granted" ? (
            <BellRing className="size-3 text-forest" />
          ) : (
            <BellOff className="size-3" />
          )}
          {permission === "granted"
            ? "notificaciones activas"
            : permission === "denied"
              ? "notificaciones bloqueadas"
              : permission === "unsupported"
                ? "sin soporte del navegador"
                : "notificaciones apagadas"}
        </span>
      </div>

      <h2 id="alerts-title" className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-[34px] leading-none tracking-tight">{alerts.length}</span>
        <span className="font-display text-base italic text-ash">
          {alerts.length === 1 ? "aviso activo" : "avisos activos"}
        </span>
        {loading ? (
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.14em] text-ash">
            revisando
          </span>
        ) : null}
      </h2>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {permission !== "granted" && permission !== "unsupported" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEnable}
            className="rounded-none border-rule bg-transparent text-[11px] hover:bg-rule/40"
          >
            <Bell className="size-3.5" />
            Activar notificaciones
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onTest}
          disabled={testing}
          className="rounded-none border-ink bg-transparent text-[11px] hover:bg-ink hover:text-paper"
        >
          <FlaskConical className="size-3.5" />
          {testing ? "Enviando…" : "Probar alerta"}
        </Button>
        <button
          type="button"
          onClick={onToggleTestMode}
          aria-pressed={testMode}
          className={`font-mono text-[9px] uppercase tracking-[0.1em] underline-offset-4 ${
            testMode ? "text-burnt underline decoration-burnt" : "text-ash hover:text-ink"
          }`}
          title="Genera una alerta de prueba cada 60 s"
        >
          modo test
        </button>
      </div>

      {failed ? (
        <p className="mt-3 border-l-2 border-burnt pl-2 font-mono text-[10px] leading-relaxed text-burnt">
          No pudimos consultar el servicio de alertas. Reintentamos cada minuto.
        </p>
      ) : null}

      {visible.length === 0 && !loading && !failed ? (
        <p className="mt-3 border-l-2 border-rule pl-2 text-[11px] leading-relaxed text-ash">
          Sin avisos activos para este punto. El riesgo se recalcula cada minuto con GIBS, POWER,
          EONET y GDACS.
        </p>
      ) : null}

      <ul className="mt-3">
        {visible.map((alert) => {
          const severity = SEVERITY[alert.severity];
          return (
            <li key={alert.id} className="border-b border-rule/70 py-2 last:border-b-0">
              <div className="flex items-baseline gap-2">
                <span className={`mt-1 inline-block size-1.5 shrink-0 ${severity.dot}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`font-mono text-[9px] uppercase tracking-[0.14em] ${severity.text}`}>
                      {severity.label}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] text-ash">
                      {alert.kind === "test" ? "prueba" : SCOPE[alert.scope]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-ink">{alert.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ash">{alert.body}</p>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-2 font-mono text-[9px] text-ash">
                    <span>{alert.source}</span>
                    <span>·</span>
                    <span>{clock(alert.createdAt)}</span>
                    {alert.distanceKm !== null && alert.distanceKm > 0 ? (
                      <>
                        <span>·</span>
                        <span>{alert.distanceKm.toFixed(1)} km</span>
                      </>
                    ) : null}
                    {alert.url ? (
                      <>
                        <span>·</span>
                        <a
                          href={alert.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 hover:text-ink"
                        >
                          ver fuente
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
