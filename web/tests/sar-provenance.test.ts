import { describe, expect, it } from "vitest";

import manifest from "@/data/nisar.json";
import { radarDetections } from "@/lib/events";
import { SAR_ZONES, baselineIndex } from "@/lib/sar";

describe("procedencia y límites del estudio SAR", () => {
  it("conserva los datos originales sin ofrecer las pasadas descartadas anteriores a la base", () => {
    expect(manifest.zones.find((zone) => zone.id === "palo-verde")?.acquisitions.some(
      (item) => item.date === "2026-06-26",
    )).toBe(true);
    for (const zone of SAR_ZONES) {
      expect(zone.acquisitions.every((pass) => pass.date >= zone.baseline)).toBe(true);
      expect(zone.acquisitions[baselineIndex(zone.acquisitions)].date).toBe(zone.baseline);
    }
  });

  it("mantiene explícito el carácter informativo de las detecciones", () => {
    const detections = radarDetections({ lat: 10.35, lon: -85.33 });
    expect(detections.length).toBeGreaterThan(0);
    for (const item of detections) {
      expect(item.kind).toBe("radar");
      expect(item.level).toBe("info");
      expect(item.detail).toContain("No identifica la causa ni confirma daños");
      expect(item.detail).not.toContain("km²");
    }
  });
});
