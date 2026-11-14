# 25 — APIs verificadas y core NASA

> **Fecha de verificación:** 14/11/2026, 22:00–22:30 UTC.
> **Estado:** investigación cerrada. No hay código de app todavía.
> **Objetivo:** saber qué datos NASA se pueden usar de verdad en 48 h, cuáles son
> complementarios y cuáles conviene descartar. La decisión de hazard/región sigue abierta;
> este documento recomienda, no decide.
>
> Documentos relacionados: [`22-investigacion-desastres.md`](22-investigacion-desastres.md)
> (inventario científico), [`24-arquitectura-app.md`](24-arquitectura-app.md) (arquitectura)
> y [`23-plan-app.md`](23-plan-app.md) (producto).

---

## 0. Veredicto en 6 líneas

1. **Sí se puede hacer un core 100 % NASA sin login de Earthdata** para incendios:
   **FIRMS** (focos actuales) + **GIBS** (20+ años de focos) + **POWER** (climatología
   1981–presente) + **GFWED** (FWI diario) + **Worldview Snapshots** (antes/después).
2. **GIBS es la pieza que faltaba**: expone los focos históricos como MVT diarios desde
   **2000-11-01** (MODIS) y **2012-01-20** (VIIRS), sin clave. Probado con datos de 2005,
   2018, 2019 y 2026.
3. **FIRMS sigue siendo el dato operativo**, pero su histórico ya no es público sin Earthdata:
   la API solo da **1–5 días** y la descarga masiva pide login.
4. **Inundación/deslizamiento** tienen core NASA (IMERG, SMAP, LHASA), pero con latencia,
   archivos globales enormes y autenticación. Es un MVP más frágil.
5. **Ciclón no es core NASA**: la observación es NASA, pero el cono y las probabilidades
   oficiales son **NHC/NOAA**. En noviembre no hay tormenta activa: el demo sería hindcast.
6. **Regla de oro:** NASA observa, NASA mide la rareza histórica y NASA muestra el
   antes/después. El pronóstico oficial y la exposición (OSM) son complementos, no el core.

---

## 1. Mapa de fuentes

| Fuente | Tipo | ¿Core NASA? | Clave | Latencia probada | Uso en el producto |
|---|---|---|---|---|---|
| **FIRMS** | NASA LANCE | Sí | `FIRMS_MAP_KEY` gratis | Horas; URT < 60 s en EE.UU./Canadá | Focos activos 1–5 días |
| **GIBS** | NASA EOSDIS | Sí | No | Tiles casi NRT; históricos por fecha | Imágenes, IMERG, focos 20+ años |
| **POWER** | NASA LaRC | Sí | No | ~2 días | Climatología, percentiles, sequía |
| **GFWED** | NASA GISS | Sí | No | ~12 h GEOS-5; ~2 meses MERRA-2 | Fire Weather Index |
| **Worldview Snapshots** | NASA EOSDIS | Sí | No | Según capa | Imagen antes/después |
| **CMR** | NASA EOSDIS | Sí | No | Tiempo real | Metadatos y procedencia |
| **EONET** | NASA | Sí (curado) | No | 3–7 s de respuesta | Catálogo de eventos |
| **LHASA** | NASA GSFC | Sí | No para NRT | ~4 veces/día; host inestable | Deslizamiento (si el hazard es ese) |
| **SMAP** | NASA | Sí | Earthdata para crudo | Días | Humedad del suelo |
| **GDACS** | No NASA | No | No | Minutos | Alertas oficiales multi-riesgo |
| **NHC** | NOAA | No | No | Cada advisory | Cono/trayectoria/probabilidades |
| **OSM/Photon/OSRM** | No NASA | No | No | Variable | Exposición, geocoding, rutas |
| **Open-Meteo** | No NASA | No | No | Horas | Viento/lluvia/calidad de aire |
| **OVSICORI** | Costa Rica | No | No | Minutos | Sismo/volcán local (complemento) |

**Decisión de arquitectura:** todo lo externo pasa por el BFF de Next. Ninguna de estas
fuentes se llama desde el navegador. Las claves viven solo en el servidor.

