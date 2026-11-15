# Fuentes externas (no NASA)

> **Regla:** no todas las fuentes tienen el mismo carácter. Una agencia oficial no es lo mismo
> que un agregador, un modelo o un servicio comunitario. Se dice cuál es cuál.
> **Verificación:** pruebas del equipo **14/11/2026** y documentación oficial consultada
> **15/11/2026**. No se repitieron todas las pruebas.

## 1. Sismicidad

### USGS FDSN

| Campo | Contenido |
|---|---|
| Tipo | Agencia oficial (EE.UU., red global). |
| URL | <https://earthquake.usgs.gov/fdsnws/event/1/> |
| Endpoint usado | `https://earthquake.usgs.gov/fdsnws/event/1/query` |
| Parámetros | `format=geojson`, `starttime`, `minmagnitude`, `orderby=time`, `limit`, bbox (`minlatitude`, `maxlatitude`, `minlongitude`, `maxlongitude`). |
| Variables | Magnitud, profundidad, lugar, hora, PAGER, MMI, URL. |
| Unidades | Magnitud adimensional; profundidad km; hora UTC. |
| Cobertura | Global. |
| Latencia | Minutos. |
| Formato | GeoJSON. |
| Auth | Ninguna. |
| Estado | **Implementada** en [`seismic.ts`](../../../web/lib/sources/seismic.ts). |
| Límites del proyecto | 30 días, M≥2,5, `limit=200`, radio 600 km, caché 2 min, timeout 5 s, presupuesto 5,5 s. |
| Limitación | Catálogo global; puede no incluir réplicas locales pequeñas. |

### OVSICORI-UNA

| Campo | Contenido |
|---|---|
| Tipo | Agencia oficial de Costa Rica (red local). |
| URL | <https://www.ovsicori.una.ac.cr/> |
| Endpoint usado | `https://www.ovsicori.una.ac.cr/sistemas/sismolive-staging/data/latest.geojson` |
| Variables | Sismos locales, magnitud, profundidad, hora, revisado/preliminar. |
| Cobertura | Costa Rica y alrededores. |
| Latencia | Minutos. |
| Formato | GeoJSON. |
| Auth | Ninguna; **sin CORS**, solo servidor. |
| Estado | **Implementada**. |
| Límites del proyecto | Caché 2 min, timeout 5 s; `generatedAt` >12 h se marca desactualizado. |
| Limitación | Solo regenera el archivo cuando hay un sismo nuevo; horas sin cambios son normales. |

### RSN (UCR-ICE)

| Campo | Contenido |
|---|---|
| Tipo | Agencia oficial de Costa Rica (red local). |
| URL | <https://rsn.ucr.ac.cr/> |
| Endpoint usado | `https://rsn.ucr.ac.cr/actividad-sismica/ultimos-sismos?format=feed&type=rss` |
| Variables | Sismos sentidos, lugar, hora, “sentido en”. |
| Cobertura | Costa Rica. |
| Latencia | Minutos. |
| Formato | RSS/XML. |
| Auth | Ninguna. |
| Estado | **Implementada**. |
| Límites del proyecto | Caché 2 min, timeout 5 s; prioridad en la deduplicación. |
| Limitación | Es un feed de “sentidos”, no un catálogo completo. |

## 2. Tsunamis

### NOAA PTWC / NTWC

| Campo | Contenido |
|---|---|
| Tipo | Agencia oficial (EE.UU./internacional). |
| URL | <https://www.tsunami.gov/> |
| Endpoints usados | `https://www.tsunami.gov/events/xml/PHEBAtom.xml` (PTWC) y `.../PAAQAtom.xml` (NTWC). El centro y la cuenca no son equivalentes. |
| Variables | Nivel (vigilancia, aviso, advertencia), título, fecha, enlace. |
| Cobertura | Pacífico y Caribe/Atlántico. |
| Latencia | Minutos. |
| Formato | Atom/XML. |
| Auth | Ninguna. |
| Estado | **Implementada** en [`feeds.ts`](../../../web/lib/sources/feeds.ts). |
| Límites | Caché 2 min, timeout 12 s; un boletín informativo no dibuja área. |
| Limitación | No es el aviso oficial de Costa Rica; la distancia al epicentro no identifica las costas amenazadas. Ver [`../boletines-tsunami.md`](../boletines-tsunami.md). |

### SINAMOT (Costa Rica)

