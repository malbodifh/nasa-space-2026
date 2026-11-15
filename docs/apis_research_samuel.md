# APIs research — Samuel

> **Nota de trabajo.** Verificado el **14/11/2026**.
> La fuente oficial del equipo es [`25-api-research.md`](25-api-research.md); este archivo
> ordena la investigación para Samuel y para otros agentes. Si hay conflicto, gana `docs/25`.
>
> **Regla del equipo:** sin dato accesible no hay feature. Las claves viven solo en el
> servidor. La app **informa**; no reemplaza alertas oficiales ni promete predicción exacta.

---

## 0. Resumen en 10 líneas

1. **Incendio es el hazard más “core NASA”**: se puede armar casi todo el score sin login de
   Earthdata con **FIRMS** (focos actuales) + **GIBS** (focos históricos) + **POWER**
   (climatología 1981+) + **GFWED** (FWI diario) + **Worldview Snapshots** (antes/después).
2. **GIBS es la pieza que faltaba**: expone focos históricos como MVT diarios desde
   **2000-11-01** (MODIS) y **2012-01-20** (VIIRS), sin clave.
3. **FIRMS sigue siendo el dato operativo**, pero su API solo da **1–5 días**. El histórico
   masivo no sale de ahí: sale de GIBS.
4. **Inundación y deslizamiento** tienen core NASA (IMERG, SMAP, LHASA), pero con latencia de
   horas, archivos enormes y autenticación. Es un MVP más frágil.
5. **Ciclón no es core NASA**: la observación es NASA/NOAA, pero el cono y las probabilidades
   oficiales son **NHC**. El 14/11 no había tormenta activa: un demo sería hindcast.
6. **Sismo/volcán no es NASA-core en tiempo real**: USGS, OVSICORI y GVP son catálogo o
   monitoreo local, no predicción.
7. **La recomendación técnica es incendio, pero no es una decisión tomada.** Hazard, región y
   reto siguen abiertos.
8. **Lo que no es API**: GPM, Worldview, Earthdata, IMN, SINAMOT y CNE son portales. Las APIs
   reales son PPS/GES DISC, GIBS/WVS, CMR/DAAC, scraping HTML, IOC y —en CNE— ninguna.
9. **La latencia importa más que la belleza**: IMERG Early llega ~4 h tarde; no sirve para
   flash floods. POWER es reanálisis, no pronóstico. LHASA pesa ~146 MB/día.
10. **Todo pasa por el BFF de Next**: el cliente nunca llama APIs externas ni ve claves.

---

## 1. Cómo leer este documento

**Latencia** = cuánto tarda el *dato* en estar disponible, no cuánto tarda el HTTP.

**Estado** (verificado el 14/11/2026):

| Símbolo | Significado |
|---|---|
| ✅ | Verificado y usable |
| 🟡 | Usable con fricción: clave, registro, scraping o precomputar |
| 🔴 | Bloqueado o no automatizable |
| ⚪ | No probado |

**API vs portal:**

- **API**: devuelve JSON/CSV/GeoJSON/NetCDF de forma programática.
- **Portal**: HTML para humanos; si se automatiza, es scraping frágil.
- **API no documentada**: funciona, pero nadie garantiza el contrato (ej. OVSICORI).

---

## 2. Las 14 fuentes que pidió Samuel

### 2.1 NASA, NOAA y USGS

