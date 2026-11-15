"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";

export const SITE_LINKS = [
  { href: "/", es: "Inicio", en: "Home" },
  { href: "/superficie", es: "Superficie", en: "Surface" },
  { href: "/acerca", es: "Acerca de la app", en: "About the app" },
] as const;

/** Arrow keys are optional enhancements; normal Tab navigation remains available. */
export function menuFocusIndex(key: string, current: number, count: number): number | null {
  if (count < 1) return null;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (current < 0 && key === "ArrowDown") return 0;
  if (current < 0 && key === "ArrowUp") return count - 1;
  if (key === "ArrowDown") return (current + 1 + count) % count;
  if (key === "ArrowUp") return (current - 1 + count) % count;
  return null;
}

export default function SiteMenu() {
  const { locale, t, setLocale } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const languageId = useId();
  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    function onPointerDown(event: PointerEvent) {
      if (root.current && !event.composedPath().includes(root.current)) close();
    }
    function onFocusIn(event: FocusEvent) {
      if (root.current && !event.composedPath().includes(root.current)) close();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <div ref={root} className="relative ml-auto shrink-0">
      <button
        ref={trigger}
        type="button"
        aria-label={open ? t("Cerrar menú", "Close menu") : t("Abrir menú", "Open menu")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex size-11 items-center justify-center rounded-full border border-linea bg-elevada text-tinta transition hover:bg-hundida"
      >
        {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
      </button>
      <div
        ref={panel}
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-[calc(100%+10px)] z-[70] max-h-[calc(100dvh-90px)] w-72 max-w-[calc(100vw-32px)] overflow-y-auto rounded-2xl border border-linea bg-elevada p-3 shadow-xl"
        onKeyDown={(event) => {
          const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []);
          const next = menuFocusIndex(event.key, controls.indexOf(document.activeElement as HTMLElement), controls.length);
          if (next !== null) {
            event.preventDefault();
            controls[next]?.focus();
          }
        }}
      >
        <nav aria-label={t("Navegación principal", "Main navigation")}>
          <ul className="space-y-1">
            {SITE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => close()}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    pathname === link.href ? "bg-primario-suave text-primario-fuerte" : "text-tinta hover:bg-hundida"
                  }`}
                >
                  {t(link.es, link.en)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-3 border-t border-linea px-2 pt-4 pb-1">
          <p id={languageId} className="mb-2 text-xs font-semibold text-tinta-suave">{t("Idioma", "Language")}</p>
          <div role="group" aria-labelledby={languageId} className="grid grid-cols-2 gap-2">
            {(["es", "en"] as const).map((option) => (
              <button
                key={option}
                type="button"
                lang={option}
                aria-pressed={locale === option}
                onClick={() => setLocale(option)}
                className={`min-h-11 rounded-lg border px-3 text-sm font-semibold transition ${
                  locale === option ? "border-primario bg-primario-suave text-primario-fuerte" : "border-linea hover:bg-hundida"
                }`}
              >
                {option === "es" ? "Español" : "English"}
              </button>
            ))}
          </div>
        </div>
        <p className="px-2 pt-3 pb-1 text-xs leading-relaxed text-tinta-suave">
          {t("Información pública. No es una alerta oficial.", "Public information. Not an official warning.")}
        </p>
      </div>
    </div>
  );
}
