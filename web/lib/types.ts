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
  cached: boolean;
  updatedAt: string;
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

export type DisasterAlert = {
  id: string;
  source: "NASA EONET" | "GDACS";
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
};

export type OverlaySource = {
  id: "osm" | "gvp" | "natural-earth" | "eonet" | "gdacs";
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
  sources: OverlaySource[];
};

export type OverlaysResponse = {
  data: OverlaysData;
  meta: ApiMeta & { fallbackSources: string[] };
};

export type LayerId = "roads" | "protected" | "volcanoes" | "borders" | "alerts";

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
