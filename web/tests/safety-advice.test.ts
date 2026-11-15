import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DisasterAlert } from "@/lib/types";
import { safetyAdvice, selectAdviceAlert } from "@/lib/safety-advice";

const fixture = vi.hoisted(() => ({ locale: "es" as "es" | "en" }));
vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({
    locale: fixture.locale,
    t: (es: string, en: string) => fixture.locale === "es" ? es : en,
  }),
}));
import SafetyAdvice from "@/components/SafetyAdvice";

const now = Date.parse("2026-11-15T12:00:00Z");
const report: DisasterAlert = {
  id: "test", source: "USGS", category: "earthquakes", categoryLabel: "Sismo",
  title: "Sismo de prueba", date: "2026-11-15T11:30:00Z", lat: 10, lon: -84,
  distanceKm: 20, magnitudeValue: 5.2, level: "orange",
  url: "https://earthquake.usgs.gov/", quality: "preliminar",
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  fixture.locale = "es";
});
afterEach(() => vi.useRealTimers());

describe("orientación por amenaza", () => {
  it("usa magnitud y cercanía sin inferir intensidad ni daños", () => {
    expect(safetyAdvice(report, now)).toMatchObject({ mode: "priority", relevant: true });
    expect(safetyAdvice({ ...report, distanceKm: 151 }, now)).toMatchObject({ mode: "followup", relevant: false });
    expect(safetyAdvice({ ...report, magnitudeValue: 3, level: "info" }, now)).toMatchObject({ mode: "followup", relevant: false });
    expect(safetyAdvice({ ...report, level: "green" }, now)).toMatchObject({ mode: "followup", relevant: true });
  });
  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])("no prioriza distancia inválida %s", (distanceKm) => {
    expect(safetyAdvice({ ...report, distanceKm }, now)).toMatchObject({
      mode: "unknown", distanceKnown: false, relevant: false,
    });
  });
  it("muestra que no puede clasificar un reporte sin distancia verificable", () => {
    const html = renderToStaticMarkup(createElement(SafetyAdvice, {
      alerts: [{ ...report, distanceKm: Number.NaN }], exampleLocation: false, incomplete: false,
    }));
    expect(html).toContain("Atención no clasificable");
    expect(html).toContain("no se puede aplicar el criterio de cercanía");
  });
  it.each(["2026-11-01T00:00:00Z", "2026-11-16T00:00:00Z", "sin-fecha"])(
    "no usa un reporte vencido, futuro o inválido como peligro actual: %s", (date) => {
      expect(safetyAdvice({ ...report, date }, now)).toMatchObject({ mode: "prepare", current: false });
    },
  );
  it("sin alertas ofrece preparación, no afirma seguridad", () => {
    expect(safetyAdvice(null, now).mode).toBe("prepare");
    const html = renderToStaticMarkup(createElement(SafetyAdvice, {
      alerts: [], exampleLocation: true, incomplete: true,
    }));
    expect(html).toContain("no garantiza seguridad");
    expect(html).toContain("ubicación de ejemplo");
    expect(html).toContain("información está incompleta");
  });
  it("elige un reporte vigente prioritario antes que otro cercano o vencido", () => {
    const expired = { ...report, id: "expired", date: "2026-10-01T00:00:00Z" };
    const nearby = { ...report, id: "nearby", distanceKm: 1, level: "green" as const };
    const priority = { ...report, id: "priority", category: "floods", distanceKm: 40 };
    expect(selectAdviceAlert([expired, nearby, priority], now)?.id).toBe("priority");
    expect(selectAdviceAlert([expired, nearby], now)?.id).toBe("nearby");
    expect(selectAdviceAlert([], now)).toBeNull();
    const html = renderToStaticMarkup(createElement(SafetyAdvice, {
      alerts: [nearby, priority], exampleLocation: false, incomplete: false,
    }));
    expect(html).toContain("Hay 2 reportes");
  });
  it.each([
    ["EQ", "earthquakes"], ["TC", "severeStorms"], ["FL", "floods"],
    ["VO", "volcanoes"], ["WF", "wildfires"], ["heavyRain", "floods"],
  ])("reutiliza el protocolo para %s", (category, canonical) => {
    expect(safetyAdvice({ ...report, category }, now).guide)
      .toBe(safetyAdvice({ ...report, category: canonical }, now).guide);
  });
  it.each(["earthquakes", "tsunami", "severeStorms", "floods", "heavyRain", "volcanoes", "landslides", "wildfires", "otros"])(
    "siempre cita una fuente y dos instrucciones ES/EN: %s", (category) => {
      const { guide } = safetyAdvice({ ...report, category }, now);
      expect(guide.steps).toHaveLength(2);
      expect(guide.steps.every(([es, en]) => es.length > 0 && en.length > 0)).toBe(true);
      expect(new URL(guide.es).hostname).toMatch(/^(www\.ready\.gov|www\.weather\.gov)$/);
      expect(new URL(guide.en).hostname).toMatch(/^(www\.ready\.gov|www\.weather\.gov)$/);
    },
  );
  it("la precaución de tsunami es condicional a la costa y no exige esperar a la app", () => {
    const { guide } = safetyAdvice({ ...report, category: "tsunami", distanceKm: 1000 }, now);
    expect(guide.steps[0][0]).toContain("Si está en la costa");
    expect(guide.steps[0][0]).toContain("No espere");
    expect(guide.steps[0][1]).toContain("Do not wait");
  });
  it.each(["es", "en"] as const)("distingue datos, simulación y guía general: %s", (locale) => {
    fixture.locale = locale;
    const html = renderToStaticMarkup(createElement(SafetyAdvice, {
      alerts: [{ ...report, source: "Demostración" }], exampleLocation: true, incomplete: false,
    }));
    expect(html).toContain(locale === "es" ? "no es un evento real" : "not a real event");
    expect(html).toContain(locale === "es" ? "no es la intensidad" : "not the shaking intensity");
    expect(html).toContain(locale === "es" ? "no al borde del peligro" : "not the hazard boundary");
    expect(html).toContain('href="tel:911"');
    expect(html).toContain("https://www.cne.go.cr/");
    expect(html).not.toContain(locale === "es" ? "Reporte original" : "Original report");
  });
});
