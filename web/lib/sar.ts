import manifestJson from "@/data/nisar.json";
import { distanceKm } from "@/lib/geo";
import type { LatLon } from "@/lib/types";

/** Una pasada de NISAR sobre una zona (generada por `scripts/build-nisar.mjs`). */
export type SarAcquisition = {
  date: string;
  cycle: number;
  status: "validado" | "provisional";
  collection: string;
  granule: string;
  h5Url: string | null;
  sizeMB: number;
  image: string;
  change: string | null;
  coverage: number;
  darkerPct: number;
  brighterPct: number;
};

type Bounds = [number, number, number, number];

type SarZoneData = {
  id: string;
  frame: string;
  frameBounds: Bounds;
  bounds: Bounds;
  imageSize: [number, number];
  baseline: string;
  acquisitions: SarAcquisition[];
};

type SarManifest = {
  generatedAt: string;
  source: Record<string, string>;
  method: {
    channels: string;
    changeThreshold: number;
    ignoreDarkInBoth: number;
    minCoverage: number;
    note: string;
  };
  zones: SarZoneData[];
};

/** Texto de cada zona: qué mirar y qué hipótesis físicas explican lo que se ve. */
export type SarStory = {
  name: string;
  region: string;
  kind: string;
  center: LatLon;
  lead: string;
  look: string[];
  hypotheses: string[];
  human: string;
};

export type SarZone = SarZoneData & SarStory;

/** Cifra de la vista previa; nunca representa superficie dañada ni agua confirmada. */
function previewChange(zoneId: string, date: string, direction: "brighterPct" | "darkerPct"): string {
  const pass = manifestJson.zones.find((zone) => zone.id === zoneId)?.acquisitions.find((item) => item.date === date);
  return pass ? formatPct(pass[direction]) : "—";
}

