import { describe, expect, it } from "vitest";

import { isCurrent, isOngoing, partitionCurrent } from "@/lib/alert-rules";
import { mergeSeismic, ovsicoriPlace, parseOvsicori, usgsPlace } from "@/lib/seismic-parse";
import type { DisasterAlert, SeismicEvent } from "@/lib/types";

const NOW = Date.parse("2026-11-15T05:00:00Z");
const hoursAgo = (hours: number) => new Date(NOW - hours * 3_600_000).toISOString();

function alert(partial: Partial<DisasterAlert>): DisasterAlert {
  return {
    id: "a",
    source: "NASA EONET",
    category: "volcanoes",
    categoryLabel: "Volcán",
    title: "Volcán",
    level: "info",
    date: hoursAgo(1),
    lat: 10.83,
    lon: -85.33,
    distanceKm: 25,
    url: "https://eonet.gsfc.nasa.gov/",
    ...partial,
  };
}

describe("vigencia por amenaza", () => {
  it("un volcán sin reportes desde el 27 de abril ya no está activo", () => {
    expect(isCurrent(alert({ date: "2026-04-27T00:00:00Z" }), NOW)).toBe(false);
    expect(isCurrent(alert({ date: hoursAgo(10 * 24) }), NOW)).toBe(true);
  });

  it("un sismo vale 72 horas", () => {
    expect(isCurrent(alert({ category: "earthquakes", source: "RSN", date: hoursAgo(70) }), NOW)).toBe(true);
    expect(isCurrent(alert({ category: "earthquakes", source: "RSN", date: hoursAgo(80) }), NOW)).toBe(false);
  });

  it("un foco de calor de FIRMS vale 24 horas y uno de GDACS usa el código EQ", () => {
    expect(isCurrent(alert({ category: "wildfires", source: "NASA FIRMS", date: hoursAgo(30) }), NOW)).toBe(false);
    expect(isCurrent(alert({ category: "EQ", source: "GDACS", date: hoursAgo(100) }), NOW)).toBe(false);
  });

  it("un ciclón del NHC siempre está vigente mientras el NHC lo publique", () => {
    expect(isCurrent(alert({ category: "severeStorms", source: "NHC", date: hoursAgo(500) }), NOW)).toBe(true);
  });

  it("manda lo vencido al historial con una nota y descarta los focos de calor viejos", () => {
    const { current, stale } = partitionCurrent(
      [
        alert({ id: "volcan-viejo", date: "2026-04-27T00:00:00Z" }),
        alert({ id: "sismo", category: "earthquakes", source: "RSN", date: hoursAgo(5) }),
        alert({ id: "fuego-viejo", category: "wildfires", source: "NASA FIRMS", date: hoursAgo(40) }),
      ],
      NOW,
    );
    expect(current.map((item) => item.id)).toEqual(["sismo"]);
    expect(stale.map((item) => item.id)).toEqual(["volcan-viejo"]);
    expect(stale[0].detail).toBe("Sin reportes nuevos desde esta fecha.");
  });
});

describe("en curso (ocurre en este momento)", () => {
  it("un sismo está en curso solo la primera hora", () => {
    expect(isOngoing(alert({ category: "earthquakes", source: "RSN", date: hoursAgo(0.5) }), NOW)).toBe(true);
    expect(isOngoing(alert({ category: "earthquakes", source: "RSN", date: hoursAgo(22) }), NOW)).toBe(false);
  });

  it("un volcán está en curso si su último reporte es de hoy", () => {
    expect(isOngoing(alert({ date: hoursAgo(5) }), NOW)).toBe(true);
    expect(isOngoing(alert({ date: hoursAgo(10 * 24) }), NOW)).toBe(false);
  });

  it("un boletín de tsunami informativo no está en curso; una advertencia de hace 3 h sí", () => {
    const bulletin = { category: "tsunami", source: "PTWC" as const, date: hoursAgo(3) };
    expect(isOngoing(alert({ ...bulletin, level: "info" }), NOW)).toBe(false);
    expect(isOngoing(alert({ ...bulletin, level: "red" }), NOW)).toBe(true);
  });

  it("un ciclón del NHC está en curso mientras se publique", () => {
    expect(isOngoing(alert({ category: "severeStorms", source: "NHC", date: hoursAgo(200) }), NOW)).toBe(true);
  });
});

describe("nombres de lugar", () => {
  it("usa la región real si el sismo de OVSICORI está fuera de Costa Rica", () => {
    expect(ovsicoriPlace("El Salvador", "Sitio Santa Rosa", "La Cruz")).toBe("El Salvador");
    expect(ovsicoriPlace("South of Panama", "Puesto La Playa", "Golfito")).toBe("Sur de Panamá");
  });

  it("conserva el pueblo dentro de Costa Rica, en la costa y en la frontera", () => {
    expect(ovsicoriPlace("Costa Rica", "San Pablo", "León Cortés")).toBe("San Pablo, León Cortés");
    expect(ovsicoriPlace("Off Coast of Costa Rica", "San Pedrillo", "Osa")).toBe(
      "Frente a la costa, cerca de San Pedrillo, Osa",
    );
    expect(ovsicoriPlace("Panama-Costa Rica Border Region", "Cuervito", "Golfito")).toBe(
      "Frontera con Panamá, cerca de Cuervito, Golfito",
    );
  });

  it("traduce las distancias de USGS", () => {
    expect(usgsPlace("60 km S of Masachapa, Nicaragua")).toBe("60 km al S de Masachapa, Nicaragua");
    expect(usgsPlace("18 km WNW of Río Grande, Panama")).toBe("18 km al ONO de Río Grande, Panamá");
    expect(usgsPlace("South of Panama")).toBe("Sur de Panamá");
    expect(usgsPlace(null)).toBe("Sismo regional");
  });
});

describe("revisado o preliminar", () => {
  const feature = (evaluationMode: string) => ({
    features: [
      {
        id: "x",
        geometry: { coordinates: [-84.0, 9.9] },
        properties: { time: NOW / 1000, depthKm: 10, magnitudeValue: 4, evaluationMode, regionName: "Costa Rica", pueblo: "San José", canton: "Central" },
      },
    ],
  });

  it("OVSICORI «manual» es revisado y «automatic» es preliminar", () => {
    expect(parseOvsicori(feature("manual"), { lat: 9.93, lon: -84.08 }, NOW)[0].reviewed).toBe(true);
    expect(parseOvsicori(feature("automatic"), { lat: 9.93, lon: -84.08 }, NOW)[0].reviewed).toBe(false);
  });

  it("un sismo fusionado es revisado si alguna red lo revisó", () => {
    const base: SeismicEvent = {
      id: "a",
      source: "OVSICORI",
      magnitude: 4,
      depthKm: 10,
      time: "2026-11-14T10:00:00Z",
      lat: 9.9,
      lon: -84,
      place: "San José",
      distanceKm: 5,
      url: null,
      reviewed: false,
    };
    const [merged] = mergeSeismic([base], [{ ...base, id: "b", source: "USGS", reviewed: true }]);
    expect(merged.reviewed).toBe(true);
  });
});
