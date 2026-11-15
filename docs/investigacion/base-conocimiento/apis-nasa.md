# API y servicios NASA

> **Cómo leer:** cada ficha distingue **documentada** (leí la documentación), **implementada**
> (está en `web/`), **probada** (hice una consulta real) y **no probada**. Una cosa no implica la
> otra.
> **Verificación:** documentación oficial **15/11/2026**; pruebas del equipo **14/11/2026**;
> pruebas de solo lectura de CMR/ASF **15/11/2026**.

## 1. ASF Search API

| Campo | Contenido |
|---|---|
| Nombre | Alaska Satellite Facility Search API |
| Organización | NASA / ASF DAAC |
| URL oficial | <https://docs.asf.alaska.edu/api/basics/> |
| Endpoint | `https://api.daac.asf.alaska.edu/services/search/param` |
| Parámetros relevantes | `dataset`, `processingLevel`, `intersectsWith`, `start`, `end`, `relativeOrbit`, `flightDirection`, `mainBandPolarization`, `maxResults`, `output` |
| Variables | Metadatos de escenas, URLs de descarga y browse. |
| Unidades | N/A (metadatos). |
| Resolución temporal | Depende del dataset; se filtra por fecha de adquisición. |
| Resolución espacial | Depende del producto; el buscador no remuestrea. |
| Latencia | Catálogo casi en tiempo real; la descarga depende del producto. |
| Cobertura | Global para NISAR L-band. |
| Formato | `json`, `geojson`, `csv`, `kml`, `metalink`, `count`, `download`. |
| Autenticación | Búsqueda sin login; **descarga con Earthdata Login**. |
| Restricciones | Límites de tasa no publicados en la página consultada; usar `maxResults` y caché. |
| Aplicaciones | Descubrir productos NISAR, Sentinel-1, OPERA; descargar HDF5. |
| Limitaciones | No es el catálogo que usa la app; la app consulta CMR directamente. |
| Estado en el proyecto | **Documentada y probada** (conteo y búsqueda puntual, 15/11/2026). **No implementada**. |
| Verificación | 15/11/2026: `output=count` devolvió 208.691 GCOV; una búsqueda puntual devolvió un gránulo con `browse` y metadatos. Cifra de humo, no permanente. |

## 2. NASA CMR (Common Metadata Repository)

| Campo | Contenido |
|---|---|
| Nombre | NASA Common Metadata Repository |
| Organización | NASA EOSDIS |
| URL oficial | <https://cmr.earthdata.nasa.gov/search/> |
| Endpoint | `https://cmr.earthdata.nasa.gov/search/granules.json` y `.../collections.json` |
| Parámetros usados | `short_name`, `point`, `bounding_box`, `page_size`, `sort_key`, `granule_ur` |
| Variables | Título del gránulo, fecha de adquisición, enlaces, tamaño, colección. |
| Unidades | N/A (metadatos). |
| Resolución temporal | Fecha de adquisición del gránulo. |
| Resolución espacial | Punto o bbox de consulta. |
| Latencia | Metadatos actualizados por el productor; no es latencia de observación. |
| Cobertura | Global. |
| Formato | JSON. |
| Autenticación | Ninguna para búsqueda. |
| Restricciones | Sin cuota publicada; la app limita a 2 MiB y 6 s por colección. |
| Aplicaciones | Catálogo de pasadas NISAR; procedencia; enlaces a HDF5 y browse. |
| Limitaciones | No contiene los datos científicos; no garantiza que el browse exista. |
| Estado en el proyecto | **Implementada** en [`/api/nisar/search`](../../../web/app/api/nisar/search/route.ts) y [`build-nisar.mjs`](../../../web/scripts/build-nisar.mjs). **Probada** 15/11/2026. |
| Verificación | 15/11/2026: colecciones `NISAR_L2_GCOV_V1` y `NISAR_L2_GCOV_PROVISIONAL_V1` respondieron; un gránulo validado real respondió con `time_start` y enlaces. |

## 3. NASA Earthdata Search y Earthdata Login