---

## 2. Core NASA

### 2.1 FIRMS — focos de calor

**Qué es:** detecciones de fuego activo de MODIS (1 km) y VIIRS (375 m/750 m), en NRT.
Es el dato operativo del MVP de incendios.

**Endpoint (documentado):**

```text
https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{SOURCE}/{WEST,SOUTH,EAST,NORTH}/{DAY_RANGE}/{DATE}
```

- `SOURCE`: `VIIRS_SNPP_NRT`, `VIIRS_NOAA20_NRT`, `VIIRS_NOAA21_NRT`, `MODIS_NRT`,
  `LANDSAT_NRT` (solo EE.UU./Canadá), o sus variantes `_SP`.
- `DAY_RANGE`: **1–5**.
- `DATE`: `YYYY-MM-DD`; si se omite, devuelve lo más reciente.
- `AREA`: bbox `west,south,east,north` o `world`.
- Ejemplo: `.../csv/{KEY}/VIIRS_SNPP_NRT/-85,-57,-32,14/2/2026-11-13`.

**Probado:** sin clave devuelve `400 Invalid MAP_KEY.` **No se pudo probar una llamada
exitosa con clave real**: falta la `MAP_KEY` del equipo. La clave se pide gratis en
`https://firms.modaps.eosdis.nasa.gov/api/map_key/` y llega por correo. **Acción de hoy:
pedirla y probar un bbox de la región demo.**

**Límites:** 5.000 transacciones / 10 minutos. Una consulta de 5 días puede contar como
varias. Cachear por bbox redondeado (0,5°) y ventana temporal.

**Columnas esperadas:** `latitude`, `longitude`, `bright_ti4`/`brightness`, `scan`, `track`,
`acq_date`, `acq_time`, `satellite`, `instrument`, `confidence`, `version`, `bright_ti5`/
`bright_t31`, `frp`, `daynight`, `type`.

**Gotcha:** el histórico **no** sale de esta API. Las URLs viejas
`/data/active_fire/` devuelven 404 y la descarga masiva pide Earthdata. Para 20 años, usar
GIBS (§2.2).

**Uso:** `/api/events` y el componente de proximidad del score. Normalizar `confidence`
(VIIRS: `l/n/h` o `low/nominal/high`; MODIS: 0–100) y `frp` (MW).

---

### 2.2 GIBS — el histórico que salva el MVP

**Qué es:** Global Imagery Browse Services, el servicio de imágenes de EOSDIS. Da WMTS
(mercator) para capas raster y **MVT históricos** para las anomalías térmicas.

**Capabilities (no cargar en runtime):**

```text
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml
```

Pesa ~5,6 MB. Descargar una vez en desarrollo y quedarse con los layer IDs.

#### Capas raster verificadas (EPSG:3857)

| Capa | Plantilla | Prueba |
|---|---|---|
| IMERG 30 min | `.../IMERG_Precipitation_Rate_30min/default/{TIME}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png` | 200, PNG |
| MODIS true color | `.../MODIS_Terra_CorrectedReflectance_TrueColor/default/{DATE}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg` | 200, JPG |
| Land cover anual | `.../MODIS_Combined_L3_IGBP_Land_Cover_Type_Annual/default/{YEAR}-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png` | 200 |
| SMAP humedad superficial | `.../SMAP_L3_Passive_Day_Soil_Moisture/default/{DATE}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png` | 200 |
| SMAP raíz | `.../SMAP_L4_Analyzed_Root_Zone_Soil_Moisture/default/{DATE}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png` | 200 |
| GEDI biomasa | `.../GEDI_ISS_L4B_Aboveground_Biomass_Density_Mean_201904-202303/default/2019-04-18/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png` | 200 |
| NDVI 8 días | `.../MODIS_Terra_NDVI_8Day/default/{DATE}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png` | 200 |

Todas devuelven `Access-Control-Allow-Origin: *` y `Cache-Control: no-store`. **No** usar
estas capas para leer valores numéricos: son PNG coloreados. Para el score, usar POWER o
los datos crudos con Earthdata.