const STORIES: Record<string, SarStory> = {
  "palo-verde": {
    name: "Palo Verde y bajo Tempisque",
    region: "Guanacaste",
    kind: "Humedal estacional y arrozales",
    center: { lat: 10.35, lon: -85.33 },
    lead:
      "La llanura del río Tempisque se seca en verano y se moja con las lluvias. El radar registra " +
      "el cambio aunque esté nublado.",
    look: [
      "El 30 de septiembre aumenta el brillo en " +
        previewChange("palo-verde", "2026-09-30", "brighterPct") +
        " de los píxeles comparables de la vista previa, respecto de la base. No es un porcentaje de daño.",
      "El naranja cubre parcelas grandes al noroeste, con bordes rectos, y franjas junto al Tempisque.",
      "Las manchas magenta junto al río (HH fuerte) se agrandan en octubre y noviembre.",
      "Rincón de la Vieja, en la misma pasada, muestra " +
        previewChange("rincon-de-la-vieja", "2026-09-30", "brighterPct") +
        " de píxeles comparables más brillantes. Es un contraste entre zonas, no una validación causal.",
    ],
    hypotheses: [
      "Suelo mojado: el agua sube la constante dieléctrica del suelo y el eco vuelve más fuerte. Un " +
        "aguacero fuerte a fines de septiembre explicaría un salto parejo en tierras bajas y planas. " +
        "Se puede contrastar con la lluvia diaria de NASA POWER o IMERG.",
      "Doble rebote: cuando el agua cubre el suelo bajo juncos, pastos o arroz, la señal rebota en el " +
        "agua y luego en los tallos y vuelve fuerte en HH. Eso pinta magenta junto al río.",
      "Las formas rectangulares apuntan a riego y siembra de arroz o caña: actividad humana, no solo " +
        "el ciclo natural del humedal.",
    ],
    human:
      "El bajo Tempisque combina un parque nacional y sitio Ramsar con distritos de riego. La forma " +
      "de las parcelas ayuda a separar la inundación natural de la agrícola.",
  },
  "cano-negro": {
    name: "Caño Negro y río Frío",
    region: "Zona Norte",
    kind: "Llanura inundable estable en temporada lluviosa",
    center: { lat: 10.89, lon: -84.78 },
    lead:
      "Las lagunas de Caño Negro se llenan con la lluvia y drenan hacia el lago de Nicaragua. Entre " +
      "julio y noviembre el radar las ve casi iguales.",
    look: [
      "Desde la base del 20 de julio hay pocos píxeles con cambio aparente; consulte los valores de cada pasada.",
      "Los pocos cambios están al norte, en las orillas de los caños que bajan al río San Juan.",
      "Las lagunas (negras) y el herbazal inundable (gris) mantienen su forma todo el periodo.",
    ],
    hypotheses: [
      "En julio la temporada de lluvias ya llevaba dos meses: la llanura estaba anegada y siguió " +
        "así. Para ver la crecida habría que comparar con una pasada de la estación seca (marzo–abril).",
      "El agua abierta suele ser lisa y reflejar la señal lejos del satélite. Las orillas más " +
        "oscuras podrían indicar agua nueva; las más brillantes, suelo húmedo o vegetación inundada. No es una clasificación de agua.",
      "La diferencia con Palo Verde permite formular hipótesis sobre lluvia y manejo del suelo; " +
        "hay que contrastarlas con mediciones independientes antes de atribuirles una causa.",
    ],
    human:
      "Alrededor del refugio hay potreros y monocultivos (piña, caña). Una parcela con un cambio " +
      "brusco de brillo suele ser una siembra o una cosecha.",
  },
  "rincon-de-la-vieja": {
    name: "Volcán Rincón de la Vieja",
    region: "Guanacaste",
    kind: "Volcán activo y cordillera",
    center: { lat: 10.83, lon: -85.32 },
    lead:
      "Uno de los volcanes más activos del país, con erupciones freáticas frecuentes. Las alertas de " +
      "volcán de EONET llevan aquí.",
    look: [
      "El cono y los bosques de la cordillera se ven blancos y verdosos: vegetación densa.",
      "Entre julio y noviembre se observan pocos píxeles con cambio aparente, sobre todo en las faldas bajas.",
      "Cerca del cráter no aparece un cambio fuerte de brillo en este periodo.",
    ],
    hypotheses: [
      "Una erupción con lahares dejaría depósitos lisos de lodo y ceniza en los ríos que bajan del " +
        "cráter: se verían más oscuros (azul en el mapa de cambio).",
      "Para ver si el volcán se infla o se desinfla unos centímetros hace falta interferometría: el " +
        "producto NISAR GUNW compara la fase entre pasadas. Es el siguiente paso.",
      "Las laderas que miran al satélite brillan más que las que le dan la espalda; por eso siempre " +
        "comparamos pasadas de la misma órbita.",
    ],
    human:
      "El parque nacional limita con fincas ganaderas y con las plantas geotérmicas de Las Pailas y " +
      "Borinquen.",
  },
  tortuguero: {
    name: "Tortuguero",
    region: "Caribe",
    kind: "Zona de control: bosque inundado estable",
    center: { lat: 10.47, lon: -83.56 },
    lead:
      "Bosque denso, canales y lluvia todo el año. Sirve para comparar: si el método funciona, aquí " +
      "casi no debería marcar cambios.",
    look: [
      "El bosque se ve blanco y verdoso todo el periodo: HH y HV altos.",
      "El mapa muestra pocos píxeles con cambio aparente en tierra; no es una medición de superficie afectada.",
      "El mar puede cambiar de tono por el viento; se excluyen píxeles oscuros en ambas fechas, no una máscara validada de agua.",
    ],
    hypotheses: [
      "La banda L (24 cm) atraviesa parte del dosel: la señal rebota entre ramas y troncos y vuelve " +
        "en HV. Por eso el bosque brilla en verde y blanco.",
      "Como el bosque siempre está húmedo y cubierto, su respuesta casi no cambia entre junio y " +
        "noviembre: sirve como comparación exploratoria, no como validación independiente de las otras zonas.",
      "Un cambio fuerte aquí indicaría tala, una inundación extrema o un error de procesamiento.",
    ],
    human:
      "Al suroeste empiezan las bananeras. Una deforestación aparecería como pérdida brusca de " +
      "brillo en HV (menos volumen de vegetación).",
  },
};

