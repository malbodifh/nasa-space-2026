import { describe, expect, it } from "vitest";

import {
  SAR_ZONES,
  baselineIndex,
  imageCorners,
  nearestAcquisition,
  peakChange,
  zoneAreaKm2,
  zoneForPoint,
  type SarAcquisition,
} from "@/lib/sar";

function acquisition(date: string, darkerPct = 0, brighterPct = 0): SarAcquisition {
  return {
    date,
    cycle: 1,
    status: "provisional",
    collection: "NISAR_L2_GCOV_PROVISIONAL_V1",
    granule: `g-${date}`,
    h5Url: null,
    sizeMB: 1,
    image: `/nisar/z/${date}.webp`,
    change: `/nisar/z/change-${date}.webp`,
    coverage: 100,
    darkerPct,
    brighterPct,
  };
}

describe("sar", () => {
  it("carga zonas con varias pasadas ordenadas por fecha", () => {
    expect(SAR_ZONES.length).toBeGreaterThanOrEqual(3);
    for (const zone of SAR_ZONES) {
      expect(zone.acquisitions.length).toBeGreaterThan(1);
      const dates = zone.acquisitions.map((item) => item.date);
      expect([...dates].sort()).toEqual(dates);
      const base = baselineIndex(zone.acquisitions);
      expect(zone.acquisitions[base].date).toBe(zone.baseline);
      expect(zone.acquisitions.filter((item) => item.change === null)).toHaveLength(1);
    }
  });

  it("encuentra la zona que contiene un punto", () => {
    expect(zoneForPoint({ lat: 10.35, lon: -85.33 })?.id).toBe("palo-verde");
    expect(zoneForPoint({ lat: 10.89, lon: -84.78 })?.id).toBe("cano-negro");
    expect(zoneForPoint({ lat: 10.83, lon: -85.32 })?.id).toBe("rincon-de-la-vieja");
  });

  it("devuelve null lejos de toda zona", () => {
    expect(zoneForPoint({ lat: 8.6, lon: -83.0 }, 30)).toBeNull();
  });

  it("ordena las esquinas como espera MapLibre", () => {
    expect(imageCorners([-86, 9, -85, 10])).toEqual([
      [-86, 10],
      [-85, 10],
      [-85, 9],
      [-86, 9],
    ]);
  });

  it("elige la pasada más cercana a una fecha", () => {
    const list = [acquisition("2026-06-26"), acquisition("2026-07-08"), acquisition("2026-07-20")];
    expect(nearestAcquisition(list, "2026-07-10")).toBe(1);
    expect(nearestAcquisition(list, "2026-12-01T10:00:00Z")).toBe(2);
    expect(nearestAcquisition([], "2026-07-10")).toBe(-1);
  });

  it("encuentra el pico de cambio sin contar la fecha base", () => {
    const list = [
      { ...acquisition("2026-06-26", 9, 9), change: null },
      acquisition("2026-07-08", 1, 2),
      acquisition("2026-07-20", 0.5, 6),
      acquisition("2026-08-01", 1, 1),
    ];
    expect(peakChange(list)).toBe(2);
  });

  it("ubica la fecha base aunque no sea la primera", () => {
    const list = [acquisition("2026-06-26"), { ...acquisition("2026-07-20"), change: null }];
    expect(baselineIndex(list)).toBe(1);
  });

  it("calcula un área razonable para una zona de 0,6°", () => {
    const km2 = zoneAreaKm2([-85.62, 10.08, -85.02, 10.62]);
    expect(km2).toBeGreaterThan(3500);
    expect(km2).toBeLessThan(4300);
  });
});
