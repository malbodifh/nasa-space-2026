# AGENTS.md — brief para desarrollar la app

> **Si sos una IA y te pasaron este archivo:** leé esto completo, después
> [`docs/24-arquitectura-app.md`](docs/24-arquitectura-app.md) y
> [`docs/22-investigacion-desastres.md`](docs/22-investigacion-desastres.md).
> La verdad del proyecto está en [`documentacion.md`](documentacion.md) y `docs/*.md`.
> Este archivo es el manual operativo; si contradice un documento, gana el documento.

---

## 1. Qué estamos construyendo

Herramienta web de **alerta temprana personal** con datos NASA:

> “¿Qué peligro hay cerca de mi ubicación, cuándo llega y con qué confianza?”

- **No** reemplaza alertas oficiales: informa y deriva a la agencia.
- **No** predice el futuro: combina observación NASA + pronóstico oficial + frecuencia histórica.
- **No** inventa probabilidades: percentiles, periodo de retorno y datos oficiales.
- La submission oficial va en **inglés**; producto, docs y commits en **español**.

**Estado de la decisión:** el challenge 2026 sigue **sin elegir**. El hazard del MVP
(incendios / ciclones / inundación) y la región demo también están **pendientes**. No los
inventes: preguntá antes de escribir código de producto.

---

## 2. Estado real del repo