#### Focos históricos: MVT en EPSG:4326

Esto es lo importante y lo que no está en la documentación de GIBS de forma obvia:

```text
https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Combined_Thermal_Anomalies_All/default/{DATE}/1km/{z}/{y}/{x}.mvt
https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_Thermal_Anomalies_375m_All/default/{DATE}/500m/{z}/{y}/{x}.mvt
```

- **MODIS Combined** cubre Aqua+Terra y llega desde **2000-11-01**.
- **VIIRS SNPP** llega desde **2012-01-20**; NOAA-20/21 tienen sus propias capas.
- El MVT viene **gzip**; el `fetch` de Node lo descomprime solo.
- Cada feature trae `LATITUDE`, `LONGITUDE`, `ACQ_DATE`, `ACQ_TIME`, `FRP`,
  `CONFIDENCE`, `VERSION`, `SATELLITE`, `INSTRUMENT` y `DAYNIGHT`.
- El `source-layer` **cambia con la fecha**: puede ser `..._v6_STD`, `..._v61_NRT`,
  `..._v1_STD` o `..._v2_NRT`. No hardcodear: recorrer todas las capas del MVT.
- La geometría viene en coordenadas de tile; usar las propiedades `LATITUDE`/`LONGITUDE`,
  no la geometría.

**Probado:** 2026-11-14 (6 focos), 2019-11-14 (2 focos MODIS), 2018-11-08 (26 focos),
2005-01-01 (3 focos), 2019-11-14 VIIRS (14 focos). Los cuatro devolvieron datos reales.

**Cómo pedir un tile EPSG:4326:** la matriz `1km` usa `MatrixWidth` 2, 3, 5, 10, 20, 40, 80
para `z=0..6` y `MatrixHeight = ceil(MatrixWidth/2)`. Entonces:

```text
nLon = [2, 3, 5, 10, 20, 40, 80][z]
nLat = ceil(nLon / 2)
x = floor((lon + 180) / 360 * nLon)
y = floor((90 - lat) / 180 * nLat)
```

Para VIIRS usar la matriz `500m`; tiene la misma lógica pero más resolución. Verificar el
`TileMatrixSet` de cada capa en las capabilities de `epsg4326`.

**Uso:** script offline `build-fire-memory.ts` que, para una región demo, descarga un tile
por día (o por mes) y guarda conteos por celda. No descargar 20 años en el request.

**Riesgo:** el MVT no es EPSG:3857, así que **MapLibre no lo puede pintar directo**. Se
decodifica en el servidor (`@mapbox/vector-tile` + `pbf`) y se devuelve GeoJSON. Si se
quiere capa visual, usar los puntos de FIRMS o un raster de IMERG/true color.

---

### 2.3 POWER — la línea base de 40 años

**Qué es:** meteorología y climatología de NASA LaRC, basada en MERRA-2 (reanálisis,
~0,5°). No es pronóstico.

**Endpoints verificados:**

```text
https://power.larc.nasa.gov/api/temporal/daily/point
https://power.larc.nasa.gov/api/temporal/monthly/point
https://power.larc.nasa.gov/api/temporal/climatology/point
https://power.larc.nasa.gov/api/temporal/hourly/point
```