| Campo | Contenido |
|---|---|
| Tipo | Sistema nacional de monitoreo de tsunamis (UNA). |
| URL | <https://www.sinamot.una.ac.cr/> |
| Estado | **No integrada**; solo referencia. |
| Consulta humana | [Reportes recientes](https://unacostasegura.una.ac.cr/webServices/) y [mapas oficiales](https://www.sinamot.una.ac.cr/index.php/mapas-de-evacuacion). |
| Verificación | Consultados el 15/11/2026: historial HTML y un boletín individual. No se verificó una API pública documentada. |
| Limitación | No se debe presentar como fuente consultada por la app si no hay integración. El sitio solicita créditos al reproducir reportes. |

## 3. Ciclones

### NOAA NHC

| Campo | Contenido |
|---|---|
| Tipo | Agencia oficial (EE.UU.). |
| URL | <https://www.nhc.noaa.gov/> |
| Endpoint usado | `https://www.nhc.noaa.gov/CurrentStorms.json` |
| Variables | Tormentas activas, clasificación, posición, viento, presión, trayectoria. |
| Cobertura | Atlántico, Caribe, Pacífico oriental y central. |
| Latencia | Cada aviso. |
| Formato | JSON. |
| Auth | Ninguna. |
| Estado | **Implementada**. |
| Límites | Caché 10 min, timeout 12 s; solo tormentas activas. |
| Limitación | Sin tormenta activa, un demo de ciclón sería un **hindcast**, no un pronóstico. |

## 4. Desastres multi-riesgo

### GDACS

| Campo | Contenido |
|---|---|
| Tipo | Agregador oficial (Comisión Europea/ONU), no NASA. |
| URL | <https://www.gdacs.org/> |
| Endpoint usado | `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH` |
| Parámetros | `eventlist=WF,TC,FL,VO,DR,EQ`, `fromDate`, `toDate`. |
| Variables | Tipo, nivel (verde/naranja/rojo), país, fechas, severidad, enlace. |
| Cobertura | Global. |
| Latencia | Minutos. |
| Formato | JSON. |
| Auth | Ninguna. |
| Estado | **Implementada** en [`gdacs.ts`](../../../web/lib/sources/gdacs.ts). |
| Límites | 45 días de lookback, 600 km, caché 30 min, timeout 12 s; sequías por país. |
| Limitación | Es un agregador; el reporte oficial está en la agencia de origen. |

## 5. Meteorología

### Open-Meteo

| Campo | Contenido |
|---|---|
| Tipo | Modelo/proveedor externo, no agencia oficial. |
| URL | <https://open-meteo.com/> |
| Endpoint usado | `https://api.open-meteo.com/v1/forecast` |
| Parámetros | `latitude`, `longitude`, `hourly=precipitation`, `forecast_days=2`, `timezone=UTC`. |
| Variables | Precipitación horaria pronosticada. |
| Unidades | mm. |
| Resolución | Modelo de alta resolución; según proveedor. |
| Latencia | Horas. |
| Formato | JSON. |
| Auth | Ninguna para uso no comercial. |
| Estado | **Implementada** en [`feeds.ts`](../../../web/lib/sources/feeds.ts). |
| Límites | Caché 30 min, timeout 12 s; alerta si ≥50 mm/24 h, naranja si ≥100 mm. |
| Limitación | **No es un aviso del IMN**; es un modelo. No confundir pronóstico con observación. |

### IMN (Costa Rica)

| Campo | Contenido |
|---|---|
| Tipo | Agencia oficial de Costa Rica. |
| URL | <https://www.imn.ac.cr/> |
| Estado | **No integrada**. Se enlaza, no se consulta. |
| Limitación | El sitio usa protección anti-bot; no se hace scraping. |

## 6. Inundaciones

### Copernicus GloFAS

| Campo | Contenido |
|---|---|
| Tipo | Modelo/proveedor oficial europeo (Copernicus). |
| URL | <https://global-flood.emergency.copernicus.eu/> |
| Estado | **No integrada**. |
| Verificación | URL proporcionada en el encargo; no se probó en esta sesión. |
| Limitación | Es un modelo hidrológico global; no confirma una inundación local. |

### Google Flood Hub

| Campo | Contenido |
|---|---|
| Tipo | Modelo/proveedor comercial. |
| URL | <https://sites.research.google/floods/> |
| Estado | **No integrada**. |
| Verificación | URL proporcionada en el encargo; no se probó en esta sesión. |
| Limitación | No es una agencia oficial; no usar como alerta oficial. |

## 7. Volcanes

### Smithsonian Global Volcanism Program

| Campo | Contenido |
|---|---|
| Tipo | Institución científica (Smithsonian). |
| URL | <https://volcano.si.edu/> |
| Endpoint usado | `https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows` (WFS). |
| Variables | Volcanes holocenos, ubicación, nombre, elevación. |
| Cobertura | Global. |
| Formato | GeoJSON/Shapefile vía WFS; snapshot local. |
| Auth | Ninguna. |
| Estado | **Parcial**: snapshot en [`data/volcanoes.json`](../../../web/data/volcanoes.json), no monitoreo en vivo. |
| Limitación | Responde 403 a bots; solo se enlaza. Un volcán en el catálogo no está en erupción. |

## 8. Cartografía y exposición

### OpenStreetMap / Overpass

| Campo | Contenido |
|---|---|
| Tipo | Comunidad (ODbL). |
| URL | <https://www.openstreetmap.org/> |
| Endpoints | `https://overpass-api.de/api/interpreter`; mirror `https://overpass.kumi.systems/api/interpreter`. |
| Variables | Caminos, áreas protegidas, edificios (no todos). |
| Cobertura | Global; calidad variable. |
| Formato | JSON de Overpass; se convierte a GeoJSON. |
| Auth | Ninguna. |
| Estado | **Implementada** en [`overpass.ts`](../../../web/lib/sources/overpass.ts), con snapshot local para la región demo. |
| Límites | Caché 24 h, timeout 7 s por endpoint, dos endpoints en serie; simplifica si >80.000 coordenadas. |
| Limitación | No es una fuente oficial ni un registro de exposición completo. |

### Photon

| Campo | Contenido |
|---|---|
| Tipo | Servicio comunitario de geocodificación (Komoot). |
| URL | <https://photon.komoot.io/api/> |
| Estado | **No integrada**. |
| Verificación | 14/11/2026: 200. |
| Limitación | Sin SLA; no usar para direcciones críticas sin caché. |

### OSRM

| Campo | Contenido |
|---|---|
| Tipo | Servicio de ruteo comunitario. |
| URL | <https://router.project-osrm.org/> |
| Estado | **No integrada**. |
| Verificación | 14/11/2026: 200, 6,5 km en ~1,1 s. |
| Limitación | Servidor de demo sin SLA. |

### Natural Earth

| Campo | Contenido |
|---|---|
| Tipo | Datos cartográficos de dominio público. |
| URL | <https://www.naturalearthdata.com/> |
| Variables | Fronteras 110m. |
| Estado | **Snapshot** en [`data/borders.json`](../../../web/data/borders.json). |
| Limitación | Escala 1:110m; no sirve para límites locales. |

## 9. Resumen de carácter

| Fuente | Carácter | ¿Oficial? | Estado |
|---|---|---|---|
| USGS | Agencia | Sí | Integrada |
| OVSICORI | Agencia | Sí (CR) | Integrada |
| RSN | Agencia | Sí (CR) | Integrada |
| PTWC/NTWC | Agencia | Sí | Integrada |
| NHC | Agencia | Sí | Integrada |
| GDACS | Agregador | Sí (multiagencia) | Integrada |
| Open-Meteo | Modelo | No | Integrada |
| IMN | Agencia | Sí (CR) | Enlace |
| GloFAS | Modelo | Sí (Copernicus) | No integrada |
| Flood Hub | Modelo comercial | No | No integrada |
| GVP | Institución científica | Sí | Snapshot |
| OSM | Comunidad | No | Integrada |
| Photon/OSRM | Comunidad | No | No integradas |
| Natural Earth | Cartografía | No | Snapshot |

## Referencias

- USGS FDSN: <https://earthquake.usgs.gov/fdsnws/event/1/>
- OVSICORI: <https://www.ovsicori.una.ac.cr/>
- RSN: <https://rsn.ucr.ac.cr/>
- NOAA Tsunami: <https://www.tsunami.gov/>
- SINAMOT: <https://www.sinamot.una.ac.cr/>
- NHC: <https://www.nhc.noaa.gov/>
- GDACS: <https://www.gdacs.org/>
- Open-Meteo: <https://open-meteo.com/>
- IMN: <https://www.imn.ac.cr/>
- GloFAS: <https://global-flood.emergency.copernicus.eu/>
- Flood Hub: <https://sites.research.google/floods/>
- GVP: <https://volcano.si.edu/>
- OSM: <https://www.openstreetmap.org/>
- Photon: <https://photon.komoot.io/api/>
- OSRM: <https://router.project-osrm.org/>
- Natural Earth: <https://www.naturalearthdata.com/>