| # | Fuente | Qué monitorea | Latencia | Estado | De dónde sale | Cómo acceder |
|---|---|---|---|---|---|---|
| 1 | **GPM / IMERG** | Lluvia global, 0,1° (~10 km), cada 30 min | Early ~4 h · Late ~12 h · Final ~3,5 meses | 🟡 Datos con registro; PPS devuelve 401 sin login | NASA + JAXA; GPM Core Observatory y constelación | PPS (`jsimpsonhttps.pps.eosdis.nasa.gov/imerg/`), GES DISC/Earthdata, GIBS y Giovanni. GeoTIFF/NetCDF/HDF, no JSON simple |
| 2 | **FIRMS** | Focos de calor de MODIS (1 km) y VIIRS (375 m) | Horas; URT < 60 s en EE. UU./Canadá | 🟡 API documentada; falta `FIRMS_MAP_KEY` | NASA LANCE/EOSDIS | REST CSV por bbox y 1–5 días: `/api/area/csv/{KEY}/{SOURCE}/{W,S,E,N}/{DAYS}`. También WMS. Límite 5.000/10 min |
| 3 | **NOAA GOES** | Nubes, vapor, incendios, ceniza, aerosoles y rayos | ABI 5–10 min · GLM ~20 s | ✅ CDN y S3 responden 200 | NOAA/NESDIS; GOES-19 East, GOES-18 West, GOES-16 backup | Imágenes: `cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/cam/GEOCOLOR/latest.jpg`. Datos: S3 `noaa-goes19`, `noaa-goes18`, `noaa-goes16`. Archivo: NOAA CLASS |
| 4 | **NASA Worldview** | Capas ambientales: IMERG, focos, aerosoles, SO₂, ceniza, color verdadero | Según capa: 30 min a diaria | ✅ WVS devuelve PNG/JPEG 200 | NASA EOSDIS/GIBS | GIBS WMTS + WVS Snapshot: `wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot...`. Sin clave |
| 5 | **NASA Earthdata** | Catálogo y descarga de datasets EOSDIS | Según dataset | 🟡 CMR abierto; datos requieren Earthdata Login | NASA EOSDIS y sus DAACs | CMR (`cmr.earthdata.nasa.gov/search/`), Earthdata Login (`urs.earthdata.nasa.gov`), DAACs (GES DISC, LP DAAC, ASF…) |
| 6 | **NASA LHASA** | Amenaza/exposición a deslizamientos | ~5 h; 1 km; 60°N–60°S | 🟡 ArcGIS 200; el GeoTIFF NRT pesa ~146 MB | NASA GSFC; IMERG + humedad + pendiente + COOLR | ArcGIS REST (`gis.earthdata.nasa.gov/.../Landslides/LHASA_Hazard_Today/ImageServer/exportImage?bbox=...`) o GeoTIFF NRT en NCCS. Para runtime, solo bbox |
| 7 | **USGS Earthquake** | Sismos: magnitud, profundidad, coordenadas, hora | Minutos | ✅ 200 | USGS Earthquake Hazards Program (ANSS/NEIC) | FDSN: `earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&...`. Feed: `.../feed/v1.0/summary/all_hour.geojson`. Sin clave |

### 2.2 Costa Rica y catálogo global

| # | Fuente | Qué monitorea | Latencia | Estado | De dónde sale | Cómo acceder |
|---|---|---|---|---|---|---|
| 8 | **IMN Costa Rica** | Estaciones automáticas (temp., lluvia, viento), pronóstico | ~10 min; datos preliminares | 🟡 Portal HTML; **sin API pública encontrada** | IMN / MINAE, Costa Rica | Lista: `/es/web/imn/estaciones-automaticas`. Ficha: `/especial/estacionPoas.html`. Tabla: `/especial/tablas/vpoas.html` (HTML con meta refresh) |
| 9 | **OVSICORI-UNA** | Sismos y actividad volcánica de Costa Rica | Minutos | ✅ 200; **sin CORS** (usar server-side) | OVSICORI, Universidad Nacional (UNA) | GeoJSON no documentado: `/sistemas/sismolive-staging/data/latest.geojson`; índice `/data/index.json`; archivo mensual `/data/archive/2026-11.geojson` |
| 10 | **RSN-UCR** | Sismos sentidos y actividad volcánica | Minutos–horas | ✅ RSS 200 | Red Sismológica Nacional, UCR/ICE | RSS: `rsn.ucr.ac.cr/actividad-sismica/ultimos-sismos?format=feed&type=rss`. No hay JSON público |
| 11 | **SINAMOT-UNA** | Nivel del mar y tsunamis; 7 mareógrafos | 5 min (promedio por minuto) | 🟡 Portal; los datos reales están en IOC/UHSLC | UNA + IOC/UNESCO + NOAA/UHSLC | IOC: `ioc-sealevelmonitoring.org/service.php?query=data&code=limon&format=json&period=1`. Códigos CR: `limon`, `punt`, `quepo`, `golf`, `cuaj`, `cocos` |
| 12 | **CNE Costa Rica** | Alertas, emergencias y mapas de amenaza | Manual/desconocida | 🔴 403 + Cloudflare Turnstile; no automatizable | CNE, Costa Rica | Sin API pública. Solo acceso manual o convenio institucional. **No scrapear ni saltar el challenge** |
| 13 | **Smithsonian GVP** | Catálogo global de volcanes y erupciones | Catálogo; no es tiempo real | ✅ WFS 200; el sitio web bloquea bots (403) | Smithsonian Institution, Global Volcanism Program | WFS: `webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?...&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes&outputFormat=application/json`. Filtro `CQL_FILTER=Country='Costa Rica'` |
| 14 | **NOAA NHC** | Ciclones tropicales: trayectoria, cono, avisos | Cada advisory (6 h) | ✅ 200; hoy sin tormentas activas | NOAA/NWS, Miami | `nhc.noaa.gov/CurrentStorms.json`; KML `gis/kml/nhc_active.kml`; RSS `gis-at.xml` y `gis-ep.xml`; GIS `nhc.noaa.gov/gis/` |

