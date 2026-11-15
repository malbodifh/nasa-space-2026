"use client";

import { AlertTriangle, MapPin } from "lucide-react";

import { actionsFor } from "@/lib/hazard-actions";
import { groupAlerts, hazardFor } from "@/lib/hazards";
import type { DisasterAlert } from "@/lib/types";

const LEVEL_PRIORITY: Record<DisasterAlert["level"], number> = {
  red: 0,
  orange: 1,
  green: 2,
  info: 3,
};

export default function HazardCard({
  alerts,
  radiusKm,
  hidden,
  onToggle,
  onFocus,
  onRadar,
  hasRadar,
}: {
  alerts: DisasterAlert[];
  radiusKm: number;
  hidden: string[];
  onToggle: (category: string) => void;
  onFocus: (alert: DisasterAlert) => void;
  onRadar?: (alert: DisasterAlert) => void;
  hasRadar?: (alert: DisasterAlert) => boolean;
}) {
  const groups = groupAlerts(alerts);
  const inRadius = alerts.filter((alert) => alert.distanceKm <= radiusKm);
  const nearest = [...alerts].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
  const focusEvent = [...alerts].sort(
    (a, b) => LEVEL_PRIORITY[a.level] - LEVEL_PRIORITY[b.level] || a.distanceKm - b.distanceKm,
  )[0];

  return (
    <section aria-labelledby="hazards-title" className="border-t border-ink/80 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Amenazas activas</p>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ash">
          EONET · GDACS
        </span>
      </div>

      <h2 id="hazards-title" className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-[44px] leading-none tracking-tight">{alerts.length}</span>
        <span className="font-display text-lg italic text-ash">
          {alerts.length === 1 ? "evento abierto" : "eventos abiertos"}
        </span>
      </h2>

      <p className="mt-1 text-[12px] leading-snug text-ink2">
        {alerts.length === 0
          ? `Sin eventos reportados a menos de 600 km de este punto.`
          : `${inRadius.length} dentro de ${radiusKm} km · ${alerts.length - inRadius.length} en la región (600 km).`}
      </p>

      {groups.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar amenazas en el mapa">
          {groups.map(({ hazard, alerts: list }) => {
            const active = !hidden.includes(hazard.id);
            return (
              <button
                key={hazard.id}
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(hazard.id)}
                className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition ${
                  active
                    ? "border-rule bg-sheet text-ink"
                    : "border-rule/60 bg-transparent text-ash/60 line-through"
                }`}
              >
                <span
                  className="inline-block size-1.5"
                  style={{ backgroundColor: active ? hazard.color : "#c9c1b2" }}
                  aria-hidden
                />
                {hazard.label}
                <span className="text-ash">{list.length}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {nearest.length === 0 ? (
        <p className="mt-3 border-l-2 border-rule pl-2 text-[11px] leading-relaxed text-ash">
          NASA EONET y GDACS no reportan eventos abiertos en el área. La consulta se repite cada
          minuto.
        </p>
      ) : (
        <ul className="mt-3 border-y border-rule">
          {nearest.map((alert) => (
            <li key={alert.id} className="flex items-baseline gap-2 border-b border-rule/70 last:border-b-0">
              <button
                type="button"
                onClick={() => onFocus(alert)}
                title="Centrar en el mapa"
                className="group flex min-w-0 flex-1 items-baseline gap-2 py-2 text-left"
              >
                <AlertTriangle
                  className="mt-0.5 size-3 shrink-0"
                  style={{ color: "var(--color-burnt)" }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] leading-snug text-ink group-hover:underline group-hover:decoration-burnt group-hover:underline-offset-2">
                    {alert.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ash">
                    {alert.categoryLabel} · {alert.source} · {alert.distanceKm.toFixed(1)} km
                  </p>
                </div>
                <MapPin className="size-3 shrink-0 text-ash group-hover:text-burnt" aria-hidden />
              </button>
              {onRadar && hasRadar?.(alert) ? (
                <button
                  type="button"
                  onClick={() => onRadar(alert)}
                  title="Ver el cambio de la superficie con radar NISAR"
                  className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-burnt underline underline-offset-4"
                >
                  Ver con radar
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {focusEvent ? (
        <div className="mt-3 border-l-2 border-ink pl-2.5">
          <p className="eyebrow">Qué hacer · {hazardFor(focusEvent.category).label}</p>
          <ul className="mt-1 space-y-0.5">
            {actionsFor(focusEvent.category).map((action) => (
              <li key={action} className="text-[11px] leading-relaxed text-ink2">
                — {action}
              </li>
            ))}
          </ul>
          <a
            href="https://www.cne.go.cr/"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block font-mono text-[9px] uppercase tracking-[0.12em] text-burnt underline underline-offset-4"
          >
            Boletines oficiales · CNE
          </a>
        </div>
      ) : null}

      <p className="mt-2 font-display text-[12px] italic leading-snug text-ash">
        Reporte observacional de eventos abiertos. No es una alerta oficial ni un pronóstico.
      </p>
    </section>
  );
}
