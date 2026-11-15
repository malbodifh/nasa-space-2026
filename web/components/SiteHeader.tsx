"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import GamaLogo from "@/components/GamaLogo";
import { useLocale } from "@/components/LocaleProvider";
import SiteMenu from "@/components/SiteMenu";

export default function SiteHeader() {
  const { t } = useLocale();
  const pathname = usePathname();

  return (
    <header className="relative z-50 mx-auto flex h-[72px] w-full max-w-[1760px] items-center gap-3 px-4 sm:px-6 lg:px-10">
      <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={t("Gamma Alert · Inicio", "Gamma Alert · Home")}>
        <GamaLogo className="size-8 shrink-0" decorative />
        <span className="text-[15px] font-bold tracking-[-0.015em] text-tinta sm:text-[17px]">Gamma Alert</span>
      </Link>
      <SiteMenu key={pathname} />
    </header>
  );
}
