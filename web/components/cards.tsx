"use client";

import {
  ArrowUpRight,
  Clock3,
  Droplets,
  Flame,
  ThermometerSun,
  Wind,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MEMORY_DATES, shortDate } from "@/lib/demo";
import type { ApiMeta, ClimateStats, FireStats, RiskAssessment, RiskLevel } from "@/lib/types";

const nf = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 });

const LEVEL: Record<RiskLevel, { label: string; text: string; bar: string }> = {
  info: { label: "Sin datos", text: "text-ash", bar: "bg-ash" },
  low: { label: "Bajo", text: "text-forest", bar: "bg-forest" },
  moderate: { label: "Moderado", text: "text-ochre", bar: "bg-ochre" },
  high: { label: "Alto", text: "text-burnt", bar: "bg-burnt" },
  extreme: { label: "Extremo", text: "text-wine", bar: "bg-wine" },
};

const CONFIDENCE = { low: "baja", medium: "media", high: "alta" } as const;

function updatedAtLabel(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  }).format(new Date(iso));
}

export function RiskCard({ risk, meta }: { risk: RiskAssessment; meta?: ApiMeta }) {
  const theme = LEVEL[risk.level];

  return (
    <section aria-labelledby="risk-title" className="border-t border-ink/80 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Riesgo actual</p>
        <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${theme.text}`}>
          {theme.label}
        </span>
      </div>

      <div className="mt-1 flex items-end gap-3">
        <span id="risk-title" className="font-display text-[76px] leading-[0.85] tracking-tight">
          {risk.score}
        </span>
        <span className="pb-2 font-mono text-[11px] text-ash">/ 100</span>
      </div>

      <div className="mt-3 h-1 w-full bg-rule/70" aria-hidden>
        <div className={`h-full ${theme.bar}`} style={{ width: `${Math.max(2, risk.score)}%` }} />
      </div>

      <ol className="mt-4 border-y border-rule">
        {risk.reasons.map((reason, index) => (
          <li
            key={reason.label}
            className="grid grid-cols-[1.6rem_1fr] gap-2 border-b border-rule/70 py-2.5 last:border-b-0"
          >
            <span className="font-mono text-[10px] leading-5 text-ash">0{index + 1}</span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ash">
                {reason.label}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink2">{reason.value}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-ash">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3" />
          actualizado {updatedAtLabel(risk.updatedAt)}
        </span>
        <span>confianza {CONFIDENCE[risk.confidence]}</span>
        {meta?.fallback ? <span className="text-burnt">incluye caché</span> : null}
        {meta?.durationMs ? <span>{meta.durationMs} ms</span> : null}
      </div>

      <Button asChild className="mt-4 w-full rounded-none bg-ink text-paper hover:bg-ink/90">
        <a href={risk.officialUrl} target="_blank" rel="noreferrer">
          Abrir alerta oficial · SENAPRED
          <ArrowUpRight className="size-4" />
        </a>
      </Button>

      <p className="mt-2 text-[11px] leading-relaxed text-ash">{risk.disclaimer}</p>
    </section>
  );
}

export function MemoryCard({
  memory,
  selectedDate,
  onSelect,
}: {
  memory: FireStats;
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
}) {
  const isSelected = selectedDate === memory.date;

  return (
    <section aria-labelledby="memory-title" className="border-t border-ink/80 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Memoria del lugar</p>
        <span className="font-mono text-[10px] text-ash">{shortDate(memory.date)}</span>
      </div>

      <h2 id="memory-title" className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-[44px] leading-none tracking-tight">{memory.count}</span>
        <span className="font-display text-lg italic text-ash">detecciones</span>
      </h2>

      <p className="mt-1 text-[13px] leading-snug text-ink2">
        El foco más cercano quedó a{" "}
        <span className="font-mono">{memory.nearestKm === null ? "—" : `${nf.format(memory.nearestKm)} km`}</span>
        {memory.maxFrp !== null ? (
          <>
            {" "}
            y el FRP máximo fue <span className="font-mono">{nf.format(memory.maxFrp)} MW</span>.
          </>
        ) : (
          "."
        )}
      </p>

      <div className="mt-3 grid grid-cols-3 border-y border-rule">
        <div className="border-r border-rule px-2 py-2">
          <p className="eyebrow">Detecciones</p>
          <p className="mt-0.5 font-mono text-lg">{memory.count}</p>
        </div>
        <div className="border-r border-rule px-2 py-2">
          <p className="eyebrow">Más cerca</p>
          <p className="mt-0.5 font-mono text-lg">
            {memory.nearestKm === null ? "—" : `${nf.format(memory.nearestKm)} km`}
          </p>
        </div>
        <div className="px-2 py-2">
          <p className="eyebrow">FRP máx.</p>
          <p className="mt-0.5 font-mono text-lg">
            {memory.maxFrp === null ? "—" : `${nf.format(memory.maxFrp)} MW`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {MEMORY_DATES.map((item) => (
          <button
            key={item.date}
            type="button"
            onClick={() => onSelect(item.date)}
            className={`border-b pb-0.5 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
              isSelected && selectedDate === item.date
                ? "border-burnt text-burnt"
                : "border-transparent text-ash hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
        <span className="text-rule">/</span>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`border-b pb-0.5 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
            selectedDate === null ? "border-burnt text-burnt" : "border-transparent text-ash hover:text-ink"
          }`}
        >
          Hoy
        </button>
      </div>

      <p className="mt-2 font-display text-[13px] italic leading-snug text-ash">
        Esto ya pasó. La memoria no estima lo que va a pasar.
      </p>
    </section>
  );
}