### 2.3 Notas por fuente

**1. GPM / IMERG**
- No es una API JSON: es un dataset científico. Para un demo, usá la capa GIBS
  `IMERG_Precipitation_Rate_30min` o un GeoTIFF recortado.
- Early ~4 h, Late ~12 h, Final ~3,5 meses. **No sirve para flash floods.**
- El GeoTIFF de PPS viene escalado ×10 (0,1 mm): dividir antes de mostrar.

**2. FIRMS**
- La API solo da **1–5 días**. Para 20 años, GIBS.
- Sin `MAP_KEY` devuelve **400**. La key se pide gratis y llega por correo.
- El WMS lleva la key en el path: **nunca** ponerlo en el cliente. Si se usa, proxear por
  el BFF.
- Normalizar `confidence` (VIIRS: `l/n/h`; MODIS: 0–100) y `frp` (MW).

**3. GOES**
- Para Costa Rica, el sector `cam` de GOES-19 es el que sirve; `car` cubre el Caribe.
- Las imágenes `latest.jpg` son pesadas (~8 MB). Redimensionar en servidor o usar tiles.
- GOES observa; no pronostica. El pronóstico oficial es NHC.

**4. Worldview**
- Es un visor. Las APIs reales son **GIBS** (tiles) y **WVS** (snapshot).
- No todas las capas tienen dato para cualquier fecha; si el PNG sale vacío, probá otra
  hora o capa.
- Ideal para “así se veía” / “así se ve hoy”, no para el score.

**5. Earthdata**
- No es “una API”, es un ecosistema. El contrato cambia por dataset.
- CMR sirve para descubrir y citar; la descarga real va por el DAAC.
- `earthaccess` (Python) simplifica login + búsqueda + descarga.

**6. LHASA**
- Hay dos caminos: el GeoTIFF NRT (~146 MB/día) y el ArcGIS REST con `exportImage` por
  bbox (verificado, ~47 KB para Costa Rica).
- Para runtime, **nunca** descargar el global. Precomputar un recorte regional.
- `LHASA_Exposure` es exposición, no amenaza. Para amenaza: `LHASA_Hazard_Today/Tomorrow/
  Yesterday`.

**7. USGS**
- No emite alertas de tsunami. Para tsunamis: IOC/SINAMOT o PTWC.
- Distinguir `automatic` de `reviewed`; los primeros pueden cambiar.

**8. IMN**
- No encontré API pública. Las estaciones son HTML con `<meta refresh content="60">`.
- Datos **preliminares**, ~10 min. Scraping frágil; respetar términos.
- Para el demo, mejor un snapshot cacheado que depender del scraping en vivo.

**9. OVSICORI**
- GeoJSON público pero **no documentado**; la URL dice `staging`.
- 1.463 eventos, retención 730 días; últimos 30 días en `latest.geojson`.
- Sin CORS: llamarlo desde el servidor.
- No es NASA; usarlo como complemento local, no como core.