| Campo | Contenido |
|---|---|
| Nombre | Earthdata Search / Earthdata Login (URS) |
| Organización | NASA EOSDIS |
| URL oficial | <https://search.earthdata.nasa.gov/search> · <https://urs.earthdata.nasa.gov/> |
| Endpoint | Interfaz web; la descarga usa el login y redirecciones firmadas. |
| Parámetros | Búsqueda por colección, AOI y fecha; descarga por URL. |
| Variables | Cualquier producto Earthdata, incluido NISAR HDF5. |
| Unidades | N/A. |
| Resolución temporal | Según producto. |
| Resolución espacial | Según producto. |
| Latencia | Según producto. |
| Cobertura | Global. |
| Formato | HDF5, NetCDF, GeoTIFF, etc. |
| Autenticación | **Obligatoria** para descargar. |
| Restricciones | Cuenta gratuita; aceptar la licencia de ASF; no compartir credenciales. |
| Aplicaciones | Descargar GCOV/GUNW/SME2 reales. |
| Limitaciones | No es una API de datos instantánea; el login no se automatiza en la app. |
| Estado en el proyecto | **No implementada**. La app solo usa vistas previas públicas. |
| Verificación | Documentación oficial; no se inició sesión ni se descargó HDF5. |

## 4. NASA FIRMS

| Campo | Contenido |
|---|---|
| Nombre | Fire Information for Resource Management System |
| Organización | NASA LANCE |
| URL oficial | <https://firms.modaps.eosdis.nasa.gov/api/area/> |
| Endpoint | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{KEY}/{SOURCE}/{WEST,SOUTH,EAST,NORTH}/{DAYS}/{DATE}` |
| Parámetros | `KEY`, `SOURCE` (VIIRS S-NPP/NOAA-20/NOAA-21, MODIS), bbox, días 1–5, fecha. |
| Variables | `latitude`, `longitude`, `acq_date`, `acq_time`, `brightness`/`bright_ti4`, `bright_ti5`, `frp`, `confidence`, `satellite`, `instrument`, `scan`, `track`, `daynight`. |
| Unidades | Grados; fecha UTC; brillo en K; `frp` en MW. |
| Resolución temporal | NRT; detecciones por pasada. |
| Resolución espacial | VIIRS ~375 m; MODIS ~1 km (el producto puede agregar). |
| Latencia | Horas; URT <60 s en EE.UU./Canadá según la verificación del equipo. |
| Cobertura | Global (LANDSAT solo EE.UU./Canadá). |
| Formato | CSV (también WMS/GetMap). |
| Autenticación | `FIRMS_MAP_KEY` gratuita. |
| Restricciones | 5.000 transacciones/10 min; la API solo consulta 1–5 días. |
| Aplicaciones | Focos de calor; contexto de incendios. |
| Limitaciones | Un foco no es un perímetro ni un incendio confirmado; falsos positivos por industria, volcanes y quemas. |
| Estado en el proyecto | **Implementada pero oculta** (`SHOW_FIRES=false`). La clave es opcional; sin ella falla de forma suave. **No probada con clave en esta sesión**. |
| Verificación | 14/11/2026: sin clave devuelve 400; WMS con clave devolvió PNG. No se repitió. |

## 5. NASA GIBS

| Campo | Contenido |
|---|---|
| Nombre | Global Imagery Browse Services |
| Organización | NASA EOSDIS |
| URL oficial | <https://nasa-gibs.github.io/gibs-api-docs/> |
| Endpoint | WMTS: `https://gibs.earthdata.nasa.gov/wmts/{epsg3857 o epsg4326}/best/{layer}/default/{date}/{tilematrix}/{z}/{y}/{x}.{ext}` |
| Parámetros | Capa, fecha/hora, `TileMatrixSet`, `z`, `y`, `x`, formato. |
| Variables | Reflectancia, temperatura, IMERG, SMAP, NDVI, anomalías térmicas (MVT). |
| Unidades | Depende de la capa: PNG coloreado o propiedades MVT. |
| Resolución temporal | 30 min (IMERG), diaria (fuegos), 8 días (NDVI), anual (land cover). |
| Resolución espacial | 1 km, 500 m o según capa. |
| Latencia | Casi NRT para muchas capas; históricos por fecha. |
| Cobertura | Global. |
| Formato | PNG, JPEG, MVT. |
| Autenticación | Ninguna. |
| Restricciones | CDN; no hay cuota pública documentada; no leer valores numéricos de un PNG coloreado. |
| Aplicaciones | Memoria histórica de focos; contexto visual; IMERG. |
| Limitaciones | El MVT de anomalías está en **EPSG:4326**, no en mercator; MapLibre no lo pinta directo. Un tile vacío no prueba ausencia de focos. |
| Estado en el proyecto | **Implementada** en [`web/lib/sources/gibs.ts`](../../../web/lib/sources/gibs.ts). **Probada** 14/11/2026. |
| Verificación | 14/11/2026: tiles MODIS/VIIRS de 2005, 2018, 2019 y 2026 con datos; IMERG/true color/NDVI/SMAP/GEDI 200. No se repitió. |

