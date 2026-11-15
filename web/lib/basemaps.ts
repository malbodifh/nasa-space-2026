/**
 * Mapas base que la persona puede elegir en la portada. Todos son gratuitos y no piden clave.
 * - Mapa: CARTO Voyager, con agua, parques y carreteras en color.
 * - Satélite: Sentinel-2 sin nubes (EOX, datos Copernicus) con los nombres de Voyager encima.
 * - Relieve: OpenTopoMap, con curvas de nivel y sombreado del terreno.
 */
import type { StyleSpecification } from "maplibre-gl";

export type BasemapId = "mapa" | "satelite" | "relieve";

export const BASEMAP_IDS: BasemapId[] = ["mapa", "satelite", "relieve"];
export const DEFAULT_BASEMAP: BasemapId = "mapa";
export const BASEMAP_STORAGE_KEY = "mdf:mapa-base";

const VOYAGER_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const OSM = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

function raster(tiles: string[], attribution: string, maxzoom: number): StyleSpecification {
  return {
    version: 8,
    sources: { base: { type: "raster", tiles, tileSize: 256, maxzoom, attribution } },
    layers: [{ id: "base", type: "raster", source: "base" }],
  };
}

const SATELLITE_SOURCE = {
  type: "raster" as const,
  tiles: ["https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg"],
  tileSize: 256,
  maxzoom: 15,
  attribution:
    '<a href="https://s2maps.eu" target="_blank" rel="noreferrer">Sentinel-2 cloudless 2024</a> · EOX · Copernicus',
};

const RELIEF = raster(
  ["a", "b", "c"].map((s) => `https://${s}.tile.opentopomap.org/{z}/{x}/{y}.png`),
  `${OSM}, SRTM · <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a> (CC-BY-SA)`,
  17,
);

/**
 * Satélite: se parte del estilo vectorial de Voyager y se conservan solo los nombres y las fronteras,
 * en blanco con borde oscuro, encima de la imagen Sentinel-2.
 */
function satelliteFromVoyager(_previous: StyleSpecification | undefined, next: StyleSpecification): StyleSpecification {
  const keep = next.layers.filter(
    (layer) => (layer.type === "symbol" && !layer.id.startsWith("housenumber")) || layer.id.startsWith("boundary_country"),
  );
  return {
    ...next,
    sources: { ...next.sources, satellite: SATELLITE_SOURCE },
    layers: [
      { id: "satellite", type: "raster", source: "satellite" },
      ...keep.map((layer) => {
        if (layer.type === "symbol") {
          return { ...layer, paint: { ...layer.paint, "text-color": "#FFFFFF", "text-halo-color": "rgba(10,11,15,0.85)", "text-halo-width": 1.4 } };
        }
        if (layer.type === "line") return { ...layer, paint: { ...layer.paint, "line-color": "rgba(255,255,255,0.7)" } };
        return layer;
      }),
    ],
  };
}

const keepStyle = (_previous: StyleSpecification | undefined, next: StyleSpecification) => next;

/** Estilo y transformación que se pasan a MapLibre. Siempre lleva transformación: MapLibre reutiliza la última si falta. */
export function basemapStyle(id: BasemapId): {
  style: string | StyleSpecification;
  transformStyle: (previous: StyleSpecification | undefined, next: StyleSpecification) => StyleSpecification;
} {
  if (id === "satelite") return { style: VOYAGER_URL, transformStyle: satelliteFromVoyager };
  if (id === "relieve") return { style: RELIEF, transformStyle: keepStyle };
  return { style: VOYAGER_URL, transformStyle: keepStyle };
}

export function isBasemapId(value: unknown): value is BasemapId {
  return typeof value === "string" && (BASEMAP_IDS as string[]).includes(value);
}

/** Lee la última elección; si el almacenamiento no está disponible, usa el mapa en color. */
export function readBasemap(): BasemapId {
  try {
    const stored = window.localStorage.getItem(BASEMAP_STORAGE_KEY);
    return isBasemapId(stored) ? stored : DEFAULT_BASEMAP;
  } catch {
    return DEFAULT_BASEMAP;
  }
}

export function saveBasemap(id: BasemapId) {
  try {
    window.localStorage.setItem(BASEMAP_STORAGE_KEY, id);
  } catch {
    // Sin almacenamiento (modo privado): la elección dura solo esta visita.
  }
}
