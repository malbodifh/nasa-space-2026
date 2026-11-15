/** Acceso a las vistas previas públicas de NISAR en ASF DAAC (sin login). */

export const NISAR_COLLECTIONS = [
  { shortName: "NISAR_L2_GCOV_V1", status: "validado" as const },
  { shortName: "NISAR_L2_GCOV_PROVISIONAL_V1", status: "provisional" as const },
];

export const GRANULE_PATTERN = /^NISAR_L2_PR_GCOV_[A-Z0-9_]+$/;

export type NisarSearch = {
  frame: string;
  bounds: [number, number, number, number];
  passes: {
    date: string;
    status: "validado" | "provisional";
    collection: string;
    granule: string;
  }[];
};

export function isCollection(value: string): boolean {
  return NISAR_COLLECTIONS.some((collection) => collection.shortName === value);
}

export function browseUrl(collection: string, granule: string): string {
  return `https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/${collection}/${granule}/${granule}_LATLON.png`;
}

/** URL local que pasa la imagen por el servidor (mismo origen, para poder leer los píxeles). */
export function browseProxy(collection: string, granule: string): string {
  return `/api/nisar/browse?c=${encodeURIComponent(collection)}&g=${encodeURIComponent(granule)}`;
}
