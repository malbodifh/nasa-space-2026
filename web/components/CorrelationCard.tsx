"use client";

import { Link2 } from "lucide-react";

import type { Correlation, OverlaySource } from "@/lib/types";

export default function CorrelationCard({
  correlations,
  sources,
  loading,
}: {
  correlations: Correlation[];
  sources: OverlaySource[];
  loading: boolean;
}) {
  return (
    <section aria-labelledby="correlation-title" className="border-t border-ink/80 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Cruce de capas</p>
        {loading ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ash">
            consultando
          </span>
        ) : null}
      </div>

      <h2
        id="correlation-title"
        className="mt-1 text-[12px] leading-snug text-ash"
      >
        Qué coincide con las detecciones de este punto.
      </h2>

      <ol className="mt-3 border-y border-rule">
        {correlations.map((correlation, index) => (
          <li
            key={correlation.kind}
            className="grid grid-cols-[1.5rem_1fr] gap-2 border-b border-rule/70 py-2.5 last:border-b-0"
          >
            <span className="font-mono text-[10px] leading-4 text-ash">0{index + 1}</span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ash">
                {correlation.label}
              </p>
              <p
                className={`mt-0.5 text-[13px] leading-snug ${
                  correlation.tone === "attention" ? "text-burnt" : "text-ink"
                }`}
              >
                {correlation.value}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ash">{correlation.detail}</p>

              {correlation.items.length > 0 ? (
                <ul className="mt-1">
                  {correlation.items.map((item) => (
                    <li
                      key={`${item.name}-${item.meta}`}
                      className="flex items-baseline justify-between gap-2 border-t border-rule/50 py-1 first:border-t-0"
                    >
                      <span className="truncate text-[11px] text-ink2">{item.name}</span>
                      <span className="shrink-0 font-mono text-[9px] text-ash">{item.meta}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-2 flex items-start gap-1.5 font-display text-[12px] italic leading-snug text-ash">
        <Link2 className="mt-0.5 size-3 shrink-0" />
        Coincidencia espacial, no causalidad: estar cerca de un camino o de un área protegida no
        explica un incendio.
      </p>

      {sources.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {sources.map((source) => (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                title={source.note}
                className={`font-mono text-[9px] uppercase tracking-[0.1em] underline-offset-2 hover:underline ${
                  source.fallback ? "text-burnt" : "text-ash"
                }`}
              >
                {source.label.split(" · ")[0]}
                {source.fallback ? " (caché)" : ""}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