export function ClimateCard({ climate }: { climate: ClimateStats | null }) {
  if (!climate) {
    return (
      <section className="border-t border-ink/80 pt-4">
        <p className="eyebrow">Condiciones de fondo</p>
        <p className="mt-2 text-sm text-ash">No pudimos consultar POWER para este punto.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="climate-title" className="border-t border-ink/80 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Condiciones de fondo</p>
        <span className="font-mono text-[10px] text-ash">NASA POWER · {shortDate(climate.lastDate)}</span>
      </div>

      <h2 id="climate-title" className="sr-only">
        Condiciones de fondo
      </h2>

      <div className="mt-2">
        <div className="data-row">
          <span className="data-key inline-flex items-center gap-1.5">
            <Droplets className="size-3.5" /> Lluvia 30 días
          </span>
          <span className="data-value">{nf.format(climate.rain30mm)} mm</span>
        </div>
        <div className="data-row">
          <span className="data-key">Percentil histórico</span>
          <span className="data-value">{nf.format(climate.rain30Percentile)}</span>
        </div>
        <div className="data-row">
          <span className="data-key">Días sin lluvia</span>
          <span className="data-value">{climate.daysSinceRain} d</span>
        </div>
        <div className="data-row">
          <span className="data-key inline-flex items-center gap-1.5">
            <ThermometerSun className="size-3.5" /> Temperatura máx.
          </span>
          <span className="data-value">{climate.tMaxC ?? "—"} °C</span>
        </div>
        <div className="data-row">
          <span className="data-key inline-flex items-center gap-1.5">
            <Wind className="size-3.5" /> Viento
          </span>
          <span className="data-value">{climate.windMs ?? "—"} m/s</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1 w-full bg-rule/70">
          <div
            className="h-full bg-forest"
            style={{ width: `${Math.min(100, Math.max(2, climate.rain30Percentile))}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[9px] text-ash">
          <span>más seco que {nf.format(climate.rain30Percentile)} % de los años</span>
          <span>{climate.years} años</span>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-ash">
        POWER es reanálisis de ~0,5° con 2–3 días de latencia. No representa extremos locales.
      </p>
    </section>
  );
}

export function SourcesCard({ risk }: { risk: RiskAssessment }) {
  return (
    <section className="border-t border-ink/80 pt-4">
      <p className="eyebrow">Fuentes y límites</p>
      <ul className="mt-2">
        {risk.sources.map((source) => (
          <li key={source.name} className="flex items-baseline justify-between gap-3 border-b border-rule/70 py-1.5 last:border-b-0">
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-ink underline-offset-4 hover:text-burnt hover:underline"
            >
              <Flame className="size-3 text-burnt" />
              {source.name}
            </a>
            <span className="font-mono text-[10px] text-ash">{source.latency}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] leading-relaxed text-ash">
        Datos: NASA GIBS y NASA POWER. Imágenes: NASA Worldview. Mapa: © OpenStreetMap, © CARTO.
        NASA no respalda este proyecto.
      </p>
    </section>
  );
}
