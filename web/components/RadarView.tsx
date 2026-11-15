"use client";

import { AlertTriangle, ExternalLink, Pause, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import SarCompare from "@/components/SarCompare";
import SarExplainer from "@/components/SarExplainer";
import { shortDate } from "@/lib/demo";
import {
  SAR_METHOD,
  SAR_SOURCE,
  SAR_ZONES,
  formatPct,
  baselineIndex,
  nearestAcquisition,
  peakChange,
  sarZone,
  zoneAreaKm2,
  type SarAcquisition,
} from "@/lib/sar";
import type { DisasterAlert, EventsResponse } from "@/lib/types";

const SarMap = dynamic(() => import("@/components/SarMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-paper font-mono text-[11px] text-ash">
      Cargando mapa…
    </div>
  ),
});

export type RadarFocus = { zoneId: string; date: string; nonce: number; title: string };

type Picked = { zoneId: string; index: number; nonce: number | null };

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json() as Promise<T>;
}

function ChangeChart({
  acquisitions,
  index,
  onSelect,
}: {
  acquisitions: SarAcquisition[];
  index: number;
  onSelect: (index: number) => void;
}) {
  // Escala mínima del 5 %: así un cambio chico se ve chico en todas las zonas.
  const max = Math.max(5, ...acquisitions.map((item) => item.darkerPct + item.brighterPct));
  return (
    <div className="mt-3">
      <p className="mb-1 text-right font-mono text-[9px] uppercase tracking-[0.08em] text-ash">
        % de la zona que cambió · tope {formatPct(Math.ceil(max))}
      </p>
      <div className="flex h-20 items-end gap-1 border-b border-rule" role="group" aria-label="Cambio por fecha">
        {acquisitions.map((item, i) => {
          const total = item.darkerPct + item.brighterPct;
          return (
            <button
              key={item.date}
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={i === index}
              aria-label={`${shortDate(item.date)}: ${formatPct(item.brighterPct)} más brillante, ${formatPct(item.darkerPct)} más oscuro`}
              title={`${shortDate(item.date)} · +${formatPct(item.brighterPct)} / −${formatPct(item.darkerPct)}`}
              className={`flex h-full flex-1 flex-col justify-end ${i === index ? "bg-burnt/10" : "hover:bg-rule/30"}`}
            >
              <span className="block bg-[#ea580c]" style={{ height: `${(item.brighterPct / max) * 100}%` }} />
              <span className="block bg-[#2563eb]" style={{ height: `${(item.darkerPct / max) * 100}%` }} />
              {total === 0 ? <span className="block h-px bg-ash/50" /> : null}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.08em] text-ash">
        <span>{shortDate(acquisitions[0].date)}</span>
        <span>{shortDate(acquisitions[acquisitions.length - 1].date)}</span>
      </div>
    </div>
  );
}

export default function RadarView({
  zoneId,
  onZoneChange,
  focus,
}: {
  zoneId: string;
  onZoneChange: (id: string) => void;
  focus: RadarFocus | null;
}) {
  const zone = sarZone(zoneId) ?? SAR_ZONES[0];
  const acquisitions = zone.acquisitions;
  const [picked, setPicked] = useState<Picked | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showRadar, setShowRadar] = useState(true);
  const [showChange, setShowChange] = useState(true);
  const [opacity, setOpacity] = useState(0.9);

  const baseIndex = baselineIndex(acquisitions);
  const peakIndex = peakChange(acquisitions);
  const focusHere = focus && focus.zoneId === zone.id ? focus : null;
  // Un evento abierto desde antes del primer dato se muestra con la pasada más reciente.
  const focusBefore = focusHere ? focusHere.date.slice(0, 10) < acquisitions[0].date : false;
  const focusIndex = !focusHere
    ? -1
    : focusBefore
      ? acquisitions.length - 1
      : nearestAcquisition(acquisitions, focusHere.date);
  const defaultIndex = focusIndex >= 0 && focusIndex !== baseIndex ? focusIndex : peakIndex;
  const index =
    picked && picked.zoneId === zone.id && picked.nonce === (focusHere?.nonce ?? null)
      ? Math.min(picked.index, acquisitions.length - 1)
      : defaultIndex;
  const current = acquisitions[index];
  const baseline = acquisitions[baseIndex];

  function select(next: number) {
    setPicked({ zoneId: zone.id, index: next, nonce: focusHere?.nonce ?? null });
  }

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setPicked((prev) => {
        const from =
          prev && prev.zoneId === zone.id && prev.nonce === (focusHere?.nonce ?? null)
            ? prev.index
            : defaultIndex;
        return {
          zoneId: zone.id,
          index: (from + 1) % acquisitions.length,
          nonce: focusHere?.nonce ?? null,
        };
      });
    }, 1100);
    return () => window.clearInterval(timer);
  }, [playing, zone.id, acquisitions.length, defaultIndex, focusHere?.nonce]);

  const eventsUrl = `/api/events?lat=${zone.center.lat.toFixed(3)}&lon=${zone.center.lon.toFixed(3)}&radius=150`;
  const { data: events, error: eventsError, isLoading: eventsLoading } = useSWR<EventsResponse>(
    eventsUrl,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 5 * 60 * 1000 },
  );
  const alerts: DisasterAlert[] = useMemo(() => events?.data.alerts ?? [], [events]);

  const areaKm2 = zoneAreaKm2(zone.bounds);
  const km2 = (pct: number) => Math.round((pct / 100) * areaKm2).toLocaleString("es-CR");

  return (
    <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)]">
      <aside className="order-2 flex flex-col gap-5 bg-sheet/50 px-4 py-4 lg:order-1 lg:h-[calc(100dvh-74px)] lg:overflow-y-auto lg:border-r lg:border-rule lg:px-5">
        <section aria-labelledby="zone-title">
          <p className="eyebrow">Zona de estudio · radar NISAR</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5" role="group" aria-label="Elegir zona">
            {SAR_ZONES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === zone.id}
                onClick={() => {
                  setPlaying(false);
                  onZoneChange(item.id);
                }}
                className={`border px-2 py-1.5 text-left transition ${
                  item.id === zone.id
                    ? "border-ink bg-ink text-sheet"
                    : "border-rule bg-sheet text-ink hover:border-ink"
                }`}
              >
                <span className="block truncate text-[11px] font-medium leading-tight">{item.name}</span>
                <span
                  className={`block font-mono text-[8px] uppercase tracking-[0.1em] ${
                    item.id === zone.id ? "text-sheet/70" : "text-ash"
                  }`}
                >
                  {item.region}
                </span>
              </button>
            ))}
          </div>
          <h2 id="zone-title" className="mt-3 font-display text-[26px] leading-tight">
            {zone.name}
          </h2>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-burnt">{zone.kind}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-ink2">{zone.lead}</p>
          {focusHere ? (
            <p className="mt-2 border-l-2 border-burnt bg-burnt/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-burnt">
              Llegaste desde la alerta «{focusHere.title}».{" "}
              {focusBefore
                ? `El evento está abierto desde el ${shortDate(focusHere.date.slice(0, 10))}, antes de los primeros datos de NISAR: mostramos la pasada más reciente.`
                : "Mostramos la pasada de radar más cercana a la fecha del evento."}
            </p>
          ) : null}
        </section>

        <section aria-labelledby="timeline-title" className="border-t border-ink/80 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">Línea de tiempo</p>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ash">
              {acquisitions.length} pasadas · cada 12 días
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h3 id="timeline-title" className="font-display text-[30px] leading-none tracking-tight">
              {shortDate(current.date)}
            </h3>
            <span
              className={`border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] ${
                current.status === "validado" ? "border-forest text-forest" : "border-ochre text-ochre"
              }`}
              title={
                current.status === "validado"
                  ? "Producto validado por el equipo de NISAR"
                  : "Producto provisional: calibración todavía en revisión"
              }
            >
              {current.status}
            </span>
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              className="ml-auto inline-flex items-center gap-1.5 border border-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] hover:bg-ink hover:text-sheet"
              aria-pressed={playing}
            >
              {playing ? <Pause className="size-3" /> : <Play className="size-3" />}
              {playing ? "Pausar" : "Animar"}
            </button>
          </div>

          <label className="mt-3 block">
            <span className="sr-only">Elegir fecha de la pasada</span>
            <input
              type="range"
              min={0}
              max={acquisitions.length - 1}
              value={index}
              onChange={(event) => {
                setPlaying(false);
                select(Number(event.target.value));
              }}
              className="w-full"
              aria-valuetext={shortDate(current.date)}
            />
          </label>

          <ChangeChart
            acquisitions={acquisitions}
            index={index}
            onSelect={(next) => {
              setPlaying(false);
              select(next);
            }}
          />

          {index === baseIndex ? (
            <p className="mt-3 text-[11px] leading-relaxed text-ash">
              Esta es la fecha base. Elegí otra pasada para ver qué cambió desde{" "}
              {shortDate(baseline.date)}.
            </p>
          ) : (
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div className="border-l-2 border-[#ea580c] pl-2">
                <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-ash">Más brillante</dt>
                <dd className="font-display text-[24px] leading-none">{formatPct(current.brighterPct)}</dd>
                <dd className="mt-0.5 font-mono text-[9px] text-ash">≈ {km2(current.brighterPct)} km²</dd>
              </div>
              <div className="border-l-2 border-[#2563eb] pl-2">
                <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-ash">Más oscuro</dt>
                <dd className="font-display text-[24px] leading-none">{formatPct(current.darkerPct)}</dd>
                <dd className="mt-0.5 font-mono text-[9px] text-ash">≈ {km2(current.darkerPct)} km²</dd>
              </div>
              <p className="col-span-2 text-[10px] leading-relaxed text-ash">
                Porcentaje de la zona que cambió respecto del {shortDate(baseline.date)}. Más brillante
                suele ser vegetación inundada o que creció; más oscuro, agua abierta nueva o suelo
                más liso. Valores aproximados.
              </p>
            </dl>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink">
              <input type="checkbox" checked={showRadar} onChange={(e) => setShowRadar(e.target.checked)} />
              Radar
            </label>
            <label className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink">
              <input type="checkbox" checked={showChange} onChange={(e) => setShowChange(e.target.checked)} />
              Cambio
            </label>
            <label className="ml-auto inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ash">
              Opacidad
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-20"
                aria-label="Opacidad del radar"
              />
            </label>
          </div>
        </section>

        <SarCompare
          zone={zone}
          before={baseline}
          after={index === baseIndex ? acquisitions[peakIndex] : current}
        />

        <section aria-labelledby="story-title" className="border-t border-ink/80 pt-4">
          <p className="eyebrow">Qué muestra el radar</p>
          <h2 id="story-title" className="mt-1 font-display text-[20px] leading-tight">
            Qué mirar en {zone.name}
          </h2>
          <ul className="mt-2 space-y-1">
            {zone.look.map((item) => (
              <li key={item} className="text-[11px] leading-relaxed text-ink2">
                — {item}
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-4">Hipótesis físicas</p>
          <ol className="mt-1 space-y-2">
            {zone.hypotheses.map((item, i) => (
              <li key={item} className="flex gap-2 text-[11px] leading-relaxed text-ink2">
                <span className="font-mono text-[10px] text-burnt">H{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <p className="eyebrow mt-4">Huella humana</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink2">{zone.human}</p>
        </section>

        <section aria-labelledby="zone-alerts-title" className="border-t border-ink/80 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">Alertas cerca de la zona</p>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ash">
              EONET · GDACS · sismos · 150 km
            </span>
          </div>
          <h2 id="zone-alerts-title" className="sr-only">
            Alertas cerca de {zone.name}
          </h2>
          {eventsLoading && !events ? (
            <div className="mt-2 h-14 animate-pulse bg-rule/30" />
          ) : eventsError ? (
            <p className="mt-2 font-mono text-[10px] text-burnt">No pudimos consultar las alertas.</p>
          ) : alerts.length === 0 ? (
            <p className="mt-2 border-l-2 border-rule pl-2 text-[11px] leading-relaxed text-ash">
              Sin eventos abiertos a menos de 150 km. Cuando haya uno, desde aquí vas a poder saltar a la
              pasada de radar más cercana.
            </p>
          ) : (
            <ul className="mt-2 border-y border-rule">
              {alerts.slice(0, 5).map((alert) => {
                const target = nearestAcquisition(acquisitions, alert.date);
                return (
                  <li key={alert.id} className="flex items-baseline gap-2 border-b border-rule/70 py-2 last:border-b-0">
                    <AlertTriangle className="mt-0.5 size-3 shrink-0 text-burnt" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] leading-snug text-ink">{alert.title}</p>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ash">
                        {alert.categoryLabel} · {alert.source} · {shortDate(alert.date.slice(0, 10))} ·{" "}
                        {alert.distanceKm.toFixed(0)} km
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPlaying(false);
                        select(target === baseIndex ? peakIndex : target);
                      }}
                      className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-burnt underline underline-offset-4"
                    >
                      Ver radar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-2 font-display text-[12px] italic leading-snug text-ash">
            La alerta dice qué está pasando; el radar muestra qué le hizo a la superficie.
          </p>
        </section>

        <SarExplainer />

        <section aria-labelledby="sar-data-title" className="border-t border-ink/80 pt-4">
          <p className="eyebrow">Datos y método</p>
          <h2 id="sar-data-title" className="mt-1 font-display text-[18px] leading-tight">
            NISAR L2 GCOV · pasada {current.cycle}
          </h2>
          <p className="mt-1 break-all font-mono text-[9px] leading-relaxed text-ash">{current.granule}</p>
          <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink2">
            <li>
              — Misión NASA-ISRO NISAR, radar de banda L. Producto {SAR_SOURCE.product}, cuadro{" "}
              {zone.frame.replaceAll("_", " ")}.
            </li>
            <li>— Imagen: vista previa pública de ASF DAAC. {SAR_METHOD.channels}.</li>
            <li>
              — Cambio: diferencia de HH suavizada (5×5) frente a la fecha base; se marca si supera{" "}
              {SAR_METHOD.changeThreshold} niveles de 256. Se ignora el agua oscura en las dos fechas
              (mar y lagos).
            </li>
            <li>
              — Fecha base: {shortDate(baseline.date)}.
              {baseIndex > 0
                ? " No usamos la primera pasada (26 jun) porque esa imagen provisional trae una franja de brillo al sur que no aparece en ninguna otra fecha: compararla inventaba cambios."
                : ""}
            </li>
            <li>— {SAR_METHOD.note}</li>
          </ul>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {current.h5Url ? (
              <a
                href={current.h5Url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-burnt underline underline-offset-4"
              >
                HDF5 ({(current.sizeMB / 1024).toFixed(1)} GB · Earthdata)
                <ExternalLink className="size-2.5" />
              </a>
            ) : null}
            <a
              href={SAR_SOURCE.docs}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-burnt underline underline-offset-4"
            >
              Documentación GCOV
              <ExternalLink className="size-2.5" />
            </a>
            <a
              href="https://search.asf.alaska.edu/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-burnt underline underline-offset-4"
            >
              ASF Vertex
              <ExternalLink className="size-2.5" />
            </a>
          </div>
        </section>

        <footer className="border-t border-rule pt-3 pb-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ash">
            Astral Codes · NASA Space Apps Challenge 2026
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-ash">
            Radar: NASA-ISRO NISAR vía ASF DAAC. Óptico: NASA Worldview. Alertas: NASA EONET, GDACS,
            USGS, OVSICORI. Mapa: © OpenStreetMap, © CARTO. NASA no respalda este proyecto.
          </p>
        </footer>
      </aside>

      <section className="order-1 h-[52vh] min-h-[320px] border-b border-rule lg:order-2 lg:h-[calc(100dvh-74px)] lg:border-b-0">
        <SarMap
          zones={SAR_ZONES}
          activeId={zone.id}
          imageUrl={current.image}
          changeUrl={current.change}
          showRadar={showRadar}
          showChange={showChange}
          opacity={opacity}
          alerts={alerts}
          onSelectZone={(id) => {
            setPlaying(false);
            onZoneChange(id);
          }}
        />
      </section>
    </main>
  );
}
