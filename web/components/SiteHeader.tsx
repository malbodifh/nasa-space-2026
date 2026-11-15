import Link from "next/link";

import BrandMark from "@/components/BrandMark";

export default function SiteHeader() {
  return (
    <header className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Inicio">
        <BrandMark className="size-8" />
        <span className="text-[17px] font-bold tracking-[-0.015em] text-tinta">Memoria de Fuego</span>
      </Link>
    </header>
  );
}
