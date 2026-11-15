export default function GamaLogo({
  className,
  decorative = false,
  label = "Memoria de Fuego",
}: {
  className?: string;
  decorative?: boolean;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      <image href="/logo-gama.svg" width="1024" height="1024" />
    </svg>
  );
}
