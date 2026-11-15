import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { DisasterAlert } from "@/lib/types";

const hooks = vi.hoisted(() => ({
  effects: [] as (() => unknown)[],
  values: [] as unknown[],
  cursor: 0,
  seen: { current: null as Set<string> | null },
}));

vi.mock("react", () => ({
  useCallback: (fn: unknown) => fn,
  useEffect: (fn: () => unknown) => { hooks.effects.push(fn); },
  useRef: () => hooks.seen,
  useSyncExternalStore: () => "denied",
  useState: (initial: unknown) => {
    const index = hooks.cursor++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [hooks.values[index], (next: unknown) => {
      hooks.values[index] = typeof next === "function" ? next(hooks.values[index]) : next;
    }];
  },
}));
vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({ locale: "es", t: (es: string) => es }),
}));

import { useAlertNotifications } from "@/components/useAlertNotifications";

beforeEach(() => {
  vi.useFakeTimers();
  hooks.effects = [];
  hooks.values = [];
  hooks.cursor = 0;
  hooks.seen.current = null;
  vi.stubGlobal("window", {
    localStorage: { getItem: () => "[]", setItem: vi.fn() },
    setTimeout,
    clearTimeout,
  });
  vi.stubGlobal("navigator", {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("conserva los cinco avisos de una ráfaga y no los duplica al actualizar", () => {
  const alerts = Array.from({ length: 5 }, (_, i) => ({
    id: `alert-${i}`, title: `Evento ${i}`, category: "earthquakes",
    categoryLabel: "Sismo", source: "USGS", date: "2026-11-15T12:00:00Z",
    lat: 10, lon: -84, distanceKm: i + 1, level: "orange",
  })) as DisasterAlert[];
  const RenderNotifications = () => {
    hooks.cursor = 0;
    hooks.effects = [];
    const result = useAlertNotifications(alerts);
    for (const effect of hooks.effects) effect();
    vi.runAllTimers();
    return result;
  };
  RenderNotifications();
  expect(hooks.values[2]).toHaveLength(5);
  const { dismiss } = RenderNotifications();
  expect(hooks.values[2]).toHaveLength(5);
  dismiss("alert-0");
  expect(hooks.values[2]).toHaveLength(4);
  expect(hooks.seen.current?.size).toBe(5);
});