**10. RSN**
- El RSS es lo más estable: últimos sismos con título, magnitud y link.
- No hay JSON ni filtros por bbox. Para histórico, OVSICORI o USGS.

**11. SINAMOT**
- El portal no tiene API; los datos están en IOC/UHSLC.
- `period=1` devuelve ~1 día y **todos** los sensores. Filtrar `sensor`:
  `rad`/`prs` son nivel del mar; `bat` es batería; `sw1`/`sw2` son switches.
- Es monitoreo, no alerta oficial de tsunami.

**12. CNE**
- Cloudflare Turnstile: `curl` 403, navegador “Verificación de seguridad en curso”.
- No hay API verificada. No saltar el challenge ni scrapear.
- Si el producto necesita CNE, pedir acceso institucional o mostrar el link oficial.

**13. GVP**
- WFS abierto; el sitio web bloquea bots.
- 10 volcanes de Costa Rica; Poás con última erupción 2026, Rincón 2024, Turrialba 2022.
- Es catálogo histórico, no alerta en vivo. Citar la versión del dataset.

**14. NHC**
- El 14/11 `CurrentStorms.json` devolvía `{"activeStorms":[]}`.
- Para Costa Rica, el RSS relevante es **Pacífico Este** (`gis-ep.xml`).
- Si el hazard es ciclón, el demo tiene que ser **hindcast** (archivo 2026: 36 tormentas).

---

## 3. Core NASA del proyecto (docs/25)

| Fuente | Qué monitorea | Latencia | Estado | De dónde sale | Cómo acceder |
|---|---|---|---|---|---|
| **GIBS** | Imágenes y focos históricos: MODIS desde 2000-11-01; VIIRS desde 2012-01-20 | Casi NRT; MVT diario | ✅ Tiles y MVT 200; probado con 2005, 2018, 2019 y 2026 | NASA EOSDIS | WMTS (`gibs.earthdata.nasa.gov/wmts/...`) y MVT de anomalías térmicas. Sin clave. **MVT en EPSG:4326**, no MapLibre directo |
| **POWER** | Climatología/reanálisis: temperatura, lluvia, viento, humedad, suelo | ~2–3 días; último válido 2026-11-11 | ✅ 200; devuelve `-999` como fill | NASA LaRC; MERRA-2 (~0,5°) | REST: `/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,WS2M,RH2M&...`. Sin clave. No sirve para extremos locales |
| **GFWED** | Fire Weather Index (FWI) del sistema canadiense | GEOS-5 ~12 h; MERRA-2 ~2 meses | ✅ 200; NetCDF de 17,2 MB | NASA GISS; MERRA-2/GEOS-5 | NetCDF: `portal.nccs.nasa.gov/datashare/GlobalFWI/...`. Sin clave. Recortar con `xarray`/`netCDF4` |
| **Worldview Snapshots** | Imagen “antes/después” de una fecha y bbox | Según capa | ✅ 200; JPEG/PNG 512×512 | NASA EOSDIS | `wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=...&BBOX=...&TIME=...`. Sin clave |
| **CMR** | Metadatos y procedencia de datasets | Tiempo real | ✅ 200 | NASA EOSDIS | `cmr.earthdata.nasa.gov/search/collections.json` y `/granules.json`. Sin clave |
| **EONET** | Catálogo curado de eventos (incendios, tormentas, volcanes…) | Curado; respuesta 3–7 s | ✅ 200 | NASA | `eonet.gsfc.nasa.gov/api/v3/events`. Sin clave. **Ojo:** su `bbox` va en orden distinto |
| **SMAP** | Humedad del suelo | Días | ✅ Capas GIBS 200; crudo requiere Earthdata | NASA | GIBS (`SMAP_L3_Passive_Day_Soil_Moisture`) o GES DISC. Para valores, Earthdata |

### 3.1 Lo que hay que saber de GIBS

