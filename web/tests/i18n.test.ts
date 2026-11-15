import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, isLocale, LOCALE_STORAGE_KEY, localeFromSearch, readLocale, searchWithLocale, translated } from "@/lib/i18n";

describe("idioma explícito", () => {
  it("usa español por defecto y solo admite es/en", () => {
    expect(DEFAULT_LOCALE).toBe("es");
    expect(isLocale("es")).toBe(true);
    expect(isLocale("en")).toBe(true);
    for (const value of [null, undefined, "EN", "fr", "", 1, {}]) {
      expect(isLocale(value)).toBe(false);
    }
  });

  it("elige la traducción redactada sin alterar el original", () => {
    expect(translated("es", "Fuente", "Source")).toBe("Fuente");
    expect(translated("en", "Fuente", "Source")).toBe("Source");
    expect(translated("en", "Reporte original")).toBe("Reporte original");
    expect(translated("en", "Texto", "")).toBe("");
  });

  it("admite enlaces reproducibles ES/EN sin aceptar idiomas desconocidos", () => {
    expect(localeFromSearch("?lang=en")).toBe("en");
    expect(localeFromSearch("?lat=10.6&lang=es&lon=-85.4")).toBe("es");
    expect(localeFromSearch("lang=en")).toBe("en");
    for (const search of ["", "?lang=", "?lang=fr", "?lang=EN", "?other=en"]) {
      expect(localeFromSearch(search)).toBeNull();
    }
  });

  it("el toggle reemplaza lang sin perder los demás parámetros", () => {
    const search = searchWithLocale("?lat=10.6&lang=en&lon=-85.4&title=Ca%C3%B1o+Negro", "es");
    const params = new URLSearchParams(search);
    expect(params.get("lang")).toBe("es");
    expect(params.get("lat")).toBe("10.6");
    expect(params.get("lon")).toBe("-85.4");
    expect(params.get("title")).toBe("Caño Negro");
    expect(params.getAll("lang")).toEqual(["es"]);
    expect(searchWithLocale("", "en")).toBe("?lang=en");
  });

  it("recupera solo una preferencia válida con la clave estable", () => {
    const storage = {
      getItem(key: string) {
        expect(key).toBe(LOCALE_STORAGE_KEY);
        return "en";
      },
    };
    expect(readLocale(storage)).toBe("en");
    expect(readLocale({ getItem: () => "fr" })).toBe("es");
    expect(readLocale({ getItem: () => null })).toBe("es");
    expect(readLocale({ getItem: () => null }, "en")).toBe("en");
  });

  it("falla suave si el navegador bloquea el almacenamiento", () => {
    const blocked = { getItem: () => { throw new Error("SecurityError"); } };
    expect(readLocale(blocked)).toBe("es");
    expect(readLocale(blocked, "en")).toBe("en");
  });
});
