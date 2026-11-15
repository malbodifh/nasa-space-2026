"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, localeFromSearch, readLocale, searchWithLocale, translated, type Locale } from "@/lib/i18n";

const LOCALE_EVENT = "memoria-de-fuego:locale-change";
let memoryLocale: Locale = DEFAULT_LOCALE;
let storageUnavailable = false;

function publishLocale(next: Locale) {
  memoryLocale = next;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Keep switching usable even if reading is allowed but writing is denied.
    storageUnavailable = true;
  }
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === LOCALE_STORAGE_KEY || event.key === null) onChange();
  }
  function onPopState() {
    const requested = localeFromSearch(window.location.search);
    if (requested) publishLocale(requested);
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCALE_EVENT, onChange);
  window.addEventListener("popstate", onPopState);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCALE_EVENT, onChange);
    window.removeEventListener("popstate", onPopState);
  };
}

function getSnapshot(): Locale {
  if (storageUnavailable) return memoryLocale;
  try {
    return readLocale(window.localStorage, memoryLocale);
  } catch {
    // Private browsing can deny access to the storage object itself.
    return memoryLocale;
  }
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

type LocaleContextValue = {
  locale: Locale;
  t: (es: string, en?: string) => string;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  // The server and hydration render use ES; the saved preference is read after hydration.
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const initialized = useRef(false);
  const setLocale = useCallback((next: Locale) => {
    try {
      const { pathname, search, hash } = window.location;
      window.history.replaceState(window.history.state, "", `${pathname}${searchWithLocale(search, next)}${hash}`);
    } catch {
      // A restricted history API must not lock the user to the URL's original language.
    }
    publishLocale(next);
  }, []);
  const t = useCallback((es: string, en?: string) => translated(locale, es, en), [locale]);
  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // Read the query only after hydration. Later user choices are never overridden by it.
    const requested = localeFromSearch(window.location.search);
    if (requested) publishLocale(requested);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