- **Raster** (EPSG:3857): IMERG 30 min, MODIS true color, land cover, SMAP, NDVI, GEDI.
- **MVT** (EPSG:4326): `MODIS_Combined_Thermal_Anomalies_All` y
  `VIIRS_SNPP_Thermal_Anomalies_375m_All`.
- El `source-layer` del MVT **cambia con la fecha**: no hardcodear; recorrer todas las capas.
- La geometría viene en coordenadas de tile: usar las propiedades `LATITUDE`/`LONGITUDE`.
- MapLibre no pinta MVT EPSG:4326 directo: decodificar en el servidor con
  `@mapbox/vector-tile` + `pbf` y devolver GeoJSON.
- Las capas raster son PNG coloreados: **no** sirven para leer valores numéricos.

### 3.2 Lo que hay que saber de POWER y GFWED

- POWER: `-999` es fill; filtrarlo. `time_standard: LST`; no asumir UTC.
- POWER no es pronóstico: es reanálisis. No lo uses para “va a llover mañana”.
- GFWED: NetCDF pesado; descargar 1 archivo, recortar y cachear. Si falla, proxy con POWER
  y **no** llamarlo “FWI”.

---

## 4. Complementos no NASA

| Fuente | Qué monitorea | Latencia | Estado | De dónde sale | Cómo acceder |
|---|---|---|---|---|---|
| **GDACS** | Alertas multi-riesgo (ciclones, incendios, inundaciones…) | Minutos | ✅ 200 | EC/JRC (Europa) | API con `pageSize`/`pageNumber`; `limit` se ignora. Atribución obligatoria |
| **Open-Meteo** | Viento, lluvia, temperatura, PM2.5 | Horas | ✅ 200 | Open-Meteo (no NASA) | REST; free tier 10k/día, 5k/h, 600/min; CC-BY 4.0. **No tiene FWI** |
| **Photon** | Geocoding | ms | ✅ 200 | Komoot/OSM | `photon.komoot.io/api/?q=...` |
| **OSRM** | Rutas | s | 🟡 Sin SLA | OSRM/OSM | `router.project-osrm.org/route/v1/driving/...` |
| **Overpass** | Edificios/exposición | Variable | 🟡 Mirrors inestables | OSM | Overpass QL; el principal dio 502, Kumi 200, private.coffee 504 |
| **Nominatim** | Geocoding | 1 req/s | 🔴 403 desde esta red | OSM | No usarlo directo; política estricta de User-Agent y caché |

---

## 5. Cómo se accede (snippets)

```bash
# FIRMS — focos de Costa Rica, últimos 2 días
https://firms.modaps.eosdis.nasa.gov/api/area/csv/$FIRMS_MAP_KEY/VIIRS_SNPP_NRT/-86,8,-82,12/2

# FIRMS — estado de la key (5000/10 min)
https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=$FIRMS_MAP_KEY

# GIBS — focos históricos (MVT, EPSG:4326; decodificar en servidor)
https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Combined_Thermal_Anomalies_All/default/2019-11-14/1km/{z}/{y}/{x}.mvt

# POWER — serie diaria de un punto
https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,WS2M,RH2M&community=RE&longitude=-84&latitude=10&start=20260101&end=20261113&format=JSON

# GFWED — FWI diario (NetCDF)
https://portal.nccs.nasa.gov/datashare/GlobalFWI/v2.0/fwiCalcs.GEOS-5/Default/GEOS-5/2026/FWI.GEOS-5.Daily.Default.20261112.nc

# Worldview — imagen de una fecha
https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326&BBOX=-86,8,-82,12&WIDTH=1024&HEIGHT=1024&TIME=2026-11-13&FORMAT=image/jpeg

# USGS — sismos en Costa Rica
https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2026-11-01&minmagnitude=4&minlatitude=7&maxlatitude=12&minlongitude=-86&maxlongitude=-82

# OVSICORI — últimos 30 días (sin CORS: server-side)
https://www.ovsicori.una.ac.cr/sistemas/sismolive-staging/data/latest.geojson

# IOC/SINAMOT — nivel del mar en Limón
https://www.ioc-sealevelmonitoring.org/service.php?query=data&code=limon&format=json&period=1

# GVP — volcanes de Costa Rica
https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=GVP-VOTW:Smithsonian_VOTW_Holocene_Volcanoes&CQL_FILTER=Country%3D%27Costa%20Rica%27&outputFormat=application/json

# NHC — estado actual
https://www.nhc.noaa.gov/CurrentStorms.json
```

