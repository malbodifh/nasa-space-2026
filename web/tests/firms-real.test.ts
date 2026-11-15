import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import volcanoesFile from "@/data/volcanoes.json";
import { filterFirms } from "@/lib/feeds-parse";

const csv = readFileSync(path.join(__dirname, "fixtures", "firms-cr-5d.csv"), "utf8");
const volcanoes = volcanoesFile.features.map((f) => ({ lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] }));
const LIBERIA = { lat: 10.635, lon: -85.438 };
// La descarga real se hizo la noche del 14 de noviembre de 2026.
const NOW = Date.parse("2026-11-15T05:00:00Z");

describe("FIRMS con 5 días reales de Costa Rica", () => {
  it("descarta el calor del cráter del Poás y el calor nocturno débil", () => {
    const { report } = filterFirms(csv, LIBERIA, { volcanoes, now: NOW, recentHours: 120 });
    expect(report.total).toBeGreaterThan(20);
    expect(report.volcano).toBeGreaterThanOrEqual(2);
    expect(report.nightWeak).toBeGreaterThanOrEqual(3);
  });

  it("deja muy pocos posibles incendios de todos los focos", () => {
    const { alerts, report } = filterFirms(csv, LIBERIA, { volcanoes, now: NOW, recentHours: 120 });
    console.info(report, alerts.map((a) => `${a.lat.toFixed(2)},${a.lon.toFixed(2)} ${a.detail}`));
    expect(alerts.length).toBeLessThanOrEqual(3);
    expect(report.kept).toBeLessThan(report.total / 3);
  });
});
