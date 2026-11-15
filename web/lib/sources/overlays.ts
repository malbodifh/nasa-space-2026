import "server-only";

import { distanceKm } from "@/lib/geo";
import { getEonetAlerts } from "@/lib/sources/eonet";
import { getGdacsAlerts } from "@/lib/sources/gdacs";
import { getOsmOverlays } from "@/lib/sources/overpass";
import { getBorders, getVolcanoes } from "@/lib/sources/static-overlays";
import type {
  DisasterAlert,
  GeoCollection,
  LatLon,
  OverlaySource,
  OverlaysData,
  ProtectedAreaProps,
  RoadProps,
  VolcanoProps,
} from "@/lib/types";

const EMPTY: GeoCollection<never> = { type: "FeatureCollection", features: [] };

function dedupe(alerts: DisasterAlert[]): DisasterAlert[] {
  const official = alerts.filter((alert) => alert.source === "GDACS");
  return alerts
    .filter((alert) => {
      if (alert.source === "GDACS") return true;
      return !official.some(
        (candidate) =>
          candidate.category === alert.category &&
          distanceKm(
            { lat: candidate.lat, lon: candidate.lon },
            { lat: alert.lat, lon: alert.lon },
          ) < 10,
      );
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function getOverlays(
  point: LatLon,
  radiusKm: number,
): Promise<{ data: Omit<OverlaysData, "sources"> & { sources: OverlaySource[] }; fallbackSources: string[] }> {
  const [osmResult, eonetResult, gdacsResult] = await Promise.allSettled([
    getOsmOverlays(point, radiusKm),
    getEonetAlerts(point),
    getGdacsAlerts(point),
  ]);

  const fallbackSources: string[] = [];

  const osm =
    osmResult.status === "fulfilled"
      ? osmResult.value
      : {
          roads: EMPTY as GeoCollection<RoadProps>,
          protectedAreas: EMPTY as GeoCollection<ProtectedAreaProps>,
          fallback: true,
          mode: "empty" as const,
          fetchedAt: null,
        };

  if (osmResult.status === "rejected" || osm.mode === "empty") fallbackSources.push("osm");

  const eonet = eonetResult.status === "fulfilled" ? eonetResult.value : [];
  if (eonetResult.status === "rejected") fallbackSources.push("eonet");

  const gdacs = gdacsResult.status === "fulfilled" ? gdacsResult.value : [];
  if (gdacsResult.status === "rejected") fallbackSources.push("gdacs");

  const volcanoes = getVolcanoes(point, radiusKm);
  const borders = getBorders(point, radiusKm);

  const sources: OverlaySource[] = [
    {
      id: "osm",
      label: "Caminos y áreas protegidas · OpenStreetMap",
      url: "https://www.openstreetmap.org/copyright",
      note:
        osm.mode === "live"
          ? "Consulta viva a Overpass API, simplificada para el mapa."
          : osm.mode === "snapshot"
            ? "Snapshot local de OpenStreetMap para la región demo; se regenera con scripts/build-overlays.mjs."
            : "Overpass no respondió para este punto: sin capa de caminos.",
      live: osm.mode === "live",
      fallback: osm.mode === "empty",
    },
    {
      id: "gvp",
      label: "Volcanes · Smithsonian GVP",
      url: "https://volcano.si.edu/",
      note: "Catálogo Holoceno, snapshot del repositorio. No es monitoreo en vivo.",
      live: false,
      fallback: false,
    },
    {
      id: "natural-earth",
      label: "Fronteras · Natural Earth 110m",
      url: "https://www.naturalearthdata.com/",
      note: "Límites internacionales de referencia, no son fronteras oficiales.",
      live: false,
      fallback: false,
    },
    {
      id: "eonet",
      label: "Eventos naturales · NASA EONET",
      url: "https://eonet.gsfc.nasa.gov/",
      note: eonetResult.status === "rejected"
        ? "EONET no respondió en esta consulta."
        : "Eventos abiertos en el área; EONET agrega fuentes como GDACS e InciWeb.",
      live: true,
      fallback: eonetResult.status === "rejected",
    },
    {
      id: "gdacs",
      label: "Alertas oficiales · GDACS",
      url: "https://www.gdacs.org/",
      note: gdacsResult.status === "rejected"
        ? "GDACS no respondió en esta consulta."
        : "Nivel verde/naranja/rojo según GDACS. Complemento no NASA.",
      live: true,
      fallback: gdacsResult.status === "rejected",
    },
  ];

  return {
    data: {
      roads: osm.roads,
      protectedAreas: osm.protectedAreas,
      volcanoes: volcanoes.collection as GeoCollection<VolcanoProps>,
      borders: borders as GeoCollection<Record<string, never>>,
      alerts: dedupe([...eonet, ...gdacs]),
      sources,
    },
    fallbackSources,
  };
}
