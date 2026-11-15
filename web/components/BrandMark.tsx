export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Memoria de Fuego"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" fill="#1B1A17" />
      <path
        d="M9 32c0-12.7 10.3-23 23-23s23 10.3 23 23-10.3 23-23 23S9 44.7 9 32Z"
        fill="none"
        stroke="#B23A1A"
        strokeWidth="2.4"
      />
      <path
        d="M17.5 32c0-8 6.5-14.5 14.5-14.5S46.5 24 46.5 32 40 46.5 32 46.5 17.5 40 17.5 32Z"
        fill="none"
        stroke="#F2EEE5"
        strokeWidth="1.8"
      />
      <path
        d="M26 32c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6Z"
        fill="#B23A1A"
      />
    </svg>
  );
}
