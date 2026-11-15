import { describe, expect, it } from "vitest";

import { groupAlerts, hazardFor } from "@/lib/hazards";
import type { DisasterAlert } from "@/lib/types";

function alert(overrides: Partial<DisasterAlert>): DisasterAlert {
  return {
    id: "test",
    source: "NASA EONET",
    category: "volcanoes",
    categoryLabel: "Volcán",
    title: "Evento",
    level: "info",
    date: "2026-11-01",
    lat: 10,
    lon: -85,
    distanceKm: 10,
    url: "https://example.com",
    ...overrides,
  };
}

describe("hazards", () => {
  it("mapea los códigos de GDACS a las categorías de EONET", () => {
    expect(hazardFor("WF").id).toBe("wildfires");
    expect(hazardFor("VO").id).toBe("volcanoes");
    expect(hazardFor("TC").id).toBe("severeStorms");
    expect(hazardFor("FL").id).toBe("floods");
    expect(hazardFor("EQ").id).toBe("earthquakes");
  });

  it("mantiene una categoría desconocida sin romper", () => {
    const hazard = hazardFor("otros");
    expect(hazard.id).toBe("otros");
    expect(hazard.label).toBe("otros");
  });

  it("agrupa eventos de GDACS y EONET bajo la misma amenaza", () => {
    const groups = groupAlerts([
      alert({ id: "a", category: "VO" }),
      alert({ id: "b", category: "volcanoes", distanceKm: 3 }),
      alert({ id: "c", category: "WF", categoryLabel: "Incendio" }),
    ]);

    const volcanoes = groups.find((group) => group.hazard.id === "volcanoes");
    expect(volcanoes?.alerts).toHaveLength(2);
    expect(volcanoes?.alerts[0].distanceKm).toBe(3);
    expect(groups[0].hazard.id).toBe("volcanoes");
  });
});