Parámetros útiles: `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `WS2M`, `RH2M`,
`GWETTOP`, `GWETROOT`, `EVPTRNS`.

**Probado:**

- Daily 2026-01-01 → 2026-11-13: 317 días, 21 KB, ~5,9 s.
- Monthly 2020–2026: 89 filas, 3 KB, ~0,8 s.
- Climatology: 13 filas (meses + `ANN`), 1 KB, ~0,8 s.
- Hourly 2026-11-01 → 2026-11-13: 312 filas, 12 KB, ~0,9 s.
- **Último dato válido: 2026-11-11**; los dos últimos días vienen `-999`.
- `-999` es el fill value: filtrarlo, no graficarlo.
- `time_standard: LST`; no asumir UTC.

**Uso:** percentiles, anomalías, sequía (`GWETTOP`/`GWETROOT`), viento/humedad para el
proxy de fuego, y línea base 1981–presente. Para extremos locales no sirve: usa IMERG o
estaciones.

**Límites:** no hay cuota publicada. Una request por punto y caché 24 h; no pedir 40 años
en cada visita. Precomputar la climatología de la región demo.

---

### 2.4 GFWED — Fire Weather Index

**Qué es:** el FWI del Sistema Canadiense calculado por NASA GISS con MERRA-2 y GEOS-5.
Incluye códigos de humedad de combustible e índices de comportamiento.

**Acceso verificado:** NetCDF por archivo, sin clave.

```text
https://portal.nccs.nasa.gov/datashare/GlobalFWI/v2.0/fwiCalcs.GEOS-5/Default/GEOS-5/2026/FWI.GEOS-5.Daily.Default.20261112.nc
```

- Último archivo disponible al 14/11: **2026-11-12**, 17,2 MB, `Last-Modified` 13/11 14:14.
- Ruta histórica MERRA-2: `.../fwiCalcs.MERRA2/...`; latencia ~2 meses.
- GEOS-5: 0,25°, ~12 h de latencia; hay forecast experimental de 8 días.
- Variables esperadas: `FFMC`, `DMC`, `DC`, `ISI`, `BUI`, `FWI` (verificar nombres en el
  NetCDF antes de codificar).

**Uso:** componente “clima de fuego” del score. Descargar 1 archivo, recortar el punto o la
región con `xarray`/`netCDF4` y cachear. No meter NetCDF en el bundle del cliente.

**Fallback:** si GFWED no está, usar un proxy con POWER (`WS2M`, `RH2M`, `PRECTOTCORR`,
`GWETTOP`) y bajar la confianza; no llamarlo “FWI”.

---

### 2.5 Worldview Snapshots — antes/después

**Qué es:** API de imágenes compuestas de NASA Worldview. Ideal para la idea de “memoria
del lugar”: la misma casa/barrio en la fecha del evento y hoy.

**Endpoint verificado:**

```text
https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot
  &LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor,IMERG_Precipitation_Rate_30min
  &CRS=EPSG:4326&BBOX=-71,-34,-70,-33
  &WIDTH=512&HEIGHT=512&TIME=2026-11-13&FORMAT=image/jpeg
```

- 200, JPEG 512×512 (1,8 KB en la prueba).
- También devuelve PNG si se pide `FORMAT=image/png`.
- Sin clave.
- Es server-side: cachear por bbox/fecha/capas.

**Uso:** tarjeta “así se veía el 14/11/2019” y “así se ve hoy”. No es una alerta; es
evidencia visual.

---

### 2.6 SMAP, NDVI, land cover y GEDI

No son necesarios para el primer corte, pero son el “diagnóstico” NASA del territorio:

- **SMAP** (humedad del suelo): capas GIBS `SMAP_L3_Passive_Day_Soil_Moisture` y
  `SMAP_L4_Analyzed_Root_Zone_Soil_Moisture`. Para valores numéricos, GES DISC/OPeNDAP
  con Earthdata; para la UI, PNG.
- **NDVI** (`MODIS_Terra_NDVI_8Day`): verdor/estrés de la vegetación.
- **Land cover** (`MODIS_Combined_L3_IGBP_Land_Cover_Type_Annual`): tipo de combustible.
- **GEDI** (`GEDI_ISS_L4B_Aboveground_Biomass_Density_Mean_201904-202303`): biomasa/fuel
  load, estático 2019–2023.

**Regla:** para el score usar solo lo que tenga valor numérico defendible. Las capas PNG
sirven para explicar, no para inventar un número.

---

### 2.7 IMERG — lluvia observada

- Capa GIBS: `IMERG_Precipitation_Rate_30min`, 0,1°, cada 30 min.
- Tile verificado: 200, PNG, dato de `2026-11-13T23:30:00Z`.
- Latencia Early ~4 h; no sirve para flash flood, sí para acumulados y deslizamiento.
- Para valores: GES DISC con Earthdata; para visual: GIBS.

---

### 2.8 EONET — catálogo de eventos

- `https://eonet.gsfc.nasa.gov/api/v3/events` (JSON).
- Filtros: `source`, `category`, `status=open|closed|all`, `limit`, `days`, `start`,
  `end`, `bbox`, `magID`, `magMin`, `magMax`.
