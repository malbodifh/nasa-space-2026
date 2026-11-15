export type LatLon = { lat: number; lon: number };

export type DailySeries = {
  date: string;
  precip: number;
  tMax?: number;
  rh?: number;
  wind?: number;
};

export type FirePoint = {
  id: string;
  lat: number;
  lon: number;
  date: string;
  time?: string;
  satellite?: string;
  instrument?: string;
  confidence?: string;
  frp?: number;
  distanceKm?: number;
};

export type FireStats = {
  date: string;
  count: number;
  nearestKm: number | null;
  maxFrp: number | null;
  points: FirePoint[];
  available: boolean;
  fallback: boolean;
};

export type ClimateStats = {
  lastDate: string;
  rain30mm: number;
  rain30Percentile: number;
  daysSinceRain: number;
  tMaxC: number | null;
  rhPct: number | null;
  windMs: number | null;
  years: number;
  source: "POWER" | "POWER_FALLBACK";
  fallback: boolean;
};

export type RiskLevel = "info" | "low" | "moderate" | "high" | "extreme";

export type RiskReason = {
  label: string;
  value: string;
  weight: number;
};

export type RiskSource = {
  name: string;
  url: string;
  latency: string;
};

export type RiskAssessment = {
  level: RiskLevel;
  score: number;
  reasons: RiskReason[];
  confidence: "low" | "medium" | "high";
  updatedAt: string;
  sources: RiskSource[];
  officialUrl: string;
  disclaimer: string;
};

export type AssessData = {
  current: FireStats;
  memory: FireStats;
  climate: ClimateStats | null;
  risk: RiskAssessment;
};

export type ApiMeta = {
  /**
   * Caché de la respuesta HTTP completa. No es verificable desde el proceso: el CDN puede
   * servir una copia aunque el origen no lo sepa, así que hoy se informa `false`.
   */
  cached: boolean;
  /** Legado: hora de generación de la respuesta, no de observación. */
  updatedAt: string;
  requestedAt?: string;
  /** Fecha más reciente de los datos fechados incluidos; null si no se conoce. */
  dataUpdatedAt?: string | null;
  /** Segundos desde el dato más reciente, no desde el más antiguo del historial. */
  latencySeconds?: number | null;
  fallback: boolean;
  durationMs: number;
};

export type AssessResponse = { data: AssessData; meta: ApiMeta };

export type GeoJsonGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "MultiLineString"; coordinates: [number, number][][] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

export type GeoFeature<Props> = {
  type: "Feature";
  properties: Props;
  geometry: GeoJsonGeometry;
};

export type GeoCollection<Props> = {
  type: "FeatureCollection";
  features: GeoFeature<Props>[];
};

export type RoadProps = { kind: string };

export type ProtectedAreaProps = {
  name: string;
  kind: string;
  protectClass?: number | null;
};

export type VolcanoProps = {
  name: string;
  country: string | null;
  type: string | null;
  elevation: number | null;
  lastEruption: number | string | null;
  url: string | null;
};

export type AlertLevel = "green" | "orange" | "red" | "info";

export type AlertSource =
  | "NASA EONET"
  | "GDACS"
  | "USGS"
  | "OVSICORI"
  | "RSN"
  | "PTWC"
  | "NHC"
  | "NASA FIRMS"
  | "Open-Meteo"
  | "Demostración";

export type DisasterAlert = {
  id: string;
  source: AlertSource;
  category: string;
  categoryLabel: string;
  title: string;
  level: AlertLevel;
  date: string;
  lat: number;
  lon: number;
  distanceKm: number;
  url: string;
  magnitude?: string | null;
  /** Magnitud numérica (sismos y tsunamis), para las reglas por amenaza. */
  magnitudeValue?: number;
  /** Lugares donde se sintió (RSN). */
  felt?: string | null;
  /** Otras redes que reportaron el mismo evento. */
  alsoReportedBy?: string[];
  /** Detalle corto y propio de la fuente (categoría del boletín, intensidad, mm de lluvia…). */
  detail?: string | null;
  /** Calidad del dato: revisado por un analista, preliminar (automático), pronóstico o satélite. */
  quality?: "revisado" | "preliminar" | "pronóstico" | "detección satelital" | null;
};

export type SourceStatus = {
  id: string;
  label: string;
  ok: boolean;
  count: number;
  /** Cantidad incluida en alerts/history después de filtros y deduplicación. */
  visibleCount?: number;
  /** Fecha del dato más reciente que trajo la fuente. */
  latest?: string | null;
  /** La fuente respondió, pero su archivo no se actualiza hace demasiado. */
  stale?: boolean;
};

export type OverlaySource = {
  id: "osm" | "gvp" | "natural-earth" | "eonet" | "gdacs" | "usgs" | "ovsicori";
  label: string;
  url: string;
  note: string;
  live: boolean;
  fallback: boolean;
};

export type OverlaysData = {
  roads: GeoCollection<RoadProps>;
  protectedAreas: GeoCollection<ProtectedAreaProps>;
  volcanoes: GeoCollection<VolcanoProps>;
  borders: GeoCollection<Record<string, never>>;
  alerts: DisasterAlert[];
  seismic: SeismicEvent[];
  sources: OverlaySource[];
};

export type OverlaysResponse = {
  data: OverlaysData;
  meta: ApiMeta & { fallbackSources: string[] };
};

export type EventsResponse = {
  data: { alerts: DisasterAlert[]; history: DisasterAlert[] };
  meta: ApiMeta & { fallbackSources: string[]; sources: SourceStatus[] };
};

export type SeismicEvent = {
  id: string;
  source: "USGS" | "OVSICORI" | "RSN";
  /** Nivel PAGER de USGS (impacto estimado), si existe. */
  pager?: "green" | "yellow" | "orange" | "red" | null;
  /** Intensidad máxima estimada (MMI), si existe. */
  mmi?: number | null;
  felt?: string | null;
  alsoReportedBy?: string[];
  magnitude: number;
  depthKm: number | null;
  time: string;
  lat: number;
  lon: number;
  place: string;
  distanceKm: number;
  url: string | null;
  reviewed: boolean;
};

export type LayerId = "roads" | "protected" | "volcanoes" | "borders" | "alerts" | "quakes";

export type LayerState = Record<LayerId, boolean>;

export type Correlation = {
  kind: "roads" | "protected" | "volcano" | "alerts";
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "attention";
  items: { name: string; meta: string }[];
};

export type AlertSeverity = "info" | "watch" | "warning" | "critical";

export type AppAlert = {
  id: string;
  kind: "fire" | "risk" | "official" | "test";
  severity: AlertSeverity;
  title: string;
  body: string;
  source: string;
  url: string | null;
  createdAt: string;
  distanceKm: number | null;
  scope: "point" | "radius" | "region";
};

export type AlertsData = {
  alerts: AppAlert[];
  generatedAt: string;
  point: LatLon;
  radiusKm: number;
};

export type AlertsResponse = {
  data: AlertsData;
  meta: ApiMeta & { fallbackSources: string[] };
};
