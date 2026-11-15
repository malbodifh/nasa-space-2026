# AGENTS.md

> Leé esto antes de tocar código. La fuente de verdad es [`documentacion.md`](documentacion.md)
> y `docs/*.md`; si algo de acá contradice un documento, gana el documento.

## Contexto

- **Astral Codes**, NASA Space Apps 2026. Deadline: **domingo 15/11/2026 23:59**.
- Producto: alerta temprana personal con datos NASA (“¿qué peligro hay cerca, cuándo llega y
  con qué confianza?”). **Informa**; no reemplaza alertas oficiales ni promete predicción exacta.
- **Challenge, hazard del MVP y región demo están SIN decidir.** Preguntá antes de escribir
  código de producto. No inventes un ganador.
- **No hay app todavía**: no existe `web/`, `package.json`, `src/` ni `data/`. Solo docs, guías
  Typst, CI y 3 smoke tests.
- **Mission Trainer** (reto #3, trivia) está archivado en `archive/mission-trainer` y
  `v1-mission-trainer`. No lo revivas ni mezcles su código.

## Leer primero

1. [`documentacion.md`](documentacion.md) — estado y decisiones.
2. [`docs/25-api-research.md`](docs/25-api-research.md) — APIs verificadas, core NASA y fallbacks.
3. [`docs/26-spike-datos.md`](docs/26-spike-datos.md) — spike real y rebanada vertical propuesta.
4. [`docs/24-arquitectura-app.md`](docs/24-arquitectura-app.md) — capas, contratos y deploy.
5. [`docs/22-investigacion-desastres.md`](docs/22-investigacion-desastres.md) y
   [`docs/23-plan-app.md`](docs/23-plan-app.md) — ciencia y producto.
6. [`docs/18-workflow.md`](docs/18-workflow.md) — ramas, PRs y recuperación.

## Comandos

```bash
make setup      # crea .venv e instala requirements-dev.txt
make check      # ruff + pytest — el único gate real
make test       # pytest
make lint       # ruff
make format     # ruff format
make guides     # compila guides/src/06-retos.typ a PDF + PNG
make clean      # cachés + PNGs; NO borra los PDF versionados
```

- Un test: `.venv/bin/python -m pytest tests/test_repo.py -q`.
- `.venv` local es Python **3.14**; CI usa **3.12**. No uses sintaxis exclusiva de 3.14.
- `make guides` requiere `typst` en `PATH`; CI fija **0.15.1**.
- La ruta tiene un espacio (`NASA SPACEAPPS`): citá siempre en shell.
- Frontend: `pnpm --dir web dev|build|lint|test` (Next 16 + Turbopack).
- Deploy: Vercel con **root directory `web/`**, pnpm y Node 22. Sin variables obligatorias;
  `FIRMS_MAP_KEY` es opcional. Ver [`web/README.md`](web/README.md).

## Decisiones cerradas

- **Next.js 16.4.6** (App Router) + React 19 + **TypeScript** estricto + **Tailwind 4.3.5**.
- **MapLibre GL 6** + Carto Dark Matter (sin token). No Mapbox ni Google Maps.
- **Monolito BFF**: Route Handlers de Next. Sin backend aparte, **sin base de datos ni auth**.
- **Un hazard por MVP** detrás de `HazardAdapter`; multi-riesgo queda para después.
- Deploy **Vercel** con root directory `web/`; gestor **pnpm**.
- Versiones fijadas en [`docs/23-plan-app.md`](docs/23-plan-app.md); no actualizar dependencias
  durante el hackathon.
- La app vive en `web/` para no mezclar npm con Ruff/Pytest/Typst.

## Datos y core NASA

- **Recomendación técnica, no decisión:** incendio es el hazard más NASA-native. El core
  completo se puede armar con **FIRMS** (focos actuales) + **GIBS** (20+ años de focos) +
  **POWER** (climatología 1981+) + **GFWED** (FWI) + **Worldview Snapshots** (antes/después).
- **FIRMS** pide `FIRMS_MAP_KEY` gratis (pendiente) y solo consulta **1–5 días**. El histórico
  masivo pide Earthdata; para 20 años usar **GIBS MVT**.
- **FIRMS WMS GetMap** existe (`/mapserver/wms/fires/{KEY}/`), pero la key viaja en la URL:
  nunca ponerla en el cliente. Usar el area API + círculos, o proxear el WMS por el BFF.
- **GIBS MVT** de anomalías térmicas está en **EPSG:4326**, no en mercator: MapLibre no lo pinta
  directo. Decodificarlo en el servidor (`@mapbox/vector-tile` + `pbf`) y devolver GeoJSON.
- **POWER** es reanálisis ~0,5°, con ~2–3 días de latencia y fill `-999`: no sirve para extremos
  locales. **IMERG Early** llega ~4 h tarde: no sirve para flash floods.
- **NHC** no tenía tormentas activas el 14/11: un demo de ciclón tendría que ser hindcast.
  **LHASA** entrega GeoTIFF globales de ~146 MB/día: no es viable en runtime.
- Complementos no NASA: GDACS/NHC para pronóstico oficial, OSM para exposición, Open-Meteo para
  viento/lluvia/PM2.5, OVSICORI solo como dato local. Atribuir siempre.
- Sin dato NASA accesible no hay feature. No inventar cifras, probabilidades ni cobertura.
  Citar fuente, hora y latencia; decir “según NASA”, nunca “descubrimiento”.
- Límites, contratos y fallbacks: [`docs/25-api-research.md`](docs/25-api-research.md).

## Arquitectura (cuando exista `web/`)

- **Claves solo en el servidor** (`web/.env.local`, Vercel). El cliente nunca llama APIs externas.
- `lib/sources/*` normaliza; el dominio (`lib/risk`, `lib/stats`) **nunca ve JSON crudo**.
- Toda respuesta: `{ data, meta: { cached, updatedAt, latencySeconds, fallback } }`.
- **Falla suave:** fuente caída → 200 con último dato y `fallback: true`; sin dato principal no
  hay score (`level: "info"`), no se inventa.
- Mapa: **una sola instancia**; actualizar con `source.setData()`, no remontar. `dynamic(...,
  { ssr: false })` solo dentro de un client component.
- Estructura, endpoints y ADRs: [`docs/24-arquitectura-app.md`](docs/24-arquitectura-app.md).

## Git y CI

- Remoto `malbodifh/nasa-space-2026`. Flujo `persona → develop → staging → main`.
- **Nunca** commitear directo en `main`, `staging` o `develop`, ni forzar push.
- Una tarea = una rama (`feat/`, `fix/`, `docs/`) = un PR. Commits en español e imperativo.
- Autor: `Trizzoth <304232853+Trizzoth@users.noreply.github.com>`.
- CI corre Ruff + Pytest + Typst + frontend. El job `frontend` usa `web/`, pnpm 11.28.5 y
  Node 22 (lint + test + build).
- `gh` tiene `push` pero **no `admin`**: no se pueden crear protecciones ni cambiar el default.

## Gotchas

- `make clean` **no** borra `guides/dist/`: ahí viven los PDF versionados. Sí borra los PNG.
- `make guides` solo compila `guides/src/06-retos.typ`; los tests exigen que **cada** `.typ`
  (excepto `theme.typ`) tenga su PDF. Si agregás una guía, actualizá el Makefile.
- `tests/test_repo.py` valida enlaces locales en `README.md`, `AGENTS.md`, `documentacion.md` y
  `CONTRIBUTING.md`: un link roto rompe `make check`.
- En `guides/src/theme.typ` el color de línea es `lineColor` (`line` tapa el built-in) y
  `section(titulo, color: c)` exige el argumento con nombre.
- En Typst, `#` dentro de texto se escapa: `[\#]`.
- MapLibre necesita su CSS y `window`: nunca en SSR.
- Tailwind 4 se configura en CSS (`@import "tailwindcss"`), no con `tailwind.config.js`.

## Qué NO hacer

- ❌ Multi-riesgo, base de datos, login o panel admin en el MVP.
- ❌ Exponer claves o llamar APIs externas desde el cliente.
- ❌ Presentar la app como alerta oficial o inventar probabilidades/cobertura.
- ❌ Revivir Mission Trainer.
- ❌ Commitear `.env`, `data/cache/`, `*.fits`, videos, `node_modules/` o PNG de guías.

## Definition of Done

1. `make check` verde; cuando exista `web/`, `pnpm --dir web lint`, `test` y `build` verdes.
2. Mapa usable en desktop y celular, con estados de carga/error.
3. Cada tarjeta muestra fuente, hora, confianza y enlace oficial.
4. Score y percentiles con tests; documentación y este archivo actualizados si cambia algo.
