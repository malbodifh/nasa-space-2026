"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type Side = { src: string; label: string; overlay?: string | null };
type ImageState = { status: "loading" | "ready" | "error"; attempt: number };
type Props = {
  left: Side;
  right: Side;
  aspect: number;
  marker?: { x: number; y: number } | null;
};

function ComparisonImage({ src, label, state, onStatus }: Side & {
  state: ImageState;
  onStatus: (status: ImageState["status"]) => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={state.attempt}
      src={src}
      alt={label}
      onLoad={() => onStatus("ready")}
      onError={() => onStatus("error")}
      className={`absolute inset-0 h-full w-full object-fill ${state.status === "ready" ? "" : "invisible"}`}
      draggable={false}
    />
  );
}

/** Dos imágenes superpuestas con un divisor que se arrastra. */
export default function CompareSlider(props: Props) {
  return <Comparison key={JSON.stringify([props.left.src, props.right.src])} {...props} />;
}

function Comparison({
  left,
  right,
  aspect,
  marker,
}: Props) {
  const { t } = useLocale();
  const [position, setPosition] = useState(50);
  const [images, setImages] = useState<Record<"left" | "right", ImageState>>({
    left: { status: "loading", attempt: 0 },
    right: { status: "loading", attempt: 0 },
  });
  function setStatus(side: "left" | "right", status: ImageState["status"]) {
    setImages((current) => ({ ...current, [side]: { ...current[side], status } }));
  }

  return (
    <div>
      <div
        className="relative w-full overflow-hidden rounded-[10px] bg-profundo select-none has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primario has-[:focus-visible]:ring-offset-2"
        style={{ aspectRatio: aspect }}
      >
        <ComparisonImage {...right} state={images.right} onStatus={(status) => setStatus("right", status)} />
        {right.overlay ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={right.overlay} alt="" className="absolute inset-0 h-full w-full object-fill" draggable={false} />
        ) : null}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <ComparisonImage {...left} state={images.left} onStatus={(status) => setStatus("left", status)} />
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
          aria-label={t("Arrastre para comparar las dos imágenes", "Drag to compare the two images")}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      {(["left", "right"] as const).map((side) => {
        const { status } = images[side];
        const { label } = side === "left" ? left : right;
        return status !== "ready" ? (
          <div key={side} role="status" className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-hundida p-3 text-[14px] text-tinta">
            <p>{status === "error"
              ? t(`No pudimos cargar la imagen: ${label}.`, `We couldn't load the image: ${label}.`)
              : t(`Cargando imagen: ${label}…`, `Loading image: ${label}…`)}</p>
            {status === "error" ? (
              <button type="button" aria-label={t(`Reintentar imagen: ${label}`, `Retry image: ${label}`)} className="boton boton-cristal boton-chico" onClick={() => setImages((current) => ({
                ...current,
                [side]: { status: "loading", attempt: current[side].attempt + 1 },
              }))}>
                {t("Reintentar imagen", "Retry image")}
              </button>
            ) : null}
          </div>
        ) : null;
      })}
    </div>
  );
}
