"use client";

import { useId } from "react";

type GamaLogoProps = {
  className?: string;
  decorative?: boolean;
  label?: string;
};

// Marca gráfica GAMA Alert: globo con las Américas, anillo orbital, satélite y ondas.
// Usa currentColor para heredar la tinta de la interfaz.
export default function GamaLogo({
  className,
  decorative = false,
  label = "Memoria de Fuego",
}: GamaLogoProps) {
  const clipId = `gama-globe-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="48" cy="72" r="31" />
        </clipPath>
      </defs>

      {/* anillo orbital, mitad trasera */}
      <g
        transform="translate(48 72) rotate(-22)"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path d="M -46 0 A 46 19 0 0 1 46 0" />
      </g>

      {/* globo */}
      <circle cx="48" cy="72" r="31" fill="currentColor" />
      <g clipPath={`url(#${clipId})`} fill="#ffffff">
        {/* Norteamérica */}
        <path d="M 34 52 C 38 44 50 42 56 48 C 60 52 58 58 52 60 C 46 62 36 60 33 57 C 31 55 32 53 34 52 Z" />
        {/* Sudamérica */}
        <path d="M 46 62 C 52 62 58 68 58 76 C 58 84 54 92 50 95 C 46 91 44 82 44 74 C 44 68 42 62 46 62 Z" />
      </g>

      {/* anillo orbital, mitad delantera */}
      <g
        transform="translate(48 72) rotate(-22)"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path d="M -46 0 A 46 19 0 0 0 46 0" />
      </g>

      {/* ondas de señal */}
      <g fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        <path d="M 68 40 A 12 12 0 0 1 80 52" />
        <path d="M 62 34 A 19 19 0 0 1 86 58" />
      </g>

      {/* satélite */}
      <g transform="translate(88 28) rotate(45)" fill="currentColor">
        <rect x="-20" y="-7" width="14" height="14" rx="2.5" />
        <rect x="-4" y="-5" width="8" height="10" rx="1.5" />
        <rect x="7" y="-7" width="14" height="14" rx="2.5" />
      </g>
    </svg>
  );
}
