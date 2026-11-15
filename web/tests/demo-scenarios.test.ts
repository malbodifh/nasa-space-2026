import { describe, expect, it } from "vitest";

import { affects } from "@/lib/alert-rules";
import { buildDemoAlerts, DEMO_ALL, DEMO_SCENARIOS, TSUNAMI_DEMO_AREA, TSUNAMI_DEMO_FLOW } from "@/lib/demo-scenarios";
import { alertZones } from "@/lib/hazard-style";

const point = { lat: 10.635, lon: -85.4377 };
const NOW = Date.parse("2026-11-15T06:00:00Z");

describe("modo demo", () => {
  it("cada escenario cumple la regla de aviso; tsunami no dibuja un área ficticia", () => {
    for (const scenario of DEMO_SCENARIOS) {
      const [alert] = buildDemoAlerts(scenario.id, point, NOW);
      expect(affects(alert), scenario.id).toBe(true);
      if (scenario.id === "tsunami") expect(alertZones(alert, NOW)).toBeNull();
      else expect(alertZones(alert, NOW), scenario.id).not.toBeNull();
    }
  });

  it("«todo» genera un aviso por escenario y siempre dice que es simulación", () => {
    const alerts = buildDemoAlerts(DEMO_ALL, point, NOW);
    expect(alerts).toHaveLength(DEMO_SCENARIOS.length);
    for (const alert of alerts) {
      expect(alert.source).toBe("Demostración");
      expect(alert.detail).toMatch(/Simulación/);
      expect(alert.url).toBe("");
    }
  });

  it("el tsunami simulado tiene franja costera propia y epicentro fijo", () => {
    expect(TSUNAMI_DEMO_AREA.length).toBeGreaterThanOrEqual(4);
    for (const corner of TSUNAMI_DEMO_AREA) {
      expect(corner.lat).toBeGreaterThan(9);
      expect(corner.lat).toBeLessThan(11);
      expect(corner.lon).toBeGreaterThan(-86.3);
      expect(corner.lon).toBeLessThan(-84);
    }
    // Las flechas apuntan al noreste: la punta queda al norte y al este de su base.
    expect(TSUNAMI_DEMO_FLOW.length).toBeGreaterThanOrEqual(3);
    for (const [tip, left, right] of TSUNAMI_DEMO_FLOW) {
      expect(tip.lat).toBeGreaterThan(left.lat);
      expect(tip.lon).toBeGreaterThan(left.lon);
      expect(tip.lat).toBeGreaterThan(right.lat);
      expect(tip.lon).toBeGreaterThan(right.lon);
    }
    // La franja queda mar adentro: su borde interior no llega a la costa de Puntarenas.
    expect(Math.min(...TSUNAMI_DEMO_AREA.map((corner) => corner.lon))).toBeLessThan(-85.5);

    const [tsunami] = buildDemoAlerts("tsunami", point, NOW);
    const [other] = buildDemoAlerts("tsunami", { lat: 8, lon: -80 }, NOW);
    expect(tsunami.lat).toBe(other.lat);
    expect(tsunami.detail).toMatch(/no un modelo de inundación/);
  });

  it("coloca el evento a la distancia indicada", () => {
    const [alert] = buildDemoAlerts("sismo", point, NOW);
    expect(Math.abs(alert.distanceKm - 35)).toBeLessThan(2);
  });
});
