# AGENTS.md

> **Si sos una IA:** leé esto, después [`docs/24-arquitectura-app.md`](docs/24-arquitectura-app.md)
> (arquitectura), [`docs/22-investigacion-desastres.md`](docs/22-investigacion-desastres.md)
> (datos) y [`docs/23-plan-app.md`](docs/23-plan-app.md) (producto).
> La verdad está en [`documentacion.md`](documentacion.md) y `docs/*.md`; si algo de acá
> contradice un documento, gana el documento.

## Proyecto

- **Astral Codes**, NASA Space Apps 2026, deadline **domingo 15/11/2026 23:59**.
- App web de **alerta temprana personal** con datos NASA: “¿qué peligro hay cerca, cuándo llega
  y con qué confianza?”. **No** reemplaza alertas oficiales ni promete predicción exacta.
- **Challenge, hazard del MVP y región demo están SIN decidir.** Preguntá antes de escribir
  código de producto. No inventes un ganador.

## Estado real

- **No hay app todavía**: no existe `web/`, `package.json`, `src/` ni `data/`. Solo docs, guías
  Typst, CI y 3 smoke tests.
- **Mission Trainer** (reto #3, trivia) está archivado en la rama `archive/mission-trainer` y el
  tag `v1-mission-trainer`. **No lo revivas** ni mezcles su código.
- `guides/src/*.typ` es maquetación; `guides/dist/*.pdf` está versionado (los PNG no). Si un PDF
  contradice un `.md`, gana el `.md`.

## Decisiones cerradas

- **Next.js 16** (App Router) + React 19 + **TypeScript** estricto + **Tailwind 4**.
- **MapLibre GL 6** con Carto Dark Matter (sin token). No Mapbox/Google Maps.
- **Monolito BFF**: Route Handlers de Next. Sin backend aparte, **sin base de datos ni auth**.
- **Un hazard por MVP** detrás de `HazardAdapter`; multi-riesgo queda para después.
- Deploy **Vercel** con root directory `web/`; gestor **pnpm**.
- Versiones fijadas al crear el proyecto; no actualizar dependencias durante el hackathon.

## Comandos

```bash
make check      # ruff + pytest (3 smoke tests) — gate actual
make guides     # compila Typst a guides/dist/*.pdf
make setup      # crea .venv e instala requirements-dev.txt
make clean      # cachés + PNGs; NO borra los PDF versionados
```

- Un test: `.venv/bin/python -m pytest tests/test_repo.py -q`
- `.venv` local es Python 3.14; CI usa 3.12. No uses sintaxis exclusiva de 3.14.
- La ruta tiene un espacio (`NASA SPACEAPPS`): citá siempre en shell.
- Cuando exista `web/`: `pnpm --dir web dev|build|lint|test`. **Todavía no existen**; no los
  inventes como si funcionaran.

## Arquitectura (lo que no se deduce de los nombres)

- **Claves solo en el servidor** (`web/.env.local`, Vercel). El cliente nunca llama APIs externas.
- `lib/sources/*` normaliza; el dominio (`lib/risk`, `lib/stats`) **nunca ve JSON crudo**.
- Toda respuesta: `{ data, meta: { cached, updatedAt, latencySeconds, fallback } }`.
- **Falla suave:** fuente caída → 200 con último dato y `fallback: true`; sin dato principal no
  hay score (`level: "info"`), no se inventa.
- Mapa: **una sola instancia**; actualizar con `source.setData()`, no remontar. `dynamic(...,
  { ssr: false })` solo dentro de un client component.
- Estructura, contratos, caché y ADRs: [`docs/24-arquitectura-app.md`](docs/24-arquitectura-app.md).

## Datos

| Fuente | Uso | Clave | Latencia |
|---|---|---|---|
| FIRMS | Focos de calor | `FIRMS_MAP_KEY` gratis | horas; URT < 60 s en EE.UU./Canadá |
| POWER | Clima diario 1981+ | no | 2–3 días |
| EONET | Catálogo de eventos | no | curado |
| GDACS | Alertas globales | no | minutos |
| NHC | Cono/probabilidades de ciclón | no | cada advisory |
| GIBS | Imágenes IMERG | no | horas |

- **POWER es reanálisis ~0,5°: no sirve para extremos locales** (subestimó la DANA de Valencia).
- **IMERG Early llega 4 h tarde**: no sirve para flash floods, sí para acumulados.
- **FIRMS API solo consulta 1–5 días**; el histórico se descarga aparte y se precomputa.
- Sin dato NASA accesible no hay feature; no inventar cifras ni prometer APIs. Citar fuente,
  hora y latencia. Decir “según NASA”, nunca “descubrimiento”.

## Git y CI

- Remoto `malbodifh/nasa-space-2026`. Flujo `persona → develop → staging → main`.
- **Nunca** commitear directo en `main`, `staging` o `develop`, ni forzar push.
- Una tarea = una rama (`feat/`, `fix/`, `docs/`) = un PR. Commits en español e imperativo.
- Autor: `Trizzoth <304232853+Trizzoth@users.noreply.github.com>`.
- CI corre Ruff + Pytest + Typst. **El job `frontend` está desactualizado** (busca
  `src/frontend/package.json`, usa npm y Node 20): al crear `web/`, cambiarlo a `web/` + pnpm +
  Node 22.
- `gh` tiene `push` pero **no `admin`**: no se pueden crear protecciones ni cambiar el default.

## Gotchas

- `make clean` **no** debe borrar `guides/dist/`: ahí viven los PDF versionados.
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

1. `make check` verde; `pnpm --dir web check` verde cuando exista la app.
2. Mapa usable en desktop y celular, con estados de carga/error.
3. Cada tarjeta muestra fuente, hora, confianza y enlace oficial.
4. Score y percentiles con tests; documentación y este archivo actualizados si cambia algo.
