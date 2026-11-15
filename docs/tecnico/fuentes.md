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
| NOAA PTWC/NTWC (Atom y CAP enlazado) | boletines de ambos centros; el alcance territorial no se determina | no | 2 min |
| NOAA NHC (`CurrentStorms.json`) | ciclones activos | no | 10 min |
| Open-Meteo | lluvia pronosticada en 24 h (modelo, no aviso del IMN) | no | 30 min |
| GDACS | alertas oficiales con nivel | no | — |
| NASA EONET v3 | eventos naturales abiertos y cerrados (historial) | no | — |
| NASA FIRMS (VIIRS ×3) | focos de calor; **oculto** ([`0006`](../decisiones/0006-ocultar-incendios.md)) | `FIRMS_MAP_KEY` | 5 min |

El CAP solo se acepta del enlace oficial de la entrada Atom y si la fecha de emisión coincide.
Una cancelación o vencimiento explícitos pasan el boletín al historial. Si CAP falta o no se
puede verificar, se conserva el boletín con vigencia desconocida y se usa el límite temporal de
la app; esto no confirma que siga vigente ni que haya cesado la amenaza. No se reconstruye la
cadena de referencias entre boletines ni se interpreta su cobertura territorial.

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

- `count` cuenta reportes normalizados recibidos de la fuente; `visibleCount` cuenta los incluidos
  en `alerts`/`history` después de radio, vigencia, incendios ocultos y deduplicación. Un reporte
  confirmado por varias fuentes cuenta como visible para cada una.
- Cada fuente tiene presupuesto independiente (6 s en el agregador de eventos; redes sísmicas
  con abort a 5 s y presupuesto de 5,5 s). Si vence, las otras fuentes se conservan y su ID figura
  en `fallbackSources`. Sin dato anterior disponible se entrega vacío, no un supuesto último dato.
- `/api/assess`, `/api/alerts`, `/api/events` y `/api/overlays` agregan `meta.requestedAt`,
  `dataUpdatedAt` y `latencySeconds`. Los dos últimos representan la fecha más antigua y la edad
  de los datos fechados incluidos (también fechas de `sources`); son `null` si no se conoce ninguna.
  No demuestran cobertura ni la latencia de publicación del proveedor. `updatedAt` es **legado:
  hora de generación de la respuesta**, no observación. `cached:false` describe la respuesta
  recién compuesta; **no informa hits de las cachés internas ni de la CDN**. Falta instrumentar
  caché/fecha de consulta por fuente (ver correcciones de QA).
- GIBS sin respuesta completa para el radio deja `available:false`, `fallback:true`; POWER
  por sí solo no habilita el score de incendio. Un mosaico MVT vacío no demuestra que un satélite
  haya observado toda la zona: no se infiere cobertura de pasada.
- Los boletines sin fecha no se fechan con la hora de consulta: se consideran no vigentes.
  GDACS usa `datemodified` o `fromdate`, nunca `todate` futuro ni el inicio inventado del lookback.
- El pronóstico de lluvia enlaza [Open-Meteo](https://open-meteo.com/en/docs), no un aviso del IMN.
- NISAR limita descargas a 24 MiB por PNG, 256 KiB por KML y 2 MiB por catálogo CMR. Timeout:
  8 s (PNG/KML), 6 s (CMR); máximo dos redirecciones, solo al mismo origen. Valida granules
  provenientes tanto del cliente como de CMR. Colecciones parciales conservan su calidad
  original y devuelven `meta.fallbackCollections`, `fallback:true` y `Cache-Control:no-store`;
  un catálogo vacío completo devuelve `data:null`, `meta.reason:"sin-pasadas"`.

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
