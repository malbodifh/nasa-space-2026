import { describe, expect, it } from "vitest";

import { alertZones, hazardColor, hazardOf, YELLOW_MAX, type ZoneInput } from "@/lib/hazard-style";

const NOW = Date.parse("2026-11-15T06:00:00Z");
const recent = "2026-11-15T05:30:00Z";

function input(partial: Partial<ZoneInput>): ZoneInput {
  return { category: "earthquakes", source: "RSN", level: "info", date: recent, title: "Sismo", ...partial };
}

describe("color por desastre", () => {
  it("sismo café, tsunami azul y los códigos de GDACS", () => {
    expect(hazardColor("earthquakes")).toBe("#8B5A2B");
    expect(hazardColor("tsunami")).toBe("#1F5FA6");
    expect(hazardOf("TC")).toBe("ciclon");
    expect(hazardOf("algo-nuevo")).toBe("otro");
  });
});

describe("áreas de alerta", () => {
  it("un sismo más fuerte tiene áreas más grandes", () => {
    const m4 = alertZones(input({ magnitudeValue: 4 }), NOW);
    const m6 = alertZones(input({ magnitudeValue: 6 }), NOW);
    expect(m4).toEqual({ red: 5, yellow: 32 });
    expect(m6!.red).toBeGreaterThan(m4!.red);
    expect(m6!.yellow).toBeGreaterThan(m4!.yellow);
  });

  it("lee la magnitud del título si no viene aparte", () => {
    expect(alertZones(input({ title: "M 5.0 · Golfito" }), NOW)?.red).toBe(14);
  });

  it("no dibuja áreas si el evento ya no está en curso", () => {
    // Un sismo de hace 3 horas ya pasó: aparece en la lista, pero sin áreas.
    expect(alertZones(input({ magnitudeValue: 5, date: "2026-11-15T03:00:00Z" }), NOW)).toBeNull();
    expect(alertZones(input({ magnitudeValue: 5, date: "2026-11-10T00:00:00Z" }), NOW)).toBeNull();
    expect(
      alertZones({ category: "volcanoes", source: "NASA EONET", level: "info", date: "2026-04-27T00:00:00Z", title: "Volcán" }, NOW),
    ).toBeNull();
  });

  it("ningún boletín de tsunami genera círculos que simulen costas amenazadas", () => {
    const base = { category: "tsunami", source: "PTWC", date: recent, title: "Boletín" } as const;
    expect(alertZones({ ...base, level: "info" }, NOW)).toBeNull();
    expect(alertZones({ ...base, level: "orange" }, NOW)).toBeNull();
    expect(alertZones({ ...base, level: "red" }, NOW)).toBeNull();
  });

  it("un huracán tiene áreas más grandes que una tormenta", () => {
    const storm = { category: "severeStorms", source: "NHC", level: "orange", date: recent } as const;
    expect(alertZones({ ...storm, title: "Huracán Prueba" }, NOW)).toEqual({ red: 60, yellow: 150 });
    expect(alertZones({ ...storm, title: "Tormenta tropical Prueba" }, NOW)).toEqual({ red: 40, yellow: 100 });
  });

  it("ningún radio supera el techo visual, ni siquiera con un sismo enorme", () => {
    for (const magnitudeValue of [4, 5, 6, 7, 8, 9]) {
      const zone = alertZones(input({ magnitudeValue }), NOW)!;
      expect(zone.yellow).toBeLessThanOrEqual(YELLOW_MAX);
      expect(zone.red).toBeLessThan(zone.yellow);
    }
  });

  it("una detección de radar no tiene área", () => {
    expect(alertZones(input({ category: "radar", source: "NASA-ISRO NISAR" }), NOW)).toBeNull();
  });
});
