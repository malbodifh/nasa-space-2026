import { distanceKm, pointInGeometry } from "@/lib/geo";
import type {
  Correlation,
  DisasterAlert,
  FirePoint,
  GeoCollection,
  LatLon,
  ProtectedAreaProps,
  RoadProps,
  VolcanoProps,
} from "@/lib/types";

const nf = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 1 });

type Segment = [[number, number], [number, number]];

function segments(collection: GeoCollection<RoadProps>): Segment[] {
  const output: Segment[] = [];
  for (const feature of collection.features) {
    const parts =
      feature.geometry.type === "MultiLineString"
        ? feature.geometry.coordinates
        : feature.geometry.type === "LineString"
          ? [feature.geometry.coordinates]
          : [];
    for (const part of parts) {
      for (let i = 1; i < part.length; i += 1) output.push([part[i - 1], part[i]]);
    }
  }
  return output;
}

function nearestSegmentKm(point: LatLon, list: Segment[]): number | null {
  if (list.length === 0) return null;
  const kx = 111.32 * Math.cos((point.lat * Math.PI) / 180);
  const ky = 110.57;
  let best = Number.POSITIVE_INFINITY;

  for (const [a, b] of list) {
    const ax = (a[0] - point.lon) * kx;
    const ay = (a[1] - point.lat) * ky;
    const bx = (b[0] - point.lon) * kx;
    const by = (b[1] - point.lat) * ky;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSq));
    const distance = Math.hypot(ax + dx * t, ay + dy * t);
    if (distance < best) best = distance;
  }

  return Number.isFinite(best) ? best : null;
}

function centroidOf(coordinates: unknown): [number, number] | null {
  const points: [number, number][] = [];
  const visit = (coords: unknown): void => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      points.push(coords as [number, number]);
      return;
    }
    for (const item of coords) visit(item);
  };
  visit(coordinates);
  if (points.length === 0) return null;
  let lon = 0;
  let lat = 0;
  for (const point of points) {
    lon += point[0];
    lat += point[1];
  }
  return [lon / points.length, lat / points.length];
}

export function correlate({
  point,
  fires,
  roads,
  protectedAreas,
  volcanoes,
  alerts,
  radiusKm,
  memoryMode,
}: {
  point: LatLon;
  fires: FirePoint[];
  roads: GeoCollection<RoadProps>;
  protectedAreas: GeoCollection<ProtectedAreaProps>;
  volcanoes: GeoCollection<VolcanoProps>;
  alerts: DisasterAlert[];
  radiusKm: number;
  memoryMode: boolean;
}): Correlation[] {
  const noun = memoryMode ? "detecciones" : "focos";
  const roadSegments = segments(roads);
  const areas = protectedAreas.features.map((feature) => ({
    name: feature.properties.name,
    geometry: feature.geometry,
    centroid: centroidOf(feature.geometry.coordinates),
  }));

  let nearRoad = 0;
  let closestRoad: number | null = null;
  let insideAreas = 0;
  let closestArea: { name: string; km: number } | null = null;
  const areaHits = new Map<string, number>();

  for (const fire of fires) {
    const point = { lat: fire.lat, lon: fire.lon };

    const roadKm = nearestSegmentKm(point, roadSegments);
    if (roadKm !== null) {
      if (roadKm <= 2) nearRoad += 1;
      if (closestRoad === null || roadKm < closestRoad) closestRoad = roadKm;
    }

    const area = areas.find((candidate) => pointInGeometry(point, candidate.geometry));
    if (area) {
      insideAreas += 1;
      areaHits.set(area.name, (areaHits.get(area.name) ?? 0) + 1);
    } else {
      for (const candidate of areas) {
        if (!candidate.centroid) continue;
        const km = distanceKm(point, { lat: candidate.centroid[1], lon: candidate.centroid[0] });
        if (!closestArea || km < closestArea.km) closestArea = { name: candidate.name, km };
      }
    }
  }

  let nearestVolcano: { name: string; km: number; lastEruption: string | number | null } | null = null;
  for (const feature of volcanoes.features) {
    if (feature.geometry.type !== "Point") continue;
    const [lon, lat] = feature.geometry.coordinates;
    const km = distanceKm(point, { lat, lon });
    if (!nearestVolcano || km < nearestVolcano.km) {
      nearestVolcano = { name: feature.properties.name, km, lastEruption: feature.properties.lastEruption };
    }
  }

  const inRadius = alerts.filter((alert) => alert.distanceKm <= radiusKm);

  return [
    {
      kind: "roads",
      label: "Cercanía a caminos",
      value:
        fires.length === 0
          ? "Sin detecciones"
          : nearRoad > 0
            ? `${nearRoad} de ${fires.length} ${noun} a menos de 2 km`
            : `Ningún ${noun.slice(0, -1)} a menos de 2 km`,
      detail:
        closestRoad === null
          ? "No hay capa de caminos disponible para este punto."
          : `El foco más cercano está a ${nf.format(closestRoad)} km de una vía principal o secundaria.`,
      tone: nearRoad > 0 ? "attention" : "neutral",
      items: [],
    },
    {
      kind: "protected",
      label: "Dentro de áreas protegidas",
      value:
        fires.length === 0
          ? "Sin detecciones"
          : insideAreas > 0
            ? `${insideAreas} de ${fires.length} ${noun}`
            : "Ninguna detección dentro",
      detail:
        insideAreas > 0
          ? `Áreas con detecciones: ${Array.from(areaHits.entries())
              .slice(0, 3)
              .map(([name, count]) => `${name} (${count})`)
              .join(", ")}.`
          : closestArea
            ? `El área protegida más cercana es ${closestArea.name}, a ${nf.format(closestArea.km)} km.`
            : "No hay áreas protegidas mapeadas en el radio de consulta.",
      tone: insideAreas > 0 ? "attention" : "neutral",
      items: Array.from(areaHits.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({
          name,
          meta: `${count} ${count === 1 ? "detección" : "detecciones"}`,
        })),
    },
    {
      kind: "volcano",
      label: "Volcán más cercano",
      value: nearestVolcano
        ? `${nearestVolcano.name} · ${nf.format(nearestVolcano.km)} km`
        : "Sin volcanes en el radio",
      detail: nearestVolcano
        ? nearestVolcano.lastEruption
          ? `Última erupción registrada: ${nearestVolcano.lastEruption}.`
          : "Sin erupción histórica registrada en el catálogo Holoceno."
        : "El catálogo del Smithsonian no tiene volcanes holocenos cerca de este punto.",
      tone: "neutral",
      items: [],
    },
    {
      kind: "alerts",
      label: "Alertas de desastre",
      value:
        alerts.length === 0
          ? "Sin eventos abiertos cerca"
          : inRadius.length > 0
            ? `${inRadius.length} dentro de ${radiusKm} km`
            : `${alerts.length} en la región, ninguno en el radio`,
      detail:
        alerts.length === 0
          ? "NASA EONET y GDACS no reportan eventos abiertos en el área consultada."
          : alerts
              .slice(0, 3)
              .map((alert) => `${alert.title} (${nf.format(alert.distanceKm)} km)`)
              .join(" · "),
      tone: inRadius.length > 0 ? "attention" : "neutral",
      items: alerts.slice(0, 3).map((alert) => ({
        name: alert.title,
        meta: `${alert.source} · ${nf.format(alert.distanceKm)} km`,
      })),
    },
  ];
}
