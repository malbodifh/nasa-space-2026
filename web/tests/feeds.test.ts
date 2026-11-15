import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { affects, ruleFor } from "@/lib/alert-rules";
import { parseFirms, parseNhc, parsePtwc, rainAlert } from "@/lib/feeds-parse";
import { mergeSeismic, parseRsn, rsnTime } from "@/lib/seismic-parse";
import type { DisasterAlert, SeismicEvent } from "@/lib/types";

const fixture = (name: string) => readFileSync(path.join(__dirname, "fixtures", name), "utf8");
const SAN_JOSE = { lat: 9.93, lon: -84.08 };

function alert(partial: Partial<DisasterAlert>): DisasterAlert {
  return {
    id: "x",
    source: "USGS",
    category: "earthquakes",
    categoryLabel: "Sismo",
    title: "Sismo",
    level: "info",
    date: "2026-11-14T00:00:00Z",
    lat: 0,
    lon: 0,
    distanceKm: 10,
    url: "https://example.org",
    ...partial,
  };
}

describe("RSN", () => {
  it("convierte la hora local de Costa Rica a UTC", () => {
    expect(rsnTime("13 de noviembre del 2026", "12:04 pm")).toBe("2026-11-13T18:04:00.000Z");
    expect(rsnTime("05 de noviembre del 2026", "5:49 am")).toBe("2026-11-05T11:49:00.000Z");
  });

  it("lee los sismos sentidos del RSS real", () => {
    const events = parseRsn(fixture("rsn.xml"), SAN_JOSE, Date.parse("2026-11-15T00:00:00Z"));
    expect(events.length).toBeGreaterThan(3);
    const leonCortes = events.find((event) => event.time === "2026-11-13T18:04:00.000Z");
    expect(leonCortes).toMatchObject({ source: "RSN", magnitude: 3.2, lat: 9.71, lon: -84.02, depthKm: 7 });
    expect(leonCortes?.felt).toContain("San Marcos de Tarrazú");
  });
});

