export default function BrandMark({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Memoria de Fuego"}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <image href="/icon.svg" width="120" height="120" />
    </svg>
  );
}
