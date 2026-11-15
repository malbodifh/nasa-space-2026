"use client";

import { useState } from "react";

import { shortDate } from "@/lib/demo";
import type { SarAcquisition, SarZone } from "@/lib/sar";

type Mode = "dates" | "optical";

function opticalUrl(zone: SarZone, date: string): string {
  const [west, south, east, north] = zone.bounds;
  const [width, height] = zone.imageSize;
  const scale = 900 / width;
  return (
    `https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot` +
    `&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326` +
    `&BBOX=${south},${west},${north},${east}&WIDTH=${Math.round(width * scale)}` +
    `&HEIGHT=${Math.round(height * scale)}&TIME=${date}&FORMAT=image/jpeg`
  );
}

export default function SarCompare({
  zone,
  before,
  after,
}: {
  zone: SarZone;
  before: SarAcquisition;
  after: SarAcquisition;
}) {
  const [mode, setMode] = useState<Mode>("dates");
  const [position, setPosition] = useState(50);
  const [opticalFailed, setOpticalFailed] = useState<string | null>(null);

  const optical = mode === "optical";
  const leftSrc = optical ? opticalUrl(zone, after.date) : before.image;
  const rightSrc = after.image;
  const leftLabel = optical ? `Óptico MODIS · ${shortDate(after.date)}` : `Radar · ${shortDate(before.date)}`;
  const rightLabel = `Radar · ${shortDate(after.date)}`;
  const failed = optical && opticalFailed === after.date;

  return (
    <section aria-labelledby="sar-compare-title" className="border-t border-ink/80 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Comparar</p>
        <div className="flex gap-3" role="group" aria-label="Tipo de comparación">
          {(
            [
              ["dates", "Antes / después"],
              ["optical", "Óptico vs radar"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`font-mono text-[9px] uppercase tracking-[0.12em] ${
                mode === value
                  ? "text-ink underline decoration-burnt decoration-2 underline-offset-4"
                  : "text-ash hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <h2 id="sar-compare-title" className="mt-1 font-display text-[20px] leading-tight">
        {optical ? (
          <>
            Mismo día, <span className="italic">dos sensores</span>
          </>
        ) : (
          <>
            {shortDate(before.date)} <span className="text-ash">→</span> {shortDate(after.date)}
          </>
        )}
      </h2>

      <div
        className="relative mt-3 w-full overflow-hidden border border-rule bg-[#141414]"
        style={{ aspectRatio: `${zone.imageSize[0]} / ${zone.imageSize[1]}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rightSrc}
          alt={`Radar NISAR de ${zone.name}, ${after.date}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {failed ? null : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={leftSrc}
            src={leftSrc}
            alt={optical ? `Imagen óptica MODIS de ${zone.name}, ${after.date}` : `Radar NISAR de ${zone.name}, ${before.date}`}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            onError={() => setOpticalFailed(after.date)}
          />
        )}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-burnt"
          style={{ left: `${position}%` }}
        />
        <span className="pointer-events-none absolute bottom-2 left-2 bg-sheet/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink">
          {leftLabel}
        </span>
        <span className="pointer-events-none absolute bottom-2 right-2 bg-sheet/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink">
          {rightLabel}
        </span>
      </div>

      <label className="mt-2 block">
        <span className="sr-only">Mover el divisor de la comparación</span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="w-full"
          aria-label="Mover el divisor de la comparación"
        />
      </label>

      <p className="mt-1 text-[10px] leading-relaxed text-ash">
        {optical
          ? failed
            ? "NASA Worldview no devolvió la imagen óptica de ese día."
            : "Izquierda: luz solar reflejada (MODIS Terra, NASA Worldview). Derecha: radar NISAR. En temporada de lluvias las nubes suelen tapar la imagen óptica; el radar las atraviesa."
          : "Misma zona y misma órbita, con 12 días o más de diferencia. Arrastrá el divisor para ver qué cambió."}
      </p>
    </section>
  );
}
