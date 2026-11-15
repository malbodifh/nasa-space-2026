"use client";

import { useState } from "react";

type Side = { src: string; label: string; overlay?: string | null };

/** Dos imágenes superpuestas con un divisor que se arrastra. */
export default function CompareSlider({
  left,
  right,
  aspect,
  marker,
}: {
  left: Side;
  right: Side;
  aspect: number;
  marker?: { x: number; y: number } | null;
}) {
  const [position, setPosition] = useState(50);

  return (
    <div
      className="relative w-full overflow-hidden rounded-[10px] bg-profundo select-none"
      style={{ aspectRatio: aspect }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={right.src} alt={right.label} className="absolute inset-0 h-full w-full object-fill" draggable={false} />
      {right.overlay ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={right.overlay} alt="" className="absolute inset-0 h-full w-full object-fill" draggable={false} />
      ) : null}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={left.src} alt={left.label} className="absolute inset-0 h-full w-full object-fill" draggable={false} />
        {left.overlay ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={left.overlay} alt="" className="absolute inset-0 h-full w-full object-fill" draggable={false} />
        ) : null}
      </div>

      {marker ? (
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white bg-primario shadow"
          style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
          aria-hidden
        />
      ) : null}

      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${position}%` }}>
        <span className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[13px] font-bold text-tinta shadow-md">
          ↔
        </span>
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-tinta">
        {left.label}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-tinta">
        {right.label}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Arrastre para comparar las dos imágenes"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
