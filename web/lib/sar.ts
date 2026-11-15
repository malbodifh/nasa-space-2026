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
      "Hasta el 18 de septiembre la zona casi no cambia. El 30 de septiembre, de golpe, cerca del " +
        "13 % se vuelve más brillante.",
      "El naranja cubre parcelas grandes al noroeste, con bordes rectos, y franjas junto al Tempisque.",
      "Las manchas magenta junto al río (HH fuerte) se agrandan en octubre y noviembre.",
      "Rincón de la Vieja, en la misma pasada del satélite, apenas sube 1,7 %: el salto se concentra " +
        "en las tierras bajas, no es un efecto de toda la imagen.",
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
      "Desde el 20 de julio cambia menos del 1 % de la zona en cada pasada.",
      "Los pocos cambios están al norte, en las orillas de los caños que bajan al río San Juan.",
      "Las lagunas (negras) y el herbazal inundable (gris) mantienen su forma todo el periodo.",
    ],
    hypotheses: [
      "En julio la temporada de lluvias ya llevaba dos meses: la llanura estaba anegada y siguió " +
        "así. Para ver la crecida habría que comparar con una pasada de la estación seca (marzo–abril).",
      "El agua abierta es lisa y refleja la señal lejos del satélite: por eso se ve negra. Los " +
        "puntos azules en las orillas son agua nueva; los naranjas, vegetación que quedó dentro del agua.",
      "Que cambie tan poco, frente al salto de Palo Verde el mismo día, sugiere que la lluvia de fines " +
        "de septiembre golpeó más fuerte en Guanacaste que en la Zona Norte.",
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
      "Entre julio y noviembre cambia menos del 2 % de la zona, sobre todo en potreros de las faldas bajas.",
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
      "El mapa de cambio queda casi vacío en tierra (menos de 0,5 % de la zona).",
      "El mar cambia de tono por el viento; el método lo ignora porque es agua en las dos fechas.",
    ],
    hypotheses: [
      "La banda L (24 cm) atraviesa parte del dosel: la señal rebota entre ramas y troncos y vuelve " +
        "en HV. Por eso el bosque brilla en verde y blanco.",
      "Como el bosque siempre está húmedo y cubierto, su respuesta casi no cambia entre junio y " +
        "noviembre: es la línea base que valida las otras zonas.",
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
  .map((zone) => ({ ...zone, ...STORIES[zone.id] }));

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

/** Área aproximada (km²) que representa un porcentaje de la zona. */
export function zoneAreaKm2([west, south, east, north]: Bounds): number {
  const midLat = ((south + north) / 2) * (Math.PI / 180);
  return (east - west) * 111.32 * Math.cos(midLat) * (north - south) * 110.57;
}

export function formatPct(value: number): string {
  return `${value.toLocaleString("es-CR", { maximumFractionDigits: 1 })} %`;
}