## 6. NASA POWER

| Campo | Contenido |
|---|---|
| Nombre | Prediction Of Worldwide Energy Resources |
| Organización | NASA Langley Research Center |
| URL oficial | <https://power.larc.nasa.gov/docs/services/api/> |
| Endpoint | `https://power.larc.nasa.gov/api/temporal/{daily, monthly, climatology u hourly}/point` |
| Parámetros | `parameters`, `community`, `longitude`, `latitude`, `start`, `end`, `format`. |
| Variables | `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `WS2M`, `RH2M`, `GWETTOP`, `GWETROOT`, `EVPTRNS`. |
| Unidades | Según variable: °C, mm/día, m/s, %, fracción o mm/día. La app usa mm, °C, m/s y %. |
| Resolución temporal | Diaria, mensual, climatología, horaria. |
| Resolución espacial | Reanálisis MERRA-2 ~0,5°. |
| Latencia | ~2–3 días; el último dato suele venir `-999`. |
| Cobertura | Global terrestre. |
| Formato | JSON (también CSV/NetCDF). |
| Autenticación | Ninguna. |
| Restricciones | Sin cuota publicada; pedir 40 años por request es lento. |
| Aplicaciones | Climatología, anomalías, percentiles, lluvia, viento, humedad. |
| Limitaciones | No es pronóstico; no sirve para extremos locales; `-999` es relleno, no dato. |
| Estado en el proyecto | **Implementada** en [`web/lib/sources/power.ts`](../../../web/lib/sources/power.ts). **Probada** 14/11/2026. |
| Verificación | 14/11/2026: daily 317 días, último válido 2026-11-11; climatology 2001–2025. No se repitió. |

## 7. NASA GPM / IMERG

| Campo | Contenido |
|---|---|
| Nombre | Global Precipitation Measurement / IMERG |
| Organización | NASA GPM / PPS |
| URL oficial | <https://gpm.nasa.gov/data/imerg> |
| Endpoint | PPS/GES DISC, GIBS (`IMERG_Precipitation_Rate_30min`), Giovanni. |
| Parámetros | Fecha/hora, variable, recorte, formato. |
| Variables | Tasa de precipitación y acumulados; Early/Late/Final. |
| Unidades | mm/h (tasa) y mm (acumulado). |
| Resolución temporal | 30 minutos (también diaria, mensual). |
| Resolución espacial | ~0,1°. |
| Latencia | Early ~4 h; Late ~12–14 h; Final ~3,5 meses. |
| Cobertura | Global; IR 60°N–60°S, microondas más amplio. |
| Formato | HDF, GeoTIFF, NetCDF. |
| Autenticación | Earthdata para datos crudos; GIBS sin clave para visual. |
| Restricciones | La precipitación es una **estimación**, no un pluviómetro. |
| Aplicaciones | Acumulados, contexto de inundación/deslizamiento, comparación con radar. |
| Limitaciones | Early llega ~4 h tarde: no sirve para flash floods; una lluvia intensa no confirma inundación. |
| Estado en el proyecto | **No implementada directamente**. La capa GIBS está documentada, pero la app no la usa. |
| Verificación | Documentación oficial 15/11/2026; prueba GIBS 14/11/2026. |

## 8. NASA SMAP

| Campo | Contenido |
|---|---|
| Nombre | Soil Moisture Active Passive |
| Organización | NASA / JPL |
| URL oficial | <https://smap.jpl.nasa.gov/> |
| Endpoint | NSIDC DAAC, GES DISC, capas GIBS. |
| Parámetros | Producto, fecha, recorte, variable. |
| Variables | Humedad del suelo superficial y de raíz; productos asimilados. |
| Unidades | m³/m³ (fracción volumétrica), según producto. |
| Resolución temporal | Diaria / 3 días según producto. |
| Resolución espacial | Decenas de km en pasivo; productos L4 más finos (verificar por producto). |
| Latencia | Días. |
| Cobertura | Global terrestre. |
| Formato | HDF5, GeoTIFF (GIBS). |
| Autenticación | Earthdata para datos; GIBS sin clave. |
| Restricciones | La resolución no es de campo; el hielo/nieve y la vegetación densa complican la retrievability. |
| Aplicaciones | Sequía, humedad antecedente, contexto de incendio/inundación. |
| Limitaciones | No es una medición local; no reemplaza sensores de suelo. |
| Estado en el proyecto | **No implementada**. |
| Verificación | Documentación oficial; no se descargaron datos. |

## 9. NASA LHASA

| Campo | Contenido |
|---|---|
| Nombre | Landslide Hazard Assessment for Situational Awareness |
| Organización | NASA GSFC / GPM |
| URL oficial | <https://gpm.nasa.gov/landslides/> |
| Endpoint | `https://portal.nccs.nasa.gov/datashare/landslides/nrt/hazard/tif/` (GeoTIFF diario). |
| Parámetros | Fecha del archivo. |
| Variables | Susceptibilidad/amenaza estimada de deslizamiento. |
| Unidades | Probabilidad/nivel según producto. |
| Resolución temporal | Diaria/NRT. |
| Resolución espacial | ~1 km. |
| Latencia | ~5 h. |
| Cobertura | 60°N–60°S. |
| Formato | GeoTIFF, NetCDF. |
| Autenticación | Ninguna para NRT. |
| Restricciones | Archivos globales de ~146 MB/día; no es viable en runtime. |
| Aplicaciones | Contexto de deslizamiento; precomputar recortes regionales. |
| Limitaciones | Es un modelo, no una alerta oficial; no confirma un deslizamiento. |
| Estado en el proyecto | **No implementada**. |
| Verificación | 14/11/2026: GeoTIFF 145,9 MB; visor `maps.nccs` no respondió. No se repitió. |

