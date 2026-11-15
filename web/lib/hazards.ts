import type { DisasterAlert } from "@/lib/types";

export type HazardMeta = {
  id: string;
  label: string;
  singular: string;
  color: string;
  order: number;
};

/**
 * Catálogo de amenazas que EONET/GDACS reportan hoy. No todas aparecen en
 * cada consulta: la lista se filtra con los eventos abiertos del área.
 */
export const HAZARDS: HazardMeta[] = [
  { id: "wildfires", label: "Incendios", singular: "Incendio", color: "#b23a1a", order: 1 },
  { id: "volcanoes", label: "Volcanes", singular: "Volcán", color: "#7f1d1d", order: 2 },
  { id: "severeStorms", label: "Tormentas", singular: "Tormenta", color: "#33523f", order: 3 },
  { id: "floods", label: "Inundaciones", singular: "Inundación", color: "#2f4858", order: 4 },
  { id: "landslides", label: "Deslizamientos", singular: "Deslizamiento", color: "#a16207", order: 5 },
  { id: "earthquakes", label: "Sismos", singular: "Sismo", color: "#6e675c", order: 6 },
  { id: "drought", label: "Sequías", singular: "Sequía", color: "#877f6f", order: 7 },
  { id: "dustHaze", label: "Polvo y humo", singular: "Polvo o humo", color: "#8a8175", order: 8 },
  { id: "temperatureExtremes", label: "Temperatura extrema", singular: "Temperatura extrema", color: "#9a3412", order: 9 },
  { id: "snow", label: "Nieve", singular: "Nieve", color: "#4b5563", order: 10 },
  { id: "seaLakeIce", label: "Hielo", singular: "Hielo", color: "#374151", order: 11 },
  { id: "waterColor", label: "Agua", singular: "Agua", color: "#3f6212", order: 12 },
  { id: "manmade", label: "Otros", singular: "Evento", color: "#6e675c", order: 99 },
];

const BY_ID = new Map(HAZARDS.map((hazard) => [hazard.id, hazard]));

/** GDACS usa códigos de dos letras; EONET usa nombres largos. */
const GDACS_TO_EONET: Record<string, string> = {
  WF: "wildfires",
  VO: "volcanoes",
  TC: "severeStorms",
  FL: "floods",
  DR: "drought",
  EQ: "earthquakes",
};

export function hazardFor(category: string): HazardMeta {
  const id = GDACS_TO_EONET[category] ?? category;
  return (
    BY_ID.get(id) ?? {
      id,
      label: category,
      singular: category,
      color: "#6e675c",
      order: 50,
    }
  );
}

export function groupAlerts(alerts: DisasterAlert[]) {
  const groups = new Map<string, DisasterAlert[]>();
  for (const alert of alerts) {
    const hazard = hazardFor(alert.category);
    const list = groups.get(hazard.id) ?? [];
    list.push(alert);
    groups.set(hazard.id, list);
  }

  return Array.from(groups.entries())
    .map(([id, list]) => ({
      hazard: hazardFor(id),
      alerts: list.sort((a, b) => a.distanceKm - b.distanceKm),
    }))
    .sort((a, b) => {
      if (b.alerts.length !== a.alerts.length) return b.alerts.length - a.alerts.length;
      return a.hazard.order - b.hazard.order;
    });
}
