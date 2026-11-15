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
    id: "nisar",
    label: "NASA-ISRO NISAR · radar L2 GCOV",
    endpoint: "https://cmr.earthdata.nasa.gov/search/granules.json?short_name=NISAR_L2_GCOV_V1",
    method: "CMR + PNG de vista previa (ASF DAAC)",
    auth: "sin clave (vista previa); Earthdata Login para el HDF5",
    mode: "snapshot",
    usedBy: ["vista Cambios con radar"],
    note: "Recortes y mapas de cambio en public/nisar/, generados con scripts/build-nisar.mjs.",
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
    id: "usgs",
    label: "USGS · sismos",
    endpoint: "https://earthquake.usgs.gov/fdsnws/event/1/query",
    method: "GET GeoJSON",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/overlays", "/api/alerts"],
    note: "Catálogo FDSN de 30 días, M≥2,5, en 600 km.",
  },
  {
    id: "ovsicori",
    label: "OVSICORI-UNA · sismos locales",
    endpoint:
      "https://www.ovsicori.una.ac.cr/sistemas/sismolive-staging/data/latest.geojson",
    method: "GET GeoJSON",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/overlays", "/api/alerts"],
    note: "Red sísmica de Costa Rica; sin CORS, solo desde el servidor.",
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
    usedBy: ["/api/events"],
    note: "VIIRS NOAA-20, NOAA-21 y S-NPP, últimos 2 días, agrupados en celdas de ~5 km. Caché 15 min.",
  },
  {
    id: "rsn",
    label: "RSN (UCR-ICE) · sismos sentidos",
    endpoint: "https://rsn.ucr.ac.cr/actividad-sismica/ultimos-sismos?format=feed&type=rss",
    method: "GET RSS",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/events"],
    note: "Solo sismos sentidos y revisados, con «sentido en». Caché 2 min.",
  },
  {
    id: "ptwc",
    label: "NOAA PTWC/NTWC · boletines de tsunami",
    endpoint: "https://www.tsunami.gov/events/xml/{PHEB|PAAQ}Atom.xml",
    method: "GET Atom",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/events"],
    note: "Pacífico y Atlántico/Caribe. Vigilancia, aviso o advertencia: alerta a cualquier distancia. Caché 2 min.",
  },
  {
    id: "nhc",
    label: "NOAA NHC · ciclones activos",
    endpoint: "https://www.nhc.noaa.gov/CurrentStorms.json",
    method: "GET JSON",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/events"],
    note: "Ciclones a menos de 1.500 km. Caché 10 min.",
  },
  {
    id: "open-meteo",
    label: "Open-Meteo · lluvia pronosticada",
    endpoint: "https://api.open-meteo.com/v1/forecast",
    method: "GET JSON",
    auth: "sin clave",
    mode: "live",
    usedBy: ["/api/events"],
    note: "Lluvia acumulada en 24 h en el punto. Es un modelo, no un aviso del IMN. Caché 30 min.",
  },
];

export async function GET() {
  return Response.json({
    status: "ok",
    app: "gamma-alert",
    version: "0.2.0",
    time: new Date().toISOString(),
    routes: [
      { path: "/api/assess", purpose: "riesgo, focos y clima del punto" },
      { path: "/api/overlays", purpose: "caminos, áreas protegidas, volcanes, fronteras y eventos" },
      { path: "/api/alerts", purpose: "alertas unificadas; ?test=1 genera una alerta de prueba" },
      { path: "/api/events", purpose: "alertas activas, historial y estado de cada fuente" },
      { path: "/api/nisar/search", purpose: "pasadas de NISAR alrededor de un punto (CMR)" },
      { path: "/api/nisar/browse", purpose: "vista previa PNG de un gránulo validado" },
      { path: "/api/health", purpose: "este mapa de conexiones" },
    ],
    env: { FIRMS_MAP_KEY: process.env.FIRMS_MAP_KEY ? "configurada" : "no configurada" },
    sources: SOURCES,
  });
}