## 10. NASA GFWED

| Campo | Contenido |
|---|---|
| Nombre | Global Fire Weather Database |
| Organización | NASA GISS |
| URL oficial | <https://data.giss.nasa.gov/impacts/gfwed/> |
| Endpoint | `https://portal.nccs.nasa.gov/datashare/GlobalFWI/v2.0/fwiCalcs.GEOS-5/Default/GEOS-5/{YYYY}/FWI.GEOS-5.Daily.Default.{YYYYMMDD}.nc` |
| Parámetros | Fecha y modelo (GEOS-5 o MERRA-2). |
| Variables | `FFMC`, `DMC`, `DC`, `ISI`, `BUI`, `FWI` (verificar nombres exactos en el NetCDF). |
| Unidades | Índices adimensionales. |
| Resolución temporal | Diaria. |
| Resolución espacial | GEOS-5 ~0,25°; MERRA-2 ~0,5°. |
| Latencia | GEOS-5 ~12 h; MERRA-2 ~2 meses. |
| Cobertura | Global. |
| Formato | NetCDF. |
| Autenticación | Ninguna. |
| Restricciones | ~17 MB por archivo diario; no cargar en el cliente. |
| Aplicaciones | Componente de clima de fuego; no detección de incendios. |
| Limitaciones | **No son incendios confirmados**; son condiciones meteorológicas de peligro. |
| Estado en el proyecto | **No implementada**. |
| Verificación | 14/11/2026: archivo 2026-11-12, 17,2 MB. No se repitió. |

## 11. NASA EONET

| Campo | Contenido |
|---|---|
| Nombre | Earth Observatory Natural Event Tracker |
| Organización | NASA EOSDIS |
| URL oficial | <https://eonet.gsfc.nasa.gov/docs/v3> |
| Endpoint | `https://eonet.gsfc.nasa.gov/api/v3/events` |
| Parámetros | `status` (open, closed o all), `limit`, `days`, `start`, `end`, `bbox`, `category`, `source`. |
| Variables | Título, categorías, fuentes, geometría y fechas. |
| Unidades | Grados (lon/lat). |
| Resolución temporal | Según evento; curado. |
| Resolución espacial | Punto o polígono del evento. |
| Latencia | Curado; respuesta típica 3–7 s. |
| Cobertura | Global. |
| Formato | JSON. |
| Autenticación | Ninguna. |
| Restricciones | Sin cuota publicada; cachear. |
| Aplicaciones | Eventos abiertos e historial de la región. |
| Limitaciones | No es un sensor en tiempo real; el `bbox` tiene orden no estándar (`min lon, max lat, max lon, min lat`). |
| Estado en el proyecto | **Implementada** en [`web/lib/sources/eonet.ts`](../../../web/lib/sources/eonet.ts). **Probada** 14/11/2026. |
| Verificación | 14/11/2026: 200, 13 categorías, 33 fuentes. No se repitió. |

## 12. NASA Worldview