**Nunca** pongas una key real en un archivo del repo, en un snippet compartido ni en el
cliente. Usá `$FIRMS_MAP_KEY` o `{KEY}` como placeholder.

---

## 6. Contratos y estados

La app no debe ver JSON crudo de las agencias. Estos son los tipos mínimos (ver
[`24-arquitectura-app.md`](24-arquitectura-app.md)):

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

type ApiMeta = {
  cached: boolean;
  updatedAt: string;
  latencySeconds: number;
  fallback: boolean;
};
```

**Regla:** si falta el dato principal (FIRMS para el “ahora”, GIBS/POWER para la
comparación), no se inventa el score: `level: "info"` y una razón explícita.

### Fallbacks

| Falla | Qué hacer |
|---|---|
| FIRMS sin key / cuota | Último JSON cacheado + capa GIBS (con hora) + aviso visible |
| GFWED no disponible | Proxy POWER con menor confianza; **no** mostrar “FWI” |
| GIBS caído | Mapa y FIRMS siguen; se desactiva “memoria” y “antes/después” |
| POWER caído | Climatología precomputada + `fallback: true` |
| Worldview caído | Sin imagen; se muestra el evento y la fuente |
| Sin dato principal | `level: "info"`, razón “sin datos”, sin score |

---

## 7. Qué usaría para el MVP

### Si el hazard es incendio (recomendación técnica)

**Core mínimo:**

1. **FIRMS** → focos de las últimas 24–72 h.
2. **GIBS** → memoria histórica de focos (2000+) y capa visual.
3. **POWER** → climatología y percentiles de la región.
4. **GFWED** → FWI del día.
5. **Worldview Snapshots** → “antes/después”.

**Por qué:** es el único hazard donde casi todo el score se arma con NASA y sin Earthdata.
Además encaja con el reto **#8 Hot Spots** (MODIS/VIIRS) y permite un ángulo **#2**
(tendencia histórica).

### Si el hazard es otro

| Hazard | Piezas NASA | Riesgo 48 h | Veredicto |
|---|---|---|---|
| **Inundación** | IMERG + SMAP + POWER + Worldview | Latencia ~4 h; IMERG crudo con auth | Medio |
| **Deslizamiento** | LHASA + IMERG + SMAP | LHASA 146 MB/día y host inestable | Bajo |
| **Ciclón** | IMERG + GIBS + SMAP + Worldview | Sin tormenta activa; hindcast | Medio-bajo |
| **Sismo/volcán** | InSAR/NISAR, no NRT | Depende de OVSICORI/USGS | No |

**No prometer:** alerta oficial, predicción exacta, cobertura total, “descubrimiento” ni
probabilidades inventadas. Decir “según NASA”, con hora y link.

---

## 8. Seguridad, atribución y gotchas

- **Claves solo en el servidor** (`web/.env.local`, Vercel). El cliente nunca llama APIs
  externas.
- **FIRMS WMS**: la key viaja en la URL; proxear por el BFF o usar el area API + círculos.
- **GIBS MVT**: EPSG:4326; decodificar en servidor.
- **POWER**: filtrar `-999`; no es pronóstico; ~0,5°.
- **IMERG Early**: ~4 h; no usarlo para flash floods.
- **LHASA**: no descargar 146 MB por request; precomputar o usar `exportImage` por bbox.
- **CNE**: Cloudflare; no automatizar ni saltar el challenge.
- **OVSICORI**: sin CORS; server-side.
- **IOC**: filtrar sensores (`rad`/`prs`, no `bat`).
- **Atribución visible:** NASA, EOSDIS/GIBS, FIRMS, POWER, GFWED, NOAA/NHC, GDACS, OSM,
  Open-Meteo, OVSICORI (si se usa).

---

## 9. Cómo volver a verificar

Checklist mínima (14/11/2026):

```bash
# 1. USGS
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=1"

