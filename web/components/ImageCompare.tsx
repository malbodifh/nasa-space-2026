"use client";

import { useMemo, useState } from "react";

import { shortDate } from "@/lib/demo";
import type { LatLon } from "@/lib/types";

type Props = {
  point: LatLon;
  date: string;
};

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function snapshotUrl(point: LatLon, date: string): string {
  const west = point.lon - 0.18;
  const south = point.lat - 0.12;
  const east = point.lon + 0.18;
  const north = point.lat + 0.12;
  return (
    `https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot` +
    `&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326` +
    `&BBOX=${west},${south},${east},${north}&WIDTH=900&HEIGHT=600` +
    `&TIME=${date}&FORMAT=image/jpeg`
  );
}

export default function ImageCompare({ point, date }: Props) {
  const [position, setPosition] = useState(50);
  const [failed, setFailed] = useState(false);

  const before = useMemo(() => shiftDate(date, -2), [date]);
  const after = useMemo(() => shiftDate(date, 7), [date]);
  const beforeUrl = useMemo(() => snapshotUrl(point, before), [point, before]);
  const afterUrl = useMemo(() => snapshotUrl(point, after), [point, after]);

  return (
    <section aria-labelledby="compare-title" className="border-t border-ink/80 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Antes y después</p>
        <span className="font-mono text-[10px] text-ash">MODIS Terra</span>
      </div>
      <h2 id="compare-title" className="mt-1 font-display text-[20px] leading-tight">
        {shortDate(before)} <span className="text-ash">→</span> {shortDate(after)}
      </h2>

      {failed ? (
        <div className="mt-3 grid h-44 place-items-center border border-rule bg-paper px-4 text-center font-mono text-[10px] leading-relaxed text-ash">
          No pudimos cargar las imágenes de NASA Worldview. El resto de los datos sigue disponible.
        </div>
      ) : (
        <div className="relative mt-3 h-52 overflow-hidden border border-rule bg-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterUrl}
            alt={`Satélite después del evento, ${after}`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeUrl}
            alt={`Satélite antes del evento, ${before}`}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            loading="lazy"
            onError={() => setFailed(true)}
          />
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-burnt"
            style={{ left: `${position}%` }}
          />
          <span className="pointer-events-none absolute bottom-2 left-2 bg-sheet/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink">
            Antes · {shortDate(before)}
          </span>
          <span className="pointer-events-none absolute bottom-2 right-2 bg-sheet/90 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink">
            Después · {shortDate(after)}
          </span>
        </div>
      )}

      {!failed ? (
        <label className="mt-2 block">
          <span className="sr-only">Comparar antes y después</span>
          <input
            type="range"
            min={0}
            max={100}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            className="w-full"
            aria-label="Comparar imágenes antes y después"
          />
        </label>
      ) : null}

      <p className="mt-1 text-[10px] leading-relaxed text-ash">
        Imágenes NASA Worldview Snapshots. No son una medición del área quemada.
      </p>
    </section>
  );
}
