export default function BrandMark({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Memoria de Fuego"}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#171A23" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="#5266EB" strokeWidth="3" />
      <circle cx="32" cy="32" r="12" fill="none" stroke="#F7F7F6" strokeWidth="2" opacity="0.85" />
      <circle cx="32" cy="32" r="5" fill="#A9B3F7" />
    </svg>
  );
}
