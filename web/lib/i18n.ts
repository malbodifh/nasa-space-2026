export type Locale = "es" | "en";

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_STORAGE_KEY = "memoria-de-fuego:locale";

export function isLocale(value: unknown): value is Locale {
  return value === "es" || value === "en";
}

/** URL language is explicit and case-sensitive; unsupported values do not override preferences. */
export function localeFromSearch(search: string): Locale | null {
  const value = new URLSearchParams(search).get("lang");
  return isLocale(value) ? value : null;
}

export function searchWithLocale(search: string, locale: Locale): string {
  const params = new URLSearchParams(search);
  params.set("lang", locale);
  return `?${params.toString()}`;
}

/** Explicit, authored translations only. Source reports are not machine translated. */
export function translated(locale: Locale, es: string, en?: string): string {
  return locale === "en" ? (en ?? es) : es;
}

export function readLocale(storage: Pick<Storage, "getItem">, fallback: Locale = DEFAULT_LOCALE): Locale {
  try {
    const value = storage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
