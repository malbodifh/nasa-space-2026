# Memoria de Fuego · web

Cambios de la superficie de Costa Rica vistos con el radar **NASA-ISRO NISAR**, más un
observatorio de alertas de desastres naturales.

- **`/`**: mapa con su ubicación (GPS o Liberia de ejemplo), estado según las alertas activas
  a menos de 100 km, condiciones para incendios, alertas activas e historial del último año
  (EONET cerrados, sismos M4+ y cambios fuertes detectados por radar). Cada evento enlaza a
  «Ver cómo cambió la superficie de la Tierra».
- **`/superficie?lat&lon&fecha&titulo&tipo`**: antes/después con radar NISAR, mapa de cambios y
  foto normal (MODIS) vs. radar. Si el punto cae en una zona precalculada (Palo Verde, Caño Negro,
  Rincón de la Vieja, Tortuguero) usa esos recortes; si no, busca la pasada en CMR, baja dos vistas
  previas por `/api/nisar/browse` y calcula el cambio en el navegador (`lib/sar-change.ts`).

Identidad visual: paleta, tipografía (Plus Jakarta Sans), radios y botones de Aulemo, en
`app/globals.css`. El logo es propio.

**No es una alerta oficial**: informa con observación satelital y memoria histórica.

- Next.js 16.4.6 (App Router) + React 19 + TypeScript estricto
- Tailwind 4 + componentes propios
- MapLibre GL 6 + Carto Positron
- pnpm 11 · Node 22

## Desarrollo

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint
pnpm test
pnpm build
```

`postinstall`, `predev` y `prebuild` copian el worker de MapLibre a `public/`.

## Rutas del BFF

| Ruta | Qué devuelve |
| --- | --- |
| `/api/assess` | riesgo, focos del día, memoria histórica y clima |
| `/api/overlays` | caminos, áreas protegidas, volcanes, fronteras y eventos |
| `/api/alerts` | alertas unificadas; `?test=1` agrega una alerta de prueba |
| `/api/events` | eventos activos e historial (EONET, GDACS, sismos) cerca de un punto |
| `/api/nisar/search` | pasadas NISAR GCOV sobre un punto (CMR) y límites del cuadro |
| `/api/nisar/browse` | vista previa PNG de un producto NISAR (solo nombres válidos) |
| `/api/health` | mapa de APIs conectadas y estado de configuración |

Todas responden `{ data, meta: { cached, updatedAt, fallback, durationMs } }`.

## Fuentes

| Fuente | Uso | Clave |
| --- | --- | --- |
| NASA-ISRO NISAR L2 GCOV (ASF DAAC) | radar banda L: imágenes y mapas de cambio (snapshot) | no para la vista previa; Earthdata para el HDF5 |
| NASA CMR | catálogo de pasadas NISAR | no |
| NASA GIBS (MVT) | focos activos y memoria | no |
| NASA POWER | lluvia, viento, humedad, temperatura | no |
| NASA Worldview Snapshots | antes/después | no |
| NASA EONET v3 | eventos naturales abiertos | no |
| GDACS | alertas oficiales con nivel | no |
| USGS | sismos regionales (30 días) | no |
| OVSICORI-UNA | sismos locales de Costa Rica | no |
| OpenStreetMap / Overpass | caminos y áreas protegidas | no |
| Smithsonian GVP | volcanes holocenos (snapshot) | no |
| Natural Earth 110m | fronteras (snapshot) | no |
| NASA FIRMS (VIIRS ×3) | focos de calor de 2 días, agrupados; posibles incendios | `FIRMS_MAP_KEY` (gratis) |
| RSN (UCR-ICE) | sismos sentidos, con «sentido en» | no |
| NOAA PTWC/NTWC | boletines de tsunami, Pacífico y Caribe | no |
| NOAA NHC | ciclones activos | no |
| Open-Meteo | lluvia pronosticada en 24 h (modelo, no aviso del IMN) | no |

Las alertas pasan por reglas por amenaza (`lib/alert-rules.ts`): por ejemplo, un sismo afecta
si es M4+ a menos de 50 km, M5+ a menos de 150 km, M6,5+ a menos de 400 km o si se sintió a
menos de 60 km; un tsunami, si el centro de alerta emite vigilancia, aviso o advertencia. El
mismo sismo reportado por RSN, OVSICORI y USGS se muestra una sola vez. `/api/events` devuelve
el estado de cada fuente en `meta.sources`, y la portada lo muestra en «Fuentes en vivo».
Los avisos del navegador solo funcionan con la página abierta.

Los snapshots de `data/` se regeneran con:

```bash
# radar NISAR: consulta CMR, baja las vistas previas públicas de ASF a .cache/nisar/
# (~70 MB, no se versiona) y escribe public/nisar/<zona>/*.webp + data/nisar.json
node scripts/build-nisar.mjs            # --refresh vuelve a consultar y descargar

# caminos y áreas protegidas desde el extracto de Geofabrik (requiere pyosmium)
curl -L https://download.geofabrik.de/central-america/costa-rica-latest.osm.pbf -o /tmp/costa-rica.osm.pbf
python3 scripts/build-osm-cr.py /tmp/costa-rica.osm.pbf

# volcanes (GVP) y fronteras (Natural Earth)
node scripts/build-overlays.mjs

# fixtures de memoria y clima
node scripts/generate-memory.mjs 2024-04-05 10.635 -85.4377 50
node scripts/generate-climate.mjs 10.635 -85.4377
```

Las zonas de Guanacaste, Valle Central y Arenal se sirven desde
`data/overpass-costa-rica.json`, generado con el extracto de Geofabrik, para que la demo
no dependa de la latencia de Overpass. Fuera de esas zonas se consulta Overpass en vivo.

## Deploy en Vercel

1. Importar `malbodifh/nasa-space-2026` en Vercel.
2. **Root Directory: `web/`** (importante: el repo también tiene Python y Typst).
3. Framework: Next.js (autodetectado). Install `pnpm install --frozen-lockfile`,
   build `pnpm build`.
4. Node 22 (`engines.node` en `package.json`).
5. Variables de entorno: `FIRMS_MAP_KEY` (clave gratuita de FIRMS). Sin ella, la app funciona y
   «Fuentes en vivo» marca FIRMS como sin respuesta.

`web/vercel.json` fija esos comandos. El resto lo resuelve Vercel al detectar
`pnpm-lock.yaml`.

## Límites

- El radar usa la **vista previa** de NISAR (PNG de 8 bits, HH en rojo/azul y HV en verde),
  no el gamma0 calibrado del HDF5. Los porcentajes de cambio son aproximados.
- El cambio es la diferencia de HH suavizada (5×5) contra una fecha base; se ignora el agua
  oscura en las dos fechas (mar, lagos). En las zonas de la pista 170 la base es el
  20 jul 2026: la imagen provisional del 26 jun trae una franja de brillo que inventaba cambios.
- Varias pasadas son productos **provisionales** (calibración en revisión); la app lo indica.
- POWER es reanálisis ~0,5° con 2–3 días de latencia; no representa extremos locales.
- GIBS entrega detecciones, no incendios confirmados.
- Las correlaciones (caminos, áreas protegidas, volcanes) son coincidencia espacial,
  no causalidad.
- La app no reemplaza a la CNE, SINAC ni a los servicios de emergencia.