- **Ojo con `bbox`:** el orden es `min lon, max lat, max lon, min lat`, no el estándar.
- 13 categorías y 33 fuentes; `wildfires`, `severeStorms`, `floods`, `landslides`,
  `volcanoes`, etc.
- CORS `*`; respuesta 3–7 s → cachear 10 min.
- Es curado, no sensor en tiempo real. No usarlo para “alerta en segundos”.

---

### 2.9 CMR — procedencia

- `https://cmr.earthdata.nasa.gov/search/collections.json?keyword=FIRMS&page_size=2`
- `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=MOD14&page_size=1`
- CORS `*`.
- Sirve para mostrar el dataset ID, versión y citation en la UI. No es necesario para el
  MVP, pero suma para *Best Use of Data*.

---

### 2.10 LHASA — deslizamiento (solo si el hazard es ese)

- Portal: `https://portal.nccs.nasa.gov/datashare/landslides/nrt/hazard/tif/`.
- Último GeoTIFF global: `20261113T0000.tif`, **145,9 MB**; NetCDF: **201,8 MB**.
- `maps.nccs.nasa.gov` (visor/descarga) **no respondió** el 14/11.
- Latencia ~5 h; 1 km; cobertura 60°N–60°S.
- **No es viable en runtime**: descargar 145 MB por request es inviable. Si se usa, es
  precomputar un recorte regional con GDAL o usar GES DISC con Earthdata.

---

## 3. Complementarias (no NASA)

### 3.1 GDACS

- Búsqueda: `.../api/events/geteventlist/search?eventlist=WF&pageSize=3&pageNumber=1`
- Mapa: `.../api/events/geteventlist/map?eventtype=WF`
- `limit` se ignora; usar `pageSize`/`pageNumber`.
- Fechas: `fromDate`/`toDate` (camelCase).
- TC devuelve ~466 KB; WF ~49 KB.
- CORS `*`; atribución obligatoria.
- Uso: contexto y enlace a la alerta oficial, no el core.

### 3.2 NHC

- `https://www.nhc.noaa.gov/CurrentStorms.json` → `{"activeStorms":[]}` el 14/11.
- Archivo 2026: `https://www.nhc.noaa.gov/gis/archive_forecast.php?year=2026` (36 tormentas).
- Conos en GeoJSON: `.../gis/forecast/archive/EP202026_cone_ww_highres_10.geojson`.
- También KMZ/SHP: `.../EP202026_014Aadv_CONE.kmz`, `.../ep202026_5day_010A.zip`.
- Si el hazard es ciclón, el demo **tiene que ser hindcast**; no hay tormenta activa.

### 3.3 OSM, geocoding y rutas

- **Photon** (geocoding): `https://photon.komoot.io/api/?q=Santiago%20Chile&limit=1` → 200.
- **Nominatim**: 403 desde esta red; política de 1 req/s, User-Agent y caché. No usarlo
  directo.
- **Overpass**: el servidor principal devolvió 502 (“at capacity”); el mirror
  `https://overpass.kumi.systems/api/interpreter` respondió 200 (24 edificios en 100 m);
  `overpass.private.coffee` devolvió 504. El mirror reportó `timestamp_osm_base`
  **2026-07-24**: puede estar desactualizado para edificios nuevos. Usar Kumi con timeout
  y no depender de Overpass en vivo para el demo.
- **OSRM demo**: `https://router.project-osrm.org/route/v1/driving/...` → 200, 6,5 km en
  ~1,1 s. Sin SLA; si se usa, cachear y tener fallback.
- **Mapzen terrarium** (elevación): `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`
  → 200. No es NASA.

### 3.4 Open-Meteo

