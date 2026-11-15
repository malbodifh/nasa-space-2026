import "server-only";

type SourceStatus = {
  id: string;
  label: string;
  endpoint: string;
  method: string;
  auth: string;
  mode: "live" | "snapshot" | "fallback";
  usedBy: string[];
  note: string;
};

const SOURCES: SourceStatus[] = [
  {
    id: "gibs",
    label: "NASA GIBS · anomalías térmicas",
    endpoint:
      "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Combined_Thermal_Anomalies_All/default/{date}/1km/{z}/{y}/{x}.mvt",
    method: "GET MVT",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/assess", "/api/alerts"],
    note: "Focos del día y memoria histórica; se decodifica en el servidor.",
  },
  {
    id: "power",
    label: "NASA POWER · climatología diaria",
    endpoint: "https://power.larc.nasa.gov/api/temporal/daily/point",
    method: "GET JSON",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/assess", "/api/alerts"],
    note: "Lluvia, temperatura, humedad y viento de 1981 al presente.",
  },
  {
    id: "worldview",
    label: "NASA Worldview Snapshots",
    endpoint: "https://wvs.earthdata.nasa.gov/api/v1/snapshot",
    method: "GET imagen",
    auth: "sin clave",
    mode: "live",
    usedBy: ["comparación antes/después"],
    note: "Imágenes MODIS del día elegido; no son medición de área quemada.",
  },
  {
    id: "eonet",
    label: "NASA EONET v3 · eventos naturales",
    endpoint: "https://eonet.gsfc.nasa.gov/api/v3/events",
    method: "GET JSON",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/overlays", "/api/alerts"],
    note: "Eventos abiertos en un bbox de 600 km; incluye fuentes GDACS.",
  },
  {
    id: "gdacs",
    label: "GDACS · alertas oficiales",
    endpoint: "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH",
    method: "GET JSON",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/overlays", "/api/alerts"],
    note: "Niveles verde/naranja/rojo. Complemento no NASA.",
  },
  {
    id: "overpass",
    label: "OpenStreetMap · Overpass API",
    endpoint: "https://overpass-api.de/api/interpreter",
    method: "GET Overpass QL",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/overlays"],
    note: "Caminos y áreas protegidas; snapshot local para la región demo.",
  },
  {
    id: "gvp",
    label: "Smithsonian GVP · volcanes holocenos",
    endpoint: "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows",
    method: "GET WFS",
    auth: "sin clave",
    mode: "snapshot",
    usedBy: ["/api/overlays"],
    note: "Catálogo cargado en data/volcanoes.json, no monitoreo en vivo.",
  },
  {
    id: "natural-earth",
    label: "Natural Earth · fronteras 110m",
    endpoint: "https://www.naturalearthdata.com/",
    method: "snapshot GeoJSON",
    auth: "sin clave",
    mode: "snapshot",
    usedBy: ["/api/overlays"],
    note: "Límites de referencia en data/borders.json.",
  },
  {
    id: "firms",
    label: "NASA FIRMS · focos cuasi-realtime",
    endpoint: "https://firms.modaps.eosdis.nasa.gov/api/area/",
    method: "GET CSV",
    auth: "FIRMS_MAP_KEY",
    mode: "live",
    usedBy: ["opcional, no conectado"],
    note: "Requiere clave gratuita; el MVP no depende de ella.",
  },
];

export async function GET() {
  return Response.json({
    status: "ok",
    app: "memoria-de-fuego",
    version: "0.2.0",
    time: new Date().toISOString(),
    routes: [
      { path: "/api/assess", purpose: "riesgo, focos y clima del punto" },
      { path: "/api/overlays", purpose: "caminos, áreas protegidas, volcanes, fronteras y eventos" },
      { path: "/api/alerts", purpose: "alertas unificadas; ?test=1 genera una alerta de prueba" },
      { path: "/api/health", purpose: "este mapa de conexiones" },
    ],
    env: { FIRMS_MAP_KEY: process.env.FIRMS_MAP_KEY ? "configurada" : "no configurada" },
    sources: SOURCES,
  });
}