| Campo | Contenido |
|---|---|
| Nombre | NASA Worldview |
| Organización | NASA EOSDIS |
| URL oficial | <https://worldview.earthdata.nasa.gov/> |
| Endpoint | Aplicación web; capas WMTS de GIBS. |
| Parámetros | Fecha, capa, AOI. |
| Variables | Imágenes ópticas y de temperatura. |
| Unidades | N/A (visual). |
| Resolución temporal | Según capa. |
| Resolución espacial | Según capa. |
| Latencia | Según capa. |
| Cobertura | Global. |
| Formato | PNG/JPEG (visual). |
| Autenticación | Ninguna para visualizar. |
| Restricciones | Es una herramienta visual; no es una API de medición. |
| Aplicaciones | Contexto óptico; enlaces para el usuario. |
| Limitaciones | Nubes; no mide área quemada. |
| Estado en el proyecto | **Documentada y enlazada**; no se usa como API de datos. |
| Verificación | Documentación 15/11/2026. |

## 13. NASA Worldview Snapshots

| Campo | Contenido |
|---|---|
| Nombre | Worldview Snapshots API |
| Organización | NASA EOSDIS |
| URL oficial | <https://wvs.earthdata.nasa.gov/api/v1/snapshot> |
| Endpoint | `GET https://wvs.earthdata.nasa.gov/api/v1/snapshot` |
| Parámetros | `REQUEST=GetSnapshot`, `LAYERS`, `CRS=EPSG:4326`, `BBOX`, `WIDTH`, `HEIGHT`, `TIME`, `FORMAT`. |
| Variables | Imagen compuesta de capas (MODIS true color, IMERG, etc.). |
| Unidades | N/A (imagen). |
| Resolución temporal | Según capa; fecha/hora solicitada. |
| Resolución espacial | Según capa y tamaño de imagen. |
| Latencia | Según capa. |
| Cobertura | Global. |
| Formato | JPEG o PNG. |
| Autenticación | Ninguna. |
| Restricciones | `BBOX` va en orden **sur, oeste, norte, este**; cachear por bbox/fecha/capas. |
| Aplicaciones | Foto óptica “antes/después” en el estudio. |
| Limitaciones | No es una medición; si hay nubes, no se ve el suelo. |
| Estado en el proyecto | **Implementada** en [`SurfaceStudy.tsx`](../../../web/components/SurfaceStudy.tsx) como imagen directa. |
| Verificación | 14/11/2026: JPEG 512×512; no se repitió. |

## 14. Resumen de estado

| Servicio | Documentada | Implementada | Probada | Nota |
|---|---|---|---|---|
| ASF Search | Sí | No | Sí (15/11) | Búsqueda; descarga no probada. |
| CMR | Sí | Sí | Sí (15/11) | Catálogo NISAR. |
| Earthdata Login | Sí | No | No | Requiere cuenta. |
| FIRMS | Sí | Sí, oculta | Parcial (14/11) | Sin clave no responde. |
| GIBS | Sí | Sí | Sí (14/11) | Fuegos e IMERG visual. |
| POWER | Sí | Sí | Sí (14/11) | Climatología. |
| IMERG | Sí | No | Indirecta (GIBS) | No hay descarga. |
| SMAP | Sí | No | No | Sin datos. |
| LHASA | Sí | No | No (solo metadatos) | 146 MB/día. |
| GFWED | Sí | No | No (solo metadatos) | NetCDF diario. |
| EONET | Sí | Sí | Sí (14/11) | Eventos e historial. |
| Worldview | Sí | Enlace | No | Contexto visual. |
| Snapshots | Sí | Sí | Sí (14/11) | Imagen óptica. |

## Referencias

- ASF Search API: <https://docs.asf.alaska.edu/api/basics/>
- ASF Search keywords: <https://docs.asf.alaska.edu/api/keywords/>
- CMR: <https://cmr.earthdata.nasa.gov/search/>
- Earthdata Search: <https://search.earthdata.nasa.gov/search>
- FIRMS: <https://firms.modaps.eosdis.nasa.gov/api/area/>
- GIBS: <https://nasa-gibs.github.io/gibs-api-docs/>
- POWER: <https://power.larc.nasa.gov/docs/services/api/>
- GPM/IMERG: <https://gpm.nasa.gov/data/imerg>
- SMAP: <https://smap.jpl.nasa.gov/>
- LHASA: <https://gpm.nasa.gov/landslides/>
- GFWED: <https://data.giss.nasa.gov/impacts/gfwed/>
- EONET: <https://eonet.gsfc.nasa.gov/docs/v3>
- Worldview: <https://worldview.earthdata.nasa.gov/>
- Snapshots: <https://wvs.earthdata.nasa.gov/api/v1/snapshot>