- Forecast: `https://api.open-meteo.com/v1/forecast?...` → 200, sin clave, CORS `*`.
- Calidad de aire: `https://air-quality-api.open-meteo.com/v1/air-quality?...` → 200.
- **No tiene `fire_weather_index`** (400); para FWI usar GFWED.
- Límites free: 10.000/día, 5.000/hora, 600/min; no comercial; CC-BY 4.0.
- Uso: viento/lluvia/PM2.5 como complemento, nunca como sustituto de NASA.

### 3.5 OVSICORI (Costa Rica)

- Índice: `https://www.ovsicori.una.ac.cr/sistemas/sismolive-staging/data/index.json`
  (1.463 eventos, retención 730 días).
- Últimos 30 días: `.../data/latest.geojson` (401 eventos).
- Archivo mensual: `.../data/archive/2026-11.geojson` (119 eventos).
- Sismos sentidos: `https://www.ovsicori.una.ac.cr/sistemas/sismos-sentidos/data/felt-events.json`
  (2.696 eventos, 1,35 MB).
- **Sin CORS**: server-side.
- No es NASA; sirve como complemento local si el equipo es de Costa Rica. No cambiar el
  core por esto.

---

## 4. Contratos normalizados

El dominio no ve JSON crudo de las agencias. Estos son los tipos mínimos:

```ts
type FireDetection = {
  id: string;
  lat: number;
  lon: number;
  detectedAt: string;      // ISO UTC
  sensor: "MODIS" | "VIIRS" | "LANDSAT";
  satellite: string;
  confidence: number;      // 0..100 normalizado
  frp: number;             // MW
  version?: string;
  source: "FIRMS" | "GIBS";
};

type FireWeather = {
  date: string;
  fwi?: number;
  ffmc?: number;
  dmc?: number;
  dc?: number;
  isi?: number;
  bui?: number;
  source: "GFWED";
  resolutionDeg: number;
};

type ClimateBaseline = {
  parameter: "PRECTOTCORR" | "T2M" | "WS2M" | "RH2M" | "GWETTOP";
  p50: number;
  p90: number;
  p99: number;
  years: number;           // 1981..presente
  source: "POWER";
};

type ImagerySnapshot = {
  date: string;
  bbox: [number, number, number, number];
  layers: string[];
  url: string;             // proxy cacheado
  source: "GIBS" | "WORLDVIEW";
};
```

**Regla:** si falta el dato principal (FIRMS para el “ahora”, GIBS/POWER para la
comparación), no se inventa el score: `level: "info"` y una razón explícita.

---

## 5. Qué hazard es más “core NASA”

| Hazard | Piezas NASA | ¿Core NASA real? | Riesgo 48 h | Veredicto |
|---|---|---|---|---|
| **Incendio** | FIRMS + GIBS + POWER + GFWED + Worldview | **Sí, casi total** | FIRMS key; GFWED NetCDF | **Recomendado** |
| **Inundación** | IMERG + SMAP + POWER + Worldview | Sí, pero observacional | Latencia 4 h; IMERG crudo con auth | Medio |
| **Deslizamiento** | LHASA + IMERG + SMAP | Sí | LHASA 145 MB y host caído | Bajo |
| **Ciclón** | IMERG + GIBS + SMAP + Worldview | Parcial: el pronóstico es NOAA | Sin tormenta activa; hindcast | Medio-bajo |
| **Sismo/volcán** | InSAR/NISAR, no NRT | No | Depende de OVSICORI/USGS | No |

**Conclusión:** si el objetivo es “core NASA”, **incendio** es el único hazard donde todas
las piezas del score son NASA y se consiguen sin login de Earthdata (FIRMS pide una
`MAP_KEY` gratis, no una cuenta). Encaja además con el reto **#8 Hot Spots** (armonización
MODIS/VIIRS) y permite un ángulo **#2** (tendencia histórica).

**No decide el equipo:** hazard, región y reto siguen abiertos. Pero si la prioridad es
NASA-core, la recomendación técnica es fuego.

---