# 2. FIRMS sin key (esperado 400)
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/world/1"

# 3. GIBS MVT (esperado 200)
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Combined_Thermal_Anomalies_All/default/2019-11-14/1km/0/0/0.mvt"

# 4. POWER (esperado 200)
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=RE&longitude=-84&latitude=10&start=20260101&end=20260107&format=JSON"

# 5. Worldview (esperado 200)
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2026-11-13&BBOX=-86,8,-82,12&CRS=EPSG:4326&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&FORMAT=image/png&WIDTH=256&HEIGHT=256"

# 6. OVSICORI (esperado 200)
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://www.ovsicori.una.ac.cr/sistemas/sismolive-staging/data/latest.geojson"

# 7. IOC (esperado 200)
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://www.ioc-sealevelmonitoring.org/service.php?query=data&code=limon&format=json&period=1"

# 8. GVP WFS (esperado 200)
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows?service=WFS&version=1.0.0&request=GetCapabilities"

# 9. NHC (esperado 200)
curl -sS -o /dev/null -w "%{http_code}\n" \
  "https://www.nhc.noaa.gov/CurrentStorms.json"
```

**Nota:** `DEMO_KEY` de `api.nasa.gov` devolvió **429** el 14/11. Para FIRMS/GPM hay que
usar credenciales propias. Los estados pueden cambiar; siempre cachear y tener fallback.

---

## 10. Pendientes

1. **`FIRMS_MAP_KEY`**: pedirla y probar un bbox de la región demo.
2. **Hazard del MVP**: incendio recomendado; decisión abierta.
3. **Región demo**: una sola, con 2–3 eventos históricos verificables.
4. **Reto oficial**: #8 si es fuego; #2 si pesa la tendencia; #5 si es inundación.
5. **Scaffold `web/`**: Next.js + MapLibre; todavía no existe.
6. **Registro de fuentes**: si el equipo adopta la idea, mover esta información a
   `data/sources.json` + tarjetas en `docs/apis/` para que los agentes no adivinen.

---

## 11. Fuentes y enlaces

**Documentos del repo:**

- [`25-api-research.md`](25-api-research.md) — investigación oficial y veredicto.
- [`24-arquitectura-app.md`](24-arquitectura-app.md) — capas, contratos y deploy.
- [`22-investigacion-desastres.md`](22-investigacion-desastres.md) — inventario científico.
- [`23-plan-app.md`](23-plan-app.md) — producto y plan de 12 h.
- [`documentacion.md`](../documentacion.md) — índice y decisiones del equipo.

**Fuentes oficiales:**

- GPM/IMERG: <https://gpm.nasa.gov/data/imerg>
- FIRMS API: <https://firms.modaps.eosdis.nasa.gov/api/area/>
- FIRMS Map Key: <https://firms.modaps.eosdis.nasa.gov/api/map_key/>
- GOES: <https://www.star.nesdis.noaa.gov/GOES/>
- Worldview: <https://worldview.earthdata.nasa.gov/>
- GIBS: <https://nasa-gibs.github.io/gibs-api-docs/>
- Earthdata: <https://www.earthdata.nasa.gov/>
- CMR: <https://cmr.earthdata.nasa.gov/search/>
- POWER: <https://power.larc.nasa.gov/docs/services/api/>
- GFWED: <https://data.giss.nasa.gov/impacts/gfwed/>
- LHASA: <https://gpm.nasa.gov/landslides/>
- USGS Earthquake: <https://earthquake.usgs.gov/fdsnws/event/1/>
- IMN: <https://www.imn.ac.cr/>
- OVSICORI: <https://www.ovsicori.una.ac.cr/>
- RSN: <https://rsn.ucr.ac.cr/>
- SINAMOT: <https://www.sinamot.una.ac.cr/>
- CNE: <https://www.cne.go.cr/>
- GVP: <https://volcano.si.edu/>
- NHC: <https://www.nhc.noaa.gov/>

---

**Última actualización:** 14/11/2026.
**Autor:** investigación asistida para Samuel; verificar antes de usar en producción.
