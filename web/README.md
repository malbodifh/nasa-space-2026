# Memoria de Fuego · web

Observatorio personal de desastres naturales con datos NASA para Costa Rica.
Combina eventos abiertos (EONET/GDACS), focos de calor (GIBS), volcanes (GVP) y
condiciones de fondo (POWER).
**No es una alerta oficial**: informa con observación satelital y memoria histórica.

- Next.js 16.4.6 (App Router) + React 19 + TypeScript estricto
- Tailwind 4 + shadcn/ui (Radix)
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
| `/api/health` | mapa de APIs conectadas y estado de configuración |

Todas responden `{ data, meta: { cached, updatedAt, fallback, durationMs } }`.

## Fuentes

| Fuente | Uso | Clave |
| --- | --- | --- |
| NASA GIBS (MVT) | focos activos y memoria | no |
| NASA POWER | lluvia, viento, humedad, temperatura | no |
| NASA Worldview Snapshots | antes/después | no |
| NASA EONET v3 | eventos naturales abiertos | no |
| GDACS | alertas oficiales con nivel | no |
| OpenStreetMap / Overpass | caminos y áreas protegidas | no |
| Smithsonian GVP | volcanes holocenos (snapshot) | no |
| Natural Earth 110m | fronteras (snapshot) | no |
| NASA FIRMS | opcional, no conectado | `FIRMS_MAP_KEY` |

Los snapshots de `data/` se regeneran con:

```bash
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
5. Variables de entorno: **ninguna obligatoria**. `FIRMS_MAP_KEY` solo si se conecta FIRMS.

`web/vercel.json` fija esos comandos. El resto lo resuelve Vercel al detectar
`pnpm-lock.yaml`.

## Límites

- POWER es reanálisis ~0,5° con 2–3 días de latencia; no representa extremos locales.
- GIBS entrega detecciones, no incendios confirmados.
- Las correlaciones (caminos, áreas protegidas, volcanes) son coincidencia espacial,
  no causalidad.
- La app no reemplaza a la CNE, SINAC ni a los servicios de emergencia.
