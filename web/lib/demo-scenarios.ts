/**
 * Modo demo: alertas simuladas alrededor de la ubicación de la persona, para probar cómo
 * reacciona la app (estado, mapa con áreas roja y amarilla, lista y avisos) sin esperar un
 * evento real. Nunca se mezclan con datos reales sin marcarse: la fuente es «Demostración».
 */
import { distanceKm } from "@/lib/geo";
import type { DisasterAlert, LatLon } from "@/lib/types";

export const DEMO_SOURCE = "Demostración";

type Scenario = {
  id: string;
  label: string;
  hint: string;
  /** Distancia y rumbo (grados desde el norte) respecto a la persona. */
  km: number;
  bearing: number;
  alert: Omit<DisasterAlert, "id" | "source" | "date" | "lat" | "lon" | "distanceKm" | "url">;
};

export const DEMO_SCENARIOS: Scenario[] = [
  {
    id: "sismo",
    label: "Sismo fuerte",
    hint: "M 6,1 a 35 km",
    km: 35,
    bearing: 200,
    alert: {
      category: "earthquakes",
      categoryLabel: "Sismo",
      title: "M 6.1 · Sismo simulado",
      level: "orange",
      magnitude: "M 6.1",
      magnitudeValue: 6.1,
      detail: "Profundidad 14 km · sentido fuerte en la región.",
      quality: "preliminar",
    },
  },
  {
    id: "tsunami",
    label: "Tsunami",
    hint: "Advertencia en el Pacífico",
    km: 110,
    bearing: 250,
    alert: {
      category: "tsunami",
      categoryLabel: "Tsunami",
      title: "Advertencia de tsunami simulada",
      level: "red",
      magnitudeValue: 7.4,
      detail: "Aléjese de la costa y suba a terreno alto.",
    },
  },
  {
    id: "huracan",
    label: "Huracán",
    hint: "Categoría 2 a 180 km",
    km: 180,
    bearing: 90,
    alert: {
      category: "severeStorms",
      categoryLabel: "Ciclón o tormenta",
      title: "Huracán Demo",
      level: "red",
      detail: "Vientos de 165 km/h · se acerca a la costa.",
    },
  },
  {
    id: "volcan",
    label: "Erupción",
    hint: "Volcán a 12 km",
    km: 12,
    bearing: 20,
    alert: {
      category: "volcanoes",
      categoryLabel: "Volcán",
      title: "Erupción simulada",
      level: "orange",
      detail: "Columna de ceniza de 2 km · evite el área cercana al cráter.",
    },
  },
  {
    id: "inundacion",
    label: "Inundación",
    hint: "Desborde a 20 km",
    km: 20,
    bearing: 310,
    alert: {
      category: "floods",
      categoryLabel: "Inundación",
      title: "Desborde de río simulado",
      level: "orange",
      detail: "Zonas bajas en alerta · evite pasos de río.",
    },
  },
];

export const DEMO_ALL = "todo";

/** Punto a `km` kilómetros de `from`, en el rumbo dado (grados desde el norte). */
export function offsetPoint(from: LatLon, km: number, bearing: number): LatLon {
  const rad = (bearing * Math.PI) / 180;
  const lat = from.lat + (km / 111.2) * Math.cos(rad);
  const lon = from.lon + (km / (111.2 * Math.cos((from.lat * Math.PI) / 180))) * Math.sin(rad);
  return { lat, lon };
}

export function buildDemoAlerts(scenarioId: string, point: LatLon, at: number): DisasterAlert[] {
  const chosen = scenarioId === DEMO_ALL ? DEMO_SCENARIOS : DEMO_SCENARIOS.filter((s) => s.id === scenarioId);
  return chosen.map((scenario, index) => {
    const where = offsetPoint(point, scenario.km, scenario.bearing);
    return {
      ...scenario.alert,
      id: `demo-${scenario.id}-${at}`,
      source: DEMO_SOURCE,
      // Escalonadas por segundos para que la lista tenga un orden estable.
      date: new Date(at - 60_000 - index * 1000).toISOString(),
      lat: where.lat,
      lon: where.lon,
      distanceKm: Math.round(distanceKm(point, where)),
      url: "",
      detail: `Simulación, no es un evento real. ${scenario.alert.detail ?? ""}`.trim(),
    };
  });
}