## 6. Plan de datos para el MVP de incendios

### 6.1 Runtime (request)

```text
GET /api/events?hazard=fire&bbox=...&days=1..5
  → FIRMS area API (cache 5 min por bbox redondeado)

GET /api/risk?lat&lon&radius
  → FIRMS (proximidad)
  → GFWED (FWI del día, cache 12 h)
  → POWER (viento, humedad, lluvia, suelo; cache 24 h)
  → GIBS/POWER (climatología precomputada)
  → score explicable + razones + confianza

GET /api/climatology?lat&lon
  → JSON precomputado (POWER + GIBS)

GET /api/imagery?bbox&date
  → Worldview Snapshots (cache 24 h)
```

### 6.2 Precomputar (offline, no en request)

1. **POWER 1981–presente** para la región demo: percentiles mensuales de lluvia,
   temperatura, viento y humedad del suelo. Salida: `data/fire-climatology.json` (<2 MB).
2. **GIBS 20 años** para la región demo: un tile/día (o un tile/mes) de
   `MODIS_Combined_Thermal_Anomalies_All` y `VIIRS_SNPP_Thermal_Anomalies_375m_All`;
   agregar por celda 0,05° y mes. Salida: conteos, no puntos crudos.
3. **GFWED**: descargar 1–8 archivos NetCDF, recortar la región y guardar FWI diario.
4. **Worldview**: no precomputar; cachear las imágenes que se muestran.

**Tiempo estimado:** GIBS 20 años con 1 tile/día ≈ 7.300 requests; a 0,3–0,5 s por tile,
1–2 h. Si se samplea 1 tile/mes, baja a ~240 requests y alcanza para el demo.

**Tamaño:** un JSON de climatología por región < 2 MB; los NetCDF y TIFF **no** van al
repo. Guardar solo el agregado.

---

## 7. Fallbacks y estados

| Falla | Qué hacer |
|---|---|
| FIRMS sin key / cuota | Último JSON cacheado + capa GIBS (con hora) + aviso visible |
| GFWED no disponible | Proxy POWER con menor confianza; no mostrar “FWI” |
| GIBS caído | Mapa y FIRMS siguen; se desactiva “memoria” y “antes/después” |
| POWER caído | Climatología precomputada + `fallback: true` |
| Worldview caído | Sin imagen; se muestra el evento y la fuente |
| Sin dato principal | `level: "info"`, razón “sin datos”, sin score |

Toda respuesta lleva `meta: { cached, updatedAt, latencySeconds, fallback }`.

---

## 8. Límites, caché y atribución

| Fuente | Límite / política | Caché recomendada | Atribución |
|---|---|---|---|
| FIRMS | 5.000 transacciones/10 min; 1–5 días | 5 min | NASA FIRMS |
| POWER | Sin cuota publicada; requests grandes lentas | 24 h | NASA POWER / LaRC |
| GIBS | CDN; no hay cuota pública | tiles: según capa; capabilities: una vez | NASA GIBS/EOSDIS |
| GFWED | Sin cuota; archivos de 17 MB | 12 h | NASA GISS / GFWED |
| EONET | Sin cuota publicada; 3–7 s | 10 min | NASA EONET |
| GDACS | Sin cuota publicada; `pageSize` | 10 min | GDACS |
| NHC | Sin cuota; productos oficiales | 5 min | NOAA/NHC |
| Open-Meteo | 10k/día, 5k/h, 600/min; no comercial | 1 h | Open-Meteo (CC-BY 4.0) |
| Nominatim | 1 req/s; UA; caché | — | OSM |
| OSRM demo | Sin SLA | 1 h | OSRM/OSM |
| OVSICORI | Sin términos públicos; no martillar | 1–5 min | OVSICORI-UNA |

**Atribución en UI:** NASA, EOSDIS/GIBS, FIRMS, POWER, GFWED, NOAA/NHC, GDACS, OSM,
Open-Meteo, OVSICORI (si se usa). La submission oficial va en inglés.

---

## 9. Pruebas realizadas (14/11/2026)