- **No hay app todavía.** No existe `web/`, `package.json`, `src/` ni `data/`.
- Solo hay documentación, guías Typst, CI y 3 smoke tests del repo.
- El proyecto anterior (**Mission Trainer**, reto #3, trivia) está archivado en la rama
  `archive/mission-trainer` y el tag `v1-mission-trainer`. **No lo revivas.**
- `main`, `staging`, `develop` y las ramas personales (`andy`, `david`, `samuel`, `jorge`,
  `leo`) están en el mismo commit limpio.

---

## 3. Decisiones ya tomadas (no reabrir sin pedir)

| Decisión | Valor |
|---|---|
| Framework | **Next.js 16** (App Router), React 19 |
| Lenguaje | **TypeScript** estricto |
| Estilos | **Tailwind CSS 4** |
| Mapa | **MapLibre GL 6** + Carto Dark Matter (sin token) |
| Backend | **Route Handlers de Next** (monolito BFF), sin backend aparte |
| Datos | Sin base de datos: JSON estático + caché |
| Alcance | **Un hazard por MVP**, con interfaz `HazardAdapter` |
| Deploy | **Vercel**, root directory `web/` |
| Paquete | **pnpm** (`packageManager` en `package.json`) |

Versiones verificadas el 14/11/2026. No actualizar dependencias durante el hackathon.

---

## 4. Arquitectura en una vista

```text
Navegador
  ├── mapa MapLibre (cliente, sin claves)
  └── panel de riesgo
        │
        ▼
Next.js en Vercel
  ├── /api/risk · /api/events · /api/climatology · /api/health
  ├── dominio: risk/fire.ts · stats.ts · geo.ts
  ├── integración: sources/{firms,power,eonet,gdacs,nhc}.ts
  └── datos: data/*.json (climatología + fallback)
        │
        ▼
FIRMS · POWER · EONET · GDACS · NHC · GIBS
```

**Capas:** presentación → BFF → dominio → integración → datos. El dominio nunca ve JSON crudo
de una agencia; la integración normaliza. Detalle completo en `docs/24-arquitectura-app.md`.

### Estructura objetivo

```text
web/
├── app/{layout,page}.tsx
├── app/api/{risk,events,climatology,health}/route.ts
├── components/{map,risk,location,events,ui}/
├── lib/{types,env,geo,stats,cache}.ts
├── lib/risk/{index,fire}.ts
├── lib/sources/{firms,power,eonet,gdacs,nhc,http}.ts
├── data/{fire-climatology,demo-fallback}.json
├── scripts/build-climatology.ts
└── tests/
```

---

## 5. Contratos y comportamiento

Tipos y endpoints completos en `docs/24-arquitectura-app.md` § 6. Resumen:

```ts
type ApiResponse<T> = {
  data: T;
  meta: { cached: boolean; updatedAt: string; latencySeconds: number; fallback: boolean };
};
```

- `GET /api/risk?lat&lon&radius&hazard` → `RiskAssessment`
- `GET /api/events?hazard&bbox&days` → `HazardEvent[]`
- `GET /api/climatology?lat&lon&hazard` → percentiles
- `GET /api/health` → estado de fuentes

Reglas:

1. **Zod en el borde**; `radius` 1–100 km; `bbox` ordenado y acotado.
2. **Toda respuesta lleva `meta`** con fuente, hora y si es fallback.
3. **Falla suave:** si una fuente cae, responder 200 con el último dato y `fallback: true`.
4. **Sin dato principal no hay score:** `level: "info"` y razón “sin datos”.
5. **No llamar APIs externas desde el cliente.** Nunca.

---

## 6. Fuentes de datos

| Fuente | Uso | Clave | Latencia | Endpoint base |
|---|---|---|---|---|
| FIRMS | Focos de calor | `FIRMS_MAP_KEY` gratis | Horas; URT < 60 s en EE.UU./Canadá | `firms.modaps.eosdis.nasa.gov/api/area/` |
| POWER | Clima diario 1981+ | No | 2–3 días | `power.larc.nasa.gov/api/temporal/daily/point` |
| EONET | Catálogo de eventos | No | Curado | `eonet.gsfc.nasa.gov/api/v3/events` |
| GDACS | Alertas globales | No | Minutos | `gdacs.org/gdacsapi/api/events/geteventlist/SEARCH` |
| NHC | Cono/trayectoria/probabilidades | No | Cada advisory | `nhc.noaa.gov/gis/` |
| GIBS | Imágenes IMERG | No | Horas | WMTS de `gibs.earthdata.nasa.gov` |

Reglas de datos:

- **Sin dato NASA accesible, no hay feature.** No inventar cifras ni prometer APIs.
- Citar fuente, hora y latencia en la UI. Decir “según NASA”, nunca “descubrimiento”.
- POWER es reanálisis (~0,5°): **no sirve para extremos locales**; IMERG o estaciones sí.
- FIRMS API solo consulta 1–5 días; el histórico se descarga aparte y se precomputa.
- Respetar cuotas (FIRMS: 5.000 transacciones/10 min) y atribución.

---

## 7. Comandos

### Hoy (repo limpio)

```bash
make check      # ruff + pytest (3 smoke tests) — el único gate real
make guides     # compila Typst a guides/dist/*.pdf
make setup      # crea .venv e instala requirements-dev.txt
make clean      # cachés + PNGs; NO borra los PDF versionados
```

Un test: `.venv/bin/python -m pytest tests/test_repo.py -q`

### Cuando exista `web/`

```bash
pnpm --dir web dev        # http://localhost:3000
pnpm --dir web build
pnpm --dir web lint
pnpm --dir web test
pnpm --dir web check      # lint + test + build (gate de la app)
```

Scaffold de referencia (solo cuando hazard/región estén decididos):

```bash
pnpm create next-app@latest web --ts --tailwind --eslint --app --use-pnpm
```

- Node local: 26; CI: 22. No usar APIs exclusivas de Node 26.
- La ruta del repo tiene un espacio (`NASA SPACEAPPS`): citar siempre en shell.

---

## 8. Reglas de código

- **TypeScript estricto**, sin `any`; preferir tipos de `lib/types.ts`.
- **Zod** para validar query params y respuestas externas.
- **Funciones puras** para `geo.ts`, `stats.ts` y `risk/*`; con tests Vitest.
- **Server-only** para claves: `import "server-only"` en `lib/env.ts`.
- **Un componente de mapa**, client-only, con `dynamic(..., { ssr: false })` desde un wrapper
  cliente. No recrear el mapa en cada render.
- **Actualizar datos con `source.setData()`**, no remontando MapLibre.
- **Nada de `fetch` externo en componentes cliente.**
- **Presupuesto:** respuesta de eventos < 300 KB; máx. 2.000 puntos dibujados.
- **Accesibilidad:** contraste AA, foco visible, textos alternativos, no solo color.
- **UI en español**, clara y sin alarmismo; el mensaje siempre incluye fuente y hora.
- Commits chicos, en imperativo y en español.

---

## 9. Git y CI

- Remoto: `malbodifh/nasa-space-2026`. Flujo: `persona → develop → staging → main`.
- **Nunca** commitear directo en `main`, `staging` ni `develop`, ni forzar push.
- Ramas: `feat/`, `fix/`, `docs/`. Una tarea = una rama = un PR.
- Commits como `Trizzoth <304232853+Trizzoth@users.noreply.github.com>`.
- `gh` tiene `push` pero **no `admin`**: no se pueden crear protecciones ni cambiar el default.
- GitHub Actions corre en push a `main` y en PRs: Ruff + Pytest + Typst. Al agregar `web/`,
  sumar un job pnpm con `lint`, `test` y `build`.
- Verificá con `make check` (y `pnpm --dir web check` cuando exista) antes de decir que funciona.

---

## 10. Definition of Done

1. `make check` en verde y, si tocaste la app, `pnpm --dir web check` en verde.
2. El mapa carga en desktop y celular; los estados de error/carga existen.
3. Cada tarjeta muestra **fuente, hora, confianza y enlace oficial**.
4. Los tests de score/percentiles pasan; no se validó “a ojo”.
5. Documentación actualizada en `docs/` y `AGENTS.md` si cambió la arquitectura.
6. Nada de secretos, datos pesados ni `node_modules` en el repo.

---

## 11. Qué NO hacer

- ❌ Implementar multi-riesgo antes de validar un hazard.
- ❌ Agregar base de datos, login o panel de administración en el MVP.
- ❌ Usar Mapbox/Google Maps (token y costo).
- ❌ Exponer `FIRMS_MAP_KEY` o cualquier clave en el cliente.
- ❌ Presentar la app como alerta oficial o prometer predicción exacta.
- ❌ Inventar cifras, probabilidades o cobertura de una API.
- ❌ Revivir Mission Trainer o mezclar su código.
- ❌ Commitear `.env`, `data/cache/`, `*.fits`, videos o `node_modules/`.

---

## 12. Primeros pasos para una IA

1. Confirmar con la persona: **hazard del MVP**, **región demo** y **reto oficial**.
2. Leer `docs/24-arquitectura-app.md` y `docs/22-investigacion-desastres.md`.
3. Scaffold de `web/` y conectar el mapa con un punto de prueba.
4. Implementar en este orden: `types` → `sources` → `risk` → `/api/risk` → panel → capas.
5. Agregar tests de las funciones puras antes de tocar la UI.
6. Actualizar `documentacion.md` (Decision Log) y este archivo si cambia algo estructural.

---

## 13. Gotchas verificados

- `make clean` **no** borra `guides/dist/`: ahí viven los PDF versionados.
- En `guides/src/theme.typ` el color de línea se llama `lineColor` porque `line` tapa la función
  built-in; `section(titulo, color: c)` exige el argumento con nombre.
- En Typst, `#` dentro de texto se escapa: `[\#]`.
- Next 16: `dynamic(..., { ssr: false })` solo dentro de un client component.
- MapLibre necesita su CSS (`maplibre-gl/dist/maplibre-gl.css`) y `window`; nunca en SSR.
- Tailwind 4 se configura en CSS (`@import "tailwindcss"`), no con `tailwind.config.js`.
- Las claves externas viven en `web/.env.local` (ignorado) y en Vercel.
