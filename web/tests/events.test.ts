import { describe, expect, it } from "vitest";

import {
  buildHistory,
  locationStatus,
  placeName,
  radarDetections,
  relativeDay,
  studyHref,
} from "@/lib/events";
import type { DisasterAlert } from "@/lib/types";
import { sarZone } from "@/lib/sar";
import { parseRadarPair } from "@/lib/study-input";

function alert(partial: Partial<DisasterAlert>): DisasterAlert {
  return {
    id: "a",
    source: "NASA EONET",
    category: "floods",
    categoryLabel: "Inundación",
    title: "Inundación en Costa Rica",
    level: "info",
    date: "2026-10-08T00:00:00Z",
    lat: 9.8,
    lon: -83.9,
    distanceKm: 50,
    url: "https://eonet.gsfc.nasa.gov/",
    ...partial,
  };
}

describe("events", () => {
  it("dice que no hay alertas si ninguna está cerca", () => {
    expect(locationStatus([alert({ distanceKm: 300 })]).tone).toBe("exito");
  });

  it("marca peligro con una alerta naranja o roja cercana", () => {
    const status = locationStatus([
      alert({ id: "x", distanceKm: 20 }),
      alert({ id: "y", distanceKm: 60, level: "orange" }),
    ]);
    expect(status.tone).toBe("peligro");
    expect(status.nearest?.id).toBe("y");
  });

  it("cuenta los eventos activos cercanos", () => {
    const status = locationStatus([alert({ id: "x", distanceKm: 20 }), alert({ id: "y", distanceKm: 40 })]);
    expect(status.title).toBe("2 avisos para su ubicación");
    expect(status.nearest?.id).toBe("x");
  });

  it("ordena el historial del más reciente al más antiguo", () => {
    const history = buildHistory(
      [alert({ id: "old", date: "2026-07-01" }), alert({ id: "new", date: "2026-10-08" })],
      [],
    );
    expect(history.map((item) => item.id)).toEqual(["new", "old"]);
  });

  it("incluye el cambio fuerte detectado por radar en Palo Verde", () => {
    const detections = radarDetections({ lat: 10.635, lon: -85.438 });
    expect(detections.some((item) => item.id.startsWith("radar:palo-verde"))).toBe(true);
  });

  it("arma el enlace al estudio con la fecha y el título", () => {
    const href = studyHref({ lat: 10.83, lon: -85.32, date: "2026-04-27T00:00:00Z", title: "Volcán Rincón", categoryLabel: "Volcán" });
    const params = new URLSearchParams(href.split("?")[1]);
    expect(href.startsWith("/superficie?")).toBe(true);
    expect(params.get("fecha")).toBe("2026-04-27");
    expect(params.get("titulo")).toBe("Volcán Rincón");
  });

  it("conserva base y zona del evento radar al abrir su par inicial", () => {
    const event = radarDetections({ lat: 10.635, lon: -85.438 }).find((item) => item.radarZoneId === "palo-verde")!;
    const params = new URLSearchParams(studyHref(event).split("?")[1]);
    const zone = sarZone("palo-verde")!;
    const pair = parseRadarPair(params, zone);
    expect(params.get("base")).toBe("2026-07-20");
    expect(params.get("fecha")).toBe("2026-09-30");
    expect(pair.status).toBe("valid");
    if (pair.status !== "valid") throw new Error("Par inválido");
    expect(zone.acquisitions[pair.before].date).toBe("2026-07-20");
    expect(zone.acquisitions[pair.after].date).toBe("2026-09-30");
  });

  it("nombra el lugar por la ciudad más cercana", () => {
    expect(placeName({ lat: 10.63, lon: -85.44 })).toBe("Cerca de Liberia");
    expect(placeName({ lat: 0, lon: 0 })).toBe("0.00, 0.00");
  });

  it("escribe fechas relativas cortas", () => {
    const now = new Date("2026-11-14T15:00:00Z");
    expect(relativeDay("2026-11-14", now)).toBe("Hoy");
    expect(relativeDay("2026-11-13", now)).toBe("Ayer");
    expect(relativeDay("2026-11-10", now)).toBe("Hace 4 días");
  });
});
