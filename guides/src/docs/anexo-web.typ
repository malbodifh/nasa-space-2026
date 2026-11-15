// Generado desde web/README.md con pandoc. No editar a mano.

#import "theme.typ": *

= Memoria de Fuego · web
Prototipo de alerta temprana personal con datos NASA para Valparaíso.
#strong[No es una alerta oficial]: informa con observación satelital y
memoria histórica.

- Next.js 16.4.6 (App Router) + React 19 + TypeScript estricto
- Tailwind 4 + shadcn/ui (Radix)
- MapLibre GL 6 + Carto Positron
- pnpm 11 · Node 22

== Desarrollo
```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint
pnpm test
pnpm build
```

`postinstall`, `predev` y `prebuild` copian el worker de MapLibre a
`public/`.

== Rutas del BFF
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Ruta], [Qué devuelve],),
    table.hline(),
    [`/api/assess`], [riesgo, focos del día, memoria histórica y clima],
    [`/api/overlays`], [caminos, áreas protegidas, volcanes, fronteras y
    eventos],
    [`/api/alerts`], [alertas unificadas; `?test=1` agrega una alerta de
    prueba],
    [`/api/health`], [mapa de APIs conectadas y estado de
    configuración],
  )]
  , kind: table
  )

Todas responden
`{ data, meta: { cached, updatedAt, fallback, durationMs } }`.

== Fuentes
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Fuente], [Uso], [Clave],),
    table.hline(),
    [NASA GIBS (MVT)], [focos activos y memoria], [no],
    [NASA POWER], [lluvia, viento, humedad, temperatura], [no],
    [NASA Worldview Snapshots], [antes/después], [no],
    [NASA EONET v3], [eventos naturales abiertos], [no],
    [GDACS], [alertas oficiales con nivel], [no],
    [OpenStreetMap / Overpass], [caminos y áreas protegidas], [no],
    [Smithsonian GVP], [volcanes holocenos (snapshot)], [no],
    [Natural Earth 110m], [fronteras (snapshot)], [no],
    [NASA FIRMS], [opcional, no conectado], [`FIRMS_MAP_KEY`],
  )]
  , kind: table
  )

Los snapshots de `data/` se regeneran con:

```bash
node scripts/build-overlays.mjs
node scripts/generate-memory.mjs
```

Overpass dentro de 70 km de Valparaíso se sirve desde
`data/overpass-valparaiso.json` para que la demo no dependa de la
latencia de la API.

== Deploy en Vercel
+ Importar `malbodifh/nasa-space-2026` en Vercel.
+ #strong[Root Directory: `web/`] (importante: el repo también tiene
  Python y Typst).
+ Framework: Next.js (autodetectado). Install
  `pnpm install --frozen-lockfile`, build `pnpm build`.
+ Node 22 (`engines.node` en `package.json`).
+ Variables de entorno: #strong[ninguna obligatoria]. `FIRMS_MAP_KEY`
  solo si se conecta FIRMS.

`web/vercel.json` fija esos comandos. El resto lo resuelve Vercel al
detectar `pnpm-lock.yaml`.

== Límites
- POWER es reanálisis \~0,5° con 2--3 días de latencia; no representa
  extremos locales.
- GIBS entrega detecciones, no incendios confirmados.
- Las correlaciones (caminos, áreas protegidas, volcanes) son
  coincidencia espacial, no causalidad.
- La app no reemplaza a SENAPRED, CONAF ni a los servicios de
  emergencia.