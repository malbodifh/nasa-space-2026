import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getGdacsAlerts } from "@/lib/sources/gdacs";

type Feature = {
  geometry: { type: string; coordinates: [number, number] };
  properties: Record<string, unknown>;
};

function feature(country: string, coordinates: [number, number], eventid: number): Feature {
  return {
    geometry: { type: "Point", coordinates },
    properties: {
      eventtype: "DR",
      eventid,
      eventname: "Sequía regional",
      alertlevel: "Orange",
      country,
      datemodified: "2026-11-10T00:00:00Z",
      url: { report: `https://www.gdacs.org/report.aspx?eventid=${eventid}&eventtype=DR` },
    },
  };
}

function stub(features: Feature[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ features }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GDACS: cobertura por país, no solo por centroide", () => {
  it("incluye una sequía con centroide lejano si su lista de países menciona Costa Rica", async () => {
    // Centroide en Venezuela, como el evento real «DR Northern South America».
    stub([feature("Colombia, Costa Rica, Panama", [-66.6, 7.1], 101)]);
    const alerts = await getGdacsAlerts({ lat: 9.93, lon: -84.08 });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].distanceKm).toBeGreaterThan(600);
    expect(alerts[0].source).toBe("GDACS");
  });

  it("sigue descartando un evento lejano que no menciona Costa Rica", async () => {
    stub([feature("India, Bangladesh", [80.2, 15.8], 102)]);
    // Coordenadas distintas: la caché agrupa por décima de grado.
    const alerts = await getGdacsAlerts({ lat: 8.2, lon: -83.1 });
    expect(alerts).toHaveLength(0);
  });
});
