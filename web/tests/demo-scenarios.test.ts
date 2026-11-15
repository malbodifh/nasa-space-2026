import { describe, expect, it } from "vitest";

import { affects } from "@/lib/alert-rules";
import { buildDemoAlerts, DEMO_ALL, DEMO_SCENARIOS } from "@/lib/demo-scenarios";
import { alertZones } from "@/lib/hazard-style";

const point = { lat: 10.635, lon: -85.4377 };
const NOW = Date.parse("2026-11-15T06:00:00Z");

describe("modo demo", () => {
  it("cada escenario afecta a la persona y está en curso, con áreas roja y amarilla", () => {
    for (const scenario of DEMO_SCENARIOS) {
      const [alert] = buildDemoAlerts(scenario.id, point, NOW);
      expect(affects(alert), scenario.id).toBe(true);
      expect(alertZones(alert, NOW), scenario.id).not.toBeNull();
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

  it("coloca el evento a la distancia indicada", () => {
    const [alert] = buildDemoAlerts("sismo", point, NOW);
    expect(Math.abs(alert.distanceKm - 35)).toBeLessThan(2);
  });
});