| Prueba | Resultado |
|---|---|
| EONET events/categorías/fuentes | 200, JSON, CORS `*`, 13 categorías, 33 fuentes |
| POWER daily 2026 | 200, 317 días, último válido 2026-11-11, `-999` |
| POWER climatology | 200, 2001–2025, 13 filas |
| GIBS IMERG tile | 200, PNG, dato 2026-11-13T23:30Z |
| GIBS true color tile | 200, JPG |
| GIBS MVT MODIS 2005/2018/2019/2026 | 200, gzip, features con FRP/confianza |
| GIBS MVT VIIRS 2019 | 200, 14 features |
| GIBS land cover / SMAP / GEDI / NDVI | 200, PNG |
| Worldview Snapshots | 200, JPEG 512×512 |
| CMR collections/granules | 200, CORS `*` |
| FIRMS sin key | 400 `Invalid MAP_KEY` |
| GFWED 2026-11-12 | 200, 17,2 MB |
| LHASA 2026-11-13 | 200, TIFF 145,9 MB; visor `maps.nccs` caído |
| GDACS WF/TC | 200; `limit` ignorado; `pageSize` funciona |
| NHC CurrentStorms | 200, `activeStorms: []` |
| NHC archivo 2026 | 200, 36 tormentas; conos GeoJSON |
| Photon | 200 |
| Nominatim | 403 |
| Overpass | Principal 502; Kumi 200; private.coffee 504 |
| OSRM | 200 |
| Open-Meteo forecast / air quality | 200; `fire_weather_index` 400 |
| Carto / OpenFreeMap | 200 |
| OVSICORI index/latest/archive/felt | 200, JSON/GeoJSON, sin CORS |

---

## 10. Decisiones pendientes (para el equipo)

1. **Hazard del MVP.** Recomendación técnica: incendio, por core NASA y encaje #8.
2. **Región demo.** Una sola; idealmente con 2–3 eventos históricos verificables.
3. **Reto oficial.** #8 si es fuego; #2 si el peso es la tendencia histórica; #5 si es
   inundación. “Create Your Own Challenge” no es elegible para Global Judging.
4. **Dueño de la `FIRMS_MAP_KEY`.** Pedirla hoy; sin ella no hay demo en vivo.
5. **¿Earthdata o solo no-auth?** Para el MVP, no-auth: FIRMS + GIBS + POWER + GFWED.
   Earthdata solo si se necesitan SMAP/IMERG/LHASA crudos.
6. **¿Se usa OVSICORI?** Solo como complemento local; no es NASA.

---

## 11. Fuentes

- EONET v3: <https://eonet.gsfc.nasa.gov/docs/v3>
- FIRMS API: <https://firms.modaps.eosdis.nasa.gov/api/area/>
- FIRMS Map Key: <https://firms.modaps.eosdis.nasa.gov/api/map_key/>
- GIBS: <https://nasa-gibs.github.io/gibs-api-docs/>
- GIBS WMTS: <https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml>
- POWER API: <https://power.larc.nasa.gov/docs/services/api/>
- Worldview Snapshots: <https://wvs.earthdata.nasa.gov/api/v1/snapshot>
- CMR: <https://cmr.earthdata.nasa.gov/search/>
- GFWED: <https://data.giss.nasa.gov/impacts/gfwed/>
- GFWED datos: <https://portal.nccs.nasa.gov/datashare/GlobalFWI/>
- LHASA: <https://gpm.nasa.gov/landslides/> · <https://github.com/nasa/LHASA>
- IMERG: <https://gpm.nasa.gov/data/imerg>
- GDACS API: <https://www.gdacs.org/gdacsapi/swagger/index.html>
- NHC GIS: <https://www.nhc.noaa.gov/gis/>
- OVSICORI: <https://www.ovsicori.una.ac.cr/>
- OSM Nominatim policy: <https://operations.osmfoundation.org/policies/nominatim/>
- Open-Meteo terms: <https://open-meteo.com/en/terms>
- OSRM API: <https://project-osrm.org/docs/v5.24.0/api/>
