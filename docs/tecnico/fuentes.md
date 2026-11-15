# Fuentes de datos

> **Estado:** vigente · **única tabla de lo que la app usa hoy.** Si se agrega o quita una fuente,
> se cambia acá. La verificación original (14/11/2026) está en
> [`../investigacion/apis-verificadas.md`](../investigacion/apis-verificadas.md).

Reglas generales: la clave solo vive en el servidor, el cliente nunca llama una API externa,
y una fuente caída responde con el último dato o se marca «sin respuesta»; no se inventa.

## En vivo (alertas)

| Fuente | Qué aporta | Clave | Caché |
|---|---|---|---|
| USGS FDSN | sismos regionales, con PAGER/MMI | no | 2 min |
| OVSICORI-UNA (`latest.geojson`) | sismos locales; `manual` = revisado, `automatic` = preliminar | no | 2 min |
| RSN UCR-ICE (RSS) | sismos sentidos, con «sentido en» (hora de Costa Rica, UTC−6) | no | 2 min |
| NOAA PTWC/NTWC (Atom) | boletines de tsunami, Pacífico y Caribe | no | 2 min |
| NOAA NHC (`CurrentStorms.json`) | ciclones activos | no | 10 min |
| Open-Meteo | lluvia pronosticada en 24 h (modelo, no aviso del IMN) | no | 30 min |
| GDACS | alertas oficiales con nivel | no | — |
| NASA EONET v3 | eventos naturales abiertos y cerrados (historial) | no | — |
| NASA FIRMS (VIIRS ×3) | focos de calor; **oculto** ([`0006`](../decisiones/0006-ocultar-incendios.md)) | `FIRMS_MAP_KEY` | 5 min |

## Radar y mapas

| Fuente | Uso | Clave |
|---|---|---|
| NASA-ISRO NISAR L2 GCOV (ASF DAAC) | imágenes y mapas de cambio ([`../producto/nisar.md`](../producto/nisar.md)) | no para la vista previa |
| NASA CMR | catálogo de pasadas NISAR | no |
| NASA Worldview Snapshots | foto normal (MODIS) | no |
| NASA GIBS (MVT) | focos activos y memoria histórica | no |
| NASA POWER | lluvia, viento, humedad y temperatura | no |
| OpenStreetMap / Overpass | caminos y áreas protegidas | no |
| Smithsonian GVP | volcanes holocenos (snapshot) | no |
| Natural Earth 110m | fronteras (snapshot) | no |
| Carto Positron | mapa base de MapLibre | no |

Sin API y sin scraping: **CNE** (Cloudflare Turnstile) e **IMN**. Se enlazan, no se consultan.

## Estado de las fuentes

`/api/events` devuelve el estado de cada fuente en `meta.sources` (último dato, sin eventos, sin
respuesta o desactualizada). OVSICORI solo regenera su archivo cuando hay un sismo nuevo, así que
se marca desactualizada pasadas 12 h.

## Trampas verificadas

- **FIRMS** pide `FIRMS_MAP_KEY` (gratuita; 5000 transacciones cada 10 min) y solo consulta 1–5
  días. Su WMS lleva la clave en la URL: nunca va al cliente.
- **GIBS MVT** de anomalías térmicas está en EPSG:4326, no en mercator: MapLibre no lo pinta
  directo; se decodifica en el servidor.
- **POWER** es reanálisis de ~0,5° con 2–3 días de latencia y relleno `-999`: no sirve para
  extremos locales. **IMERG Early** llega ~4 h tarde: no sirve para crecidas repentinas.
- **LHASA** entrega GeoTIFF globales de ~146 MB al día: no es viable en tiempo de ejecución.
- **NHC** no siempre tiene tormentas activas: sin una, el demo de ciclón sería un hindcast.
- **Worldview BBOX** va en orden sur, oeste, norte, este (latitud primero).
- **Smithsonian GVP** responde 403 a los bots: solo se enlaza.
- Atribuir siempre la fuente. Decir «según NASA», nunca «descubrimiento».

## Regenerar los snapshots

Comandos en [`../../web/README.md`](../../web/README.md).
