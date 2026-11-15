import { describe, expect, it } from "vitest";

import { feedIsStale } from "@/lib/alert-rules";
import { formatWhen, fromAlert, timeAgo } from "@/lib/events";
import type { DisasterAlert } from "@/lib/types";

const NOW = new Date("2026-11-15T06:00:00Z");

describe("hora verificable", () => {
  it("muestra la hora de Costa Rica (UTC−6) y cuánto hace", () => {
    // 18:04 UTC = 12:04 p. m. en Costa Rica.
    const text = formatWhen("2026-11-13T18:04:00.000Z", NOW);
    expect(text).toMatch(/13 nov/);
    expect(text).toMatch(/12:04/);
    expect(text).toMatch(/hace 36 h$/);
  });

  it("usa minutos y horas para lo reciente", () => {
    expect(formatWhen("2026-11-15T05:40:00Z", NOW)).toMatch(/hace 20 min$/);
    expect(formatWhen("2026-11-14T21:00:00Z", NOW)).toMatch(/hace 9 h$/);
  });

  it("si la fuente solo da el día, no inventa una hora", () => {
    const text = formatWhen("2026-10-08T00:00:00Z", NOW);
    expect(text).toMatch(/^8 oct/);
    expect(text).not.toMatch(/:/);
  });

  it("resume la antigüedad del último dato de una fuente", () => {
    expect(timeAgo("2026-11-15T05:55:00Z", NOW)).toBe("hace 5 min");
    expect(timeAgo("2026-11-13T06:00:00Z", NOW)).toBe("hace 2 días");
  });
});

describe("fuente detenida", () => {
  it("marca un archivo generado hace más de 2 h", () => {
    expect(feedIsStale("2026-11-15T05:30:00Z", 2, NOW.getTime())).toBe(false);
    expect(feedIsStale("2026-11-15T02:30:00Z", 2, NOW.getTime())).toBe(true);
    expect(feedIsStale(null, 2, NOW.getTime())).toBe(false);
  });
});

describe("enlace al reporte original", () => {
  it("cada evento conserva el enlace de su fuente", () => {
    const alert: DisasterAlert = {
      id: "rsn:1",
      source: "RSN",
      category: "earthquakes",
      categoryLabel: "Sismo",
      title: "M 3.2",
      level: "info",
      date: "2026-11-13T18:04:00Z",
      lat: 9.71,
      lon: -84.02,
      distanceKm: 25,
      url: "https://rsn.ucr.ac.cr/index.php/actividad-sismica/ultimos-sismos/sismo-13",
    };
    expect(fromAlert(alert).url).toBe(alert.url);
  });
});