// El JSON lo genera scripts/build-nisar.mjs; TypeScript infiere tuplas como number[].
const manifest = manifestJson as unknown as SarManifest;

export const SAR_METHOD = manifest.method;
export const SAR_SOURCE = manifest.source;
export const SAR_GENERATED_AT = manifest.generatedAt;

export const SAR_ZONES: SarZone[] = manifest.zones
  .filter((zone) => STORIES[zone.id] && zone.acquisitions.length > 1)
  .map((zone) => ({
    ...zone,
    ...STORIES[zone.id],
    // No ofrecer comparaciones hacia atrás con las pasadas descartadas antes de la base:
    // el 26 de junio de la pista 170 tiene un artefacto conocido de brillo.
    // El manifiesto y las imágenes originales se conservan para trazabilidad.
    acquisitions: zone.acquisitions.filter((item) => item.date >= zone.baseline),
  }))
  .filter((zone) => zone.acquisitions.length > 1);

export function sarZone(id: string): SarZone | undefined {
  return SAR_ZONES.find((zone) => zone.id === id);
}

function inside(point: LatLon, [west, south, east, north]: Bounds): boolean {
  return point.lon >= west && point.lon <= east && point.lat >= south && point.lat <= north;
}

/**
 * Zona de radar más cercana a un punto: la que lo contiene o, si ninguna, la más cercana a
 * menos de `maxKm` de su centro.
 */
export function zoneForPoint(point: LatLon, maxKm = 60, zones: SarZone[] = SAR_ZONES): SarZone | null {
  const containing = zones.find((zone) => inside(point, zone.bounds));
  if (containing) return containing;
  let best: SarZone | null = null;
  let bestKm = maxKm;
  for (const zone of zones) {
    const km = distanceKm(point, zone.center);
    if (km <= bestKm) {
      best = zone;
      bestKm = km;
    }
  }
  return best;
}

/** Esquinas para una fuente `image` de MapLibre: arriba-izq, arriba-der, abajo-der, abajo-izq. */
export function imageCorners([west, south, east, north]: Bounds): [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
] {
  return [
    [west, north],
    [east, north],
    [east, south],
    [west, south],
  ];
}

/** Índice de la pasada más cercana a una fecha ISO. */
export function nearestAcquisition(acquisitions: SarAcquisition[], date: string): number {
  if (acquisitions.length === 0) return -1;
  const target = Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
  let best = 0;
  let bestDiff = Number.POSITIVE_INFINITY;
  acquisitions.forEach((item, index) => {
    const diff = Math.abs(Date.parse(`${item.date}T00:00:00Z`) - target);
    if (diff < bestDiff) {
      best = index;
      bestDiff = diff;
    }
  });
  return best;
}

/** Índice de la fecha base (la única sin mapa de cambio). */
export function baselineIndex(acquisitions: SarAcquisition[]): number {
  const index = acquisitions.findIndex((item) => item.change === null);
  return index === -1 ? 0 : index;
}

/** Pasada con más superficie cambiada respecto de la fecha base. */
export function peakChange(acquisitions: SarAcquisition[]): number {
  let best = acquisitions.length - 1;
  let bestValue = -1;
  acquisitions.forEach((item, index) => {
    const value = item.darkerPct + item.brighterPct;
    if (item.change !== null && value > bestValue) {
      best = index;
      bestValue = value;
    }
  });
  return best;
}

/** Área del rectángulo de estudio. No convertir porcentajes de píxeles en área afectada. */
export function zoneAreaKm2([west, south, east, north]: Bounds): number {
  const midLat = ((south + north) / 2) * (Math.PI / 180);
  return (east - west) * 111.32 * Math.cos(midLat) * (north - south) * 110.57;
}

export function formatPct(value: number): string {
  return `${value.toLocaleString("es-CR", { maximumFractionDigits: 1 })} %`;
}
