# APIs y recursos de terceros

> **Estado:** referencia local · verificado contra el código de `web/` el **15/11/2026**.
> Sirve para créditos, atribución y para pedir permisos. Si un endpoint cambia, gana el código:
> `web/app/api/health` lista las fuentes vivas y `docs/tecnico/fuentes.md` dice qué usa la app hoy.
> **Regla del proyecto:** sin dato accesible no hay feature; la app informa, no reemplaza alertas
> oficiales; NASA no respalda este proyecto.

## 1. NASA

| Recurso | Endpoint | Clave | Uso en la app |
|---|---|---|---|
| **EONET v3** | `https://eonet.gsfc.nasa.gov/api/v3/events` | no | Eventos naturales abiertos y cerrados (historial) |
| **GIBS** (WMTS, MVT) | `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Combined_Thermal_Anomalies_All/default/{date}/1km/{z}/{y}/{x}.mvt` | no | Focos de calor del día y memoria histórica; se decodifica en el servidor |
| **POWER** | `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX,RH2M,WS2M&community=AG` | no | Climatología 1981+ para el score de condiciones de incendio |
| **Worldview Snapshots** | `https://wvs.earthdata.nasa.gov/api/v1/snapshot` | no | Imagen MODIS del día elegido en el estudio antes/después |
| **CMR** | `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=NISAR_L2_GCOV_V1` | no | Catálogo de pasadas NISAR por punto |
| **ASF DAAC** (browse) | `https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/{colección}/{granule}/{granule}_LATLON.png` | no (vista previa) | PNG de 8 bits del radar; el HDF5 sí pide Earthdata Login |
| **FIRMS** | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{KEY}/{sensor}/{bbox}/{días}` | `FIRMS_MAP_KEY` (gratis) | Focos VIIRS; **oculto** en la UI por ahora |

- Datos abiertos de NASA. La atribución es obligatoria en la práctica y NASA **no** respalda el
  proyecto: en la app se lee «NASA no respalda este proyecto».
- Las cifras de radar son de **vistas previas**, no de γ0 calibrado; no confirman daño.
- **FIRMS**: la clave viaja en la URL, así que solo se usa desde el servidor.

## 2. Oficiales de EE. UU. y otros países

| Recurso | Endpoint | Clave | Uso |
|---|---|---|---|
| **USGS FDSN** | `https://earthquake.usgs.gov/fdsnws/event/1/query` | no | Sismos regionales con PAGER/MMI |
| **NOAA PTWC** (Atom) | `https://www.tsunami.gov/events/xml/PHEBAtom.xml` | no | Boletines de tsunami del Pacífico |
| **NOAA NTWC** (Atom) | `https://www.tsunami.gov/events/xml/PAAQAtom.xml` | no | Boletines de tsunami de Alaska |
| **NOAA CAP-TSU** | `…/events/{PHEB\|PAAQ}/…/{PHEB\|PAAQ}CAP.xml` | no | Vigencia, actualización y cancelación del boletín |
| **NOAA NHC** | `https://www.nhc.noaa.gov/CurrentStorms.json` | no | Ciclones activos |
| **GDACS** (JRC/EC) | `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH` | no | Alertas con nivel verde/naranja/rojo |

- USGS y NOAA son dominio público de EE. UU.; GDACS es del Centro Común de Investigación de la
  Comisión Europea (atribuir «GDACS · European Commission»).
- `PHEB` = PTWC (Hawái) y `PAAQ` = NTWC (Alaska): **no** significan Pacífico y Caribe.
- Un boletín regional **no** determina qué costas de Costa Rica están amenazadas. La app no dibuja
  área para tsunami real.

## 3. Costa Rica

