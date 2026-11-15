import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import LocaleProvider, { useLocale } from "@/components/LocaleProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteMenu, { menuFocusIndex, SITE_LINKS } from "@/components/SiteMenu";
import BrandMark from "@/components/BrandMark";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/") }));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props, children),
}));

function renderMenu() {
  return renderToStaticMarkup(createElement(LocaleProvider, null, createElement(SiteMenu)));
}

afterEach(() => {
  vi.mocked(usePathname).mockReturnValue("/");
  vi.unstubAllGlobals();
});

describe("menú compartido", () => {
  it("incluye la marca visible en el nombre del enlace y evita duplicar el icono", () => {
    const html = renderToStaticMarkup(createElement(LocaleProvider, null, createElement(SiteHeader)));
    expect(html).toContain('aria-label="Memoria de Fuego · Inicio"');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    const standalone = renderToStaticMarkup(createElement(BrandMark));
    expect(standalone).toContain('role="img"');
    expect(standalone).toContain('aria-label="Memoria de Fuego"');
  });

  it("mantiene las rutas públicas estables", () => {
    expect(SITE_LINKS.map((link) => link.href)).toEqual(["/", "/superficie", "/acerca"]);
    for (const link of SITE_LINKS) {
      expect(link.es).toBeTruthy();
      expect(link.en).toBeTruthy();
    }
  });

  it("se renderiza cerrado con controles accesibles y no simula un menú de aplicación", () => {
    const html = renderMenu();
    expect(html).toContain('aria-label="Abrir menú"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
    expect(html).toContain('aria-label="Navegación principal"');
    expect(html).not.toContain('role="menu"');
    const controlledId = html.match(/aria-controls="([^"]+)"/)?.[1];
    expect(controlledId).toBeTruthy();
    expect(html).toContain(`id="${controlledId}"`);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('lang="en"');
    expect(html).toContain("English");
  });

  it("marca solamente la ruta actual", () => {
    vi.mocked(usePathname).mockReturnValue("/acerca");
    const html = renderMenu();
    expect(html).toMatch(/href="\/acerca" aria-current="page"/);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it("el HTML inicial sigue en ES aunque el cliente tenga EN guardado", () => {
    const getItem = vi.fn(() => "en");
    vi.stubGlobal("window", { localStorage: { getItem }, location: { search: "?lang=en" } });
    const html = renderMenu();
    expect(html).toContain("Inicio");
    expect(html).toContain('aria-label="Abrir menú"');
    expect(getItem).not.toHaveBeenCalled();
  });

  it("permite cambiar un enlace EN a ES conservando ruta, parámetros, hash y estado del router", () => {
    let chooseLocale: ReturnType<typeof useLocale>["setLocale"] | undefined;
    function Consumer() {
      chooseLocale = useLocale().setLocale;
      return null;
    }
    renderToStaticMarkup(createElement(LocaleProvider, null, createElement(Consumer)));
    const replaceState = vi.fn();
    const setItem = vi.fn();
    const dispatchEvent = vi.fn();
    const routerState = { __NA: true };
    vi.stubGlobal("window", {
      location: { pathname: "/superficie", search: "?lat=10.6&lang=en&lon=-85.4", hash: "#metodo" },
      history: { state: routerState, replaceState },
      localStorage: { setItem },
      dispatchEvent,
    });
    expect(chooseLocale).toBeDefined();
    chooseLocale!("es");
    expect(replaceState).toHaveBeenCalledWith(routerState, "", "/superficie?lat=10.6&lang=es&lon=-85.4#metodo");
    expect(setItem).toHaveBeenCalledWith("memoria-de-fuego:locale", "es");
    expect(dispatchEvent).toHaveBeenCalledOnce();
  });
});

describe("recorrido de foco del menú", () => {
  it("recorre y envuelve enlaces y botones de idioma con flechas", () => {
    expect(menuFocusIndex("ArrowDown", 0, 5)).toBe(1);
    expect(menuFocusIndex("ArrowDown", 4, 5)).toBe(0);
    expect(menuFocusIndex("ArrowUp", 0, 5)).toBe(4);
    expect(menuFocusIndex("ArrowUp", 3, 5)).toBe(2);
  });

  it("soporta extremos y foco todavía fuera del panel", () => {
    expect(menuFocusIndex("Home", 3, 5)).toBe(0);
    expect(menuFocusIndex("End", 1, 5)).toBe(4);
    expect(menuFocusIndex("ArrowDown", -1, 5)).toBe(0);
    expect(menuFocusIndex("ArrowUp", -1, 5)).toBe(4);
  });

  it("no captura Tab, Enter ni Escape y tolera paneles sin controles", () => {
    for (const key of ["Tab", "Enter", "Escape", "a"]) {
      expect(menuFocusIndex(key, 1, 5)).toBeNull();
    }
    expect(menuFocusIndex("ArrowDown", 0, 0)).toBeNull();
  });
});