describe("fusión de sismos", () => {
  const base: SeismicEvent = {
    id: "a",
    source: "RSN",
    magnitude: 4.1,
    depthKm: 10,
    time: "2026-11-13T18:04:00Z",
    lat: 9.71,
    lon: -84.02,
    place: "León Cortés",
    distanceKm: 25,
    url: null,
    reviewed: true,
    felt: "San Marcos",
  };

  it("une el mismo sismo de tres redes y conserva PAGER y «sentido en»", () => {
    const merged = mergeSeismic(
      [base],
      [{ ...base, id: "b", source: "OVSICORI", felt: null, time: "2026-11-13T18:05:10Z" }],
      [{ ...base, id: "c", source: "USGS", felt: null, lat: 9.8, pager: "yellow", mmi: 5.2 }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe("RSN");
    expect(merged[0].alsoReportedBy).toEqual(["OVSICORI", "USGS"]);
    expect(merged[0]).toMatchObject({ felt: "San Marcos", pager: "yellow", mmi: 5.2 });
  });

  it("no une sismos separados en el tiempo", () => {
    const merged = mergeSeismic([base], [{ ...base, id: "d", source: "USGS", time: "2026-11-13T20:00:00Z" }]);
    expect(merged).toHaveLength(2);
  });
});

describe("PTWC", () => {
  it("lee el boletín real y lo descarta si está lejos y es solo informativo", () => {
    expect(parsePtwc(fixture("ptwc-pheb.xml"), SAN_JOSE)).toHaveLength(0);
    const nearby = parsePtwc(fixture("ptwc-pheb.xml"), { lat: 18.4, lon: -66.1 });
    expect(nearby).toHaveLength(1);
    expect(nearby[0]).toMatchObject({ level: "info", category: "tsunami", magnitudeValue: 4.9 });
  });

  it("marca en rojo una advertencia aunque el sismo esté lejos", () => {
    const xml = `<feed><entry><title>OFF COAST OF CENTRAL PERU</title><updated>2026-11-14T10:00:00Z</updated>
      <geo:lat>-12.0</geo:lat><geo:long>-78.0</geo:long>
      <summary type="xhtml"><div><strong>Category:</strong> Warning<br/><strong>Bulletin Issue Time: </strong> x
      <strong>Preliminary Magnitude: </strong>8.4(Mwp)</div></summary><id>urn:uuid:1</id></entry></feed>`;
    const [bulletin] = parsePtwc(xml, SAN_JOSE);
    expect(bulletin.level).toBe("red");
    expect(bulletin.distanceKm).toBeGreaterThan(2000);
    expect(affects(bulletin)).toBe(true);
  });

  it("conserva el centro emisor y advierte que no se conoce el alcance territorial", () => {
    const xml = `<entry><id>ejemplo</id><title>Zona</title><geo:lat>10</geo:lat><geo:long>-84</geo:long>
      <summary>Category: Warning Bulletin Issue Time: x</summary></entry>`;
    expect(parsePtwc(xml, SAN_JOSE, "NTWC")[0]).toMatchObject({
      id: "ntwc:ejemplo",
      source: "NTWC",
      detail: expect.stringContaining("Alcance territorial no determinado"),
    });
    expect(parsePtwc(xml, SAN_JOSE)[0].source).toBe("PTWC");
  });
});

describe("NHC", () => {
  it("devuelve nada sin tormentas activas", () => {
    expect(parseNhc({ activeStorms: [] }, SAN_JOSE)).toEqual([]);
  });

  it("marca en rojo un huracán a menos de 500 km", () => {
    const [storm] = parseNhc(
      {
        activeStorms: [
          { id: "al182026", name: "Prueba", classification: "HU", intensity: "90", latitude: "11.5N", longitude: "81.0W" },
        ],
      },
      SAN_JOSE,
    );
    expect(storm.level).toBe("red");
    expect(storm.title).toBe("Huracán Prueba");
    expect(storm.detail).toBe("Vientos de 167 km/h");
  });
});

describe("FIRMS", () => {
  const header = "latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight";
  const row = (lat: number, lon: number, confidence = "n", time = "0745") =>
    `${lat},${lon},330,0.4,0.4,2026-11-14,${time},N20,VIIRS,${confidence},2.0NRT,290,12.5,N`;

  const now = Date.parse("2026-11-14T12:00:00Z");

  it("reporta un grupo visto en dos pasadas con tres focos e ignora la confianza baja", () => {
    const csv = [header, row(10.5, -85.3), row(10.51, -85.31, "h", "0930"), row(10.5, -85.31), row(10.5, -85.3, "l")].join("\n");
    const alerts = parseFirms(csv, { lat: 10.63, lon: -85.44 }, { now });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].date).toBe("2026-11-14T09:30:00Z");
  });

  it("descarta lo visto en una sola pasada", () => {
    expect(parseFirms([header, row(11.2, -85.9)].join("\n"), SAN_JOSE, { now })).toHaveLength(0);
  });

  it("acepta un CSV vacío", () => {
    expect(parseFirms("", SAN_JOSE)).toEqual([]);
  });
});

describe("lluvia pronosticada", () => {
  const hours = (mm: number) => ({
    hourly: {
      time: Array.from({ length: 48 }, (_, i) => new Date(Date.UTC(2026, 10, 14, i)).toISOString().slice(0, 16)),
      precipitation: Array.from({ length: 48 }, () => mm),
    },
  });
  const now = new Date("2026-11-14T00:00:00Z");

  it("no avisa por lluvia normal", () => {
    expect(rainAlert(hours(1), SAN_JOSE, now)).toBeNull();
  });

  it("avisa en naranja con 100 mm o más en 24 h", () => {
    const rain = rainAlert(hours(5), SAN_JOSE, now);
    expect(rain?.title).toBe("Se pronostican 120 mm de lluvia en 24 horas");
    expect(rain?.level).toBe("orange");
  });
});

describe("reglas por amenaza", () => {
  it("un sismo M3,6 a 128 km no le afecta; uno sentido a 30 km sí", () => {
    expect(affects(alert({ magnitudeValue: 3.6, distanceKm: 128 }))).toBe(false);
    expect(affects(alert({ magnitudeValue: 3.2, distanceKm: 30, felt: "Alajuela" }))).toBe(true);
  });

  it("un M5,2 a 120 km le afecta", () => {
    expect(affects(alert({ magnitudeValue: 5.2, distanceKm: 120 }))).toBe(true);
  });

  it("un volcán a 25 km le afecta y a 170 km no", () => {
    expect(affects(alert({ category: "volcanoes", distanceKm: 25 }))).toBe(true);
    expect(affects(alert({ category: "volcanoes", distanceKm: 170 }))).toBe(false);
  });

  it("entiende los códigos de GDACS", () => {
    expect(ruleFor("TC")).toBe(ruleFor("severeStorms"));
  });
});