| Recurso | Dónde | Clave | Uso |
|---|---|---|---|
| **OVSICORI-UNA** | `https://www.ovsicori.una.ac.cr/sistemas/sismolive-staging/data/latest.geojson` | no | Sismos locales; `manual` = revisado |
| **RSN UCR-ICE** | `https://rsn.ucr.ac.cr/actividad-sismica/ultimos-sismos?format=feed&type=rss` | no | Sismos sentidos, con «sentido en» |
| **SINAMOT-UNA** | `https://unacostasegura.una.ac.cr/webServices/` | no | Enlace al historial de boletines; **no automatizado** |
| **CNE** | `https://www.cne.go.cr/` | no | Autoridad nacional; enlace de la orientación |

- OVSICORI y RSN **no declaran licencia de reutilización**: se atribuyen y se consultan solo desde
  el servidor (OVSICORI no tiene CORS).
- **SINAMOT** publica boletines de amenaza para Costa Rica y mapas de evacuación, pero es HTML para
  personas. Antes de consumirlo automáticamente hay que acordar acceso, formato, atribución,
  vigencia y mantenimiento: **`sinamot@una.ac.cr`**. Mientras tanto, solo se enlaza.
- La app **no** afirma que un boletín regional afecte una playa concreta.

## 4. Mapas base y geometrías

| Recurso | Endpoint / archivo | Condición |
|---|---|---|
| **OpenStreetMap · Overpass** | `https://overpass-api.de/api/interpreter` (respaldo: `overpass.kumi.systems`) | Datos © OSM, **ODbL**; atribución obligatoria |
| **Carto Positron/Voyager** | `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json` | © CARTO + © OSM; revisar términos de uso gratuito |
| **EOX Sentinel-2 cloudless** | `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg` | EOX · Copernicus; s2maps.eu indica **CC BY-NC-SA** (uso no comercial) |
| **OpenTopoMap** | tiles de opentopomap.org | **CC-BY-SA**, © OSM, SRTM |
| **Natural Earth** | `data/borders.json` (fronteras 1:110m) | Dominio público |
| **Smithsonian GVP** | `https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows` → `data/volcanoes.json` | Catálogo holoceno; **no** es monitoreo en vivo. Citar GVP |

## 5. Pronóstico no oficial

| Recurso | Endpoint | Condición |
|---|---|---|
| **Open-Meteo** | `https://api.open-meteo.com/v1/forecast?hourly=precipitation` | Modelo, **no** aviso del IMN. Licencia CC-BY y límites de uso gratuito; verificar tope antes de producción |

## 6. Librerías, contenido y servicios

| Recurso | Uso | Licencia / condición |
|---|---|---|
| **MapLibre GL JS 6** | Mapa, una sola instancia | BSD-3-Clause |
| **Next.js 16 · React 19** | App Router y BFF | MIT |
| **Tailwind CSS 4** | Estilos | MIT |
| **Zod, SWR, lucide-react, turf, pbf, vector-tile** | Validación, datos, íconos, geometría, tiles | MIT / ISC según paquete |
| **web-push** | Notificaciones push | MIT |
| **Ready.gov (FEMA)** y **NOAA/NWS** | Textos de orientación adaptados, no generados por IA | Dominio público de EE. UU.; se cita la fuente |
| **Vercel** | Hosting del BFF; root `web/` | Términos del plan gratuito |
| **Supabase** | Solo si se configuran `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: guarda suscripciones push | **Opcional**; sin ellas el push queda en memoria |

## 7. Dónde se atribuye

- Pie de la portada: lista de fuentes y «NASA no respalda este proyecto».
- Cada tarjeta y popup: fuente, hora, distancia y enlace al reporte original.
- Estudio de radar: método, límites y nombres de gránulo.
- Orientación: fuente del protocolo, CNE, SINAMOT y 9-1-1.

## 8. Antes de publicar

1. Confirmar con SINAMOT/CNE acceso y reutilización de sus boletines y mapas.
2. Revisar los términos de Carto y el tope de Open-Meteo para producción.
3. Verificar la licencia exacta de los tiles EOX (no comercial) y de GVP.
4. Si se activa FIRMS, mantener la clave solo en el servidor y atribuir NASA FIRMS.
5. Ninguna de estas fuentes autoriza a la app a presentarse como alerta oficial.
