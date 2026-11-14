# 23 — Plan de la app web

> **Stack decidido:** Next.js + TypeScript + Tailwind CSS.
> **Estado:** planificación. No hay código todavía.
> **Supuesto de trabajo:** la app es una cáscara multi-riesgo, pero el MVP implementa **un**
> hazard. El hazard y la región se eligen antes de escribir la primera línea.

---

## 0. La pregunta que responde la app

> **“¿Qué peligro hay cerca de mi ubicación, cuándo llega y con qué confianza?”**

Todo lo demás —capas, gráficos, historial— existe para responder eso en menos de 10 segundos.
La app **informa**; no emite alertas oficiales ni reemplaza a la agencia correspondiente.

---

## 1. Stack

Versiones verificadas el 14/11/2026 (registry de npm). Al crear el proyecto se fijan en
`package.json`; no se actualizan durante el hackathon.

| Pieza | Versión | Para qué | Por qué |
|---|---|---|---|
| Next.js (App Router) | 16.4.6 | Framework, rutas API, deploy | Server Routes esconden las claves y cachean |
| React | 19.3.1 | UI | Viene con Next 16 |
| TypeScript | 5.x | Tipos | Contratos de datos explícitos |
| Tailwind CSS | 4.3.5 | Estilos | Sin CSS global artesanal |
| MapLibre GL JS | 6.18.0 | Mapa | Gratis, sin token, vectorial y rápido |
| Zod | 4.6.7 | Validar query params y respuestas | Evita datos rotos en el mapa |
| SWR | 2.5.1 | Fetch del cliente + revalidación | Simple, sin Redux |
| date-fns / `Intl` | — | Fechas y “hace 2 h” | Legible |

**Mapa:** `maplibre-gl` directo en un componente cliente. No usamos `react-map-gl` para evitar
una capa extra de versión; el wrapper propio son ~80 líneas.

**Basemap (sin clave):**

- Recomendado: Carto Dark Matter
  `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` (probado 200).
- Alternativa: OpenFreeMap Liberty `https://tiles.openfreemap.org/styles/liberty` (probado 200).
- Atribución obligatoria: OpenStreetMap + Carto/OpenFreeMap.

**No usamos:** Mapbox (token y costo), Google Maps (token y costo), Leaflet (más simple pero
peor para heatmaps y capas vectoriales).

---

## 2. Estructura del repo

La app vive en `web/` para no mezclar npm con Ruff/Pytest/Typst.

```text
web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # shell: mapa + panel
│   └── api/
│       ├── risk/route.ts        # evaluación para un punto
│       ├── events/route.ts      # eventos normalizados por bbox
│       ├── climatology/route.ts # percentiles históricos
│       └── health/route.ts
├── components/
│   ├── map/MapCanvas.tsx        # cliente, MapLibre
│   ├── map/MapLayers.ts         # definición de capas
│   ├── map/Legend.tsx
│   ├── risk/RiskPanel.tsx
│   ├── risk/RiskBadge.tsx
│   ├── location/SearchBox.tsx
│   ├── location/RadiusPicker.tsx
│   ├── events/EventCard.tsx
│   └── ui/                      # botones, sheet, skeleton
├── lib/
│   ├── types.ts                 # HazardEvent, RiskAssessment, Meta
│   ├── env.ts                   # claves server-only
│   ├── geo.ts                   # distancia, círculo, bbox
│   ├── stats.ts                 # percentiles, periodo de retorno
│   ├── risk/fire.ts             # motor del MVP
│   ├── risk/index.ts            # interfaz HazardAdapter
│   ├── sources/firms.ts
│   ├── sources/power.ts
│   ├── sources/eonet.ts
│   ├── sources/gdacs.ts
│   ├── sources/nhc.ts
│   └── cache.ts
├── data/                        # JSON precomputado (versionado)
│   ├── fire-climatology.json
│   └── demo-fallback.json       # si la API falla en vivo
├── scripts/
│   └── build-climatology.ts
├── tests/
├── public/
├── package.json
└── next.config.ts
```

`packageManager` en `package.json`: `pnpm@11`. En la máquina del equipo: `corepack enable`.

---

## 3. Flujo del usuario

### Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│  ASTRAL · [🔍 buscar lugar]  [📍 mi ubicación]  [24 h ▾]     │
├──────────────────────────┬───────────────────────────────────┤
│  RIESGO ALTO             │                                   │
│  78 / 100                │            MAPA                   │
│  ─────────────────────   │   • focos FIRMS                   │
│  • 3 focos a 8 km        │   ○ radio 25 km                   │
│  • viento 42 km/h        │   ░ densidad histórica            │
│  • 12 días sin lluvia    │                                   │
│  ─────────────────────   │   [leyenda]      [últ. dato 14:20]│
│  Fuente: NASA FIRMS      │                                   │
│  [Ver alerta oficial ↗]  │                                   │
└──────────────────────────┴───────────────────────────────────┘
```

### Pasos

1. **Entrada.** El mapa carga con una región demo y los eventos de las últimas 24 h.
2. **Ubicación.** El usuario busca una dirección, toca el mapa o usa geolocalización.
3. **Radio.** Elige 10 / 25 / 50 km. Se dibuja un círculo.
4. **Evaluación.** La app llama `GET /api/risk` y muestra el panel.
5. **Exploración.** Click en un foco/tormenta → tarjeta con hora, sensor, distancia y fuente.
6. **Capas.** Toggle: focos 24 h / 7 días, densidad histórica, viento/lluvia.
7. **Compartir.** La URL guarda `?lat=&lon=&r=&h=`.
8. **Alerta oficial.** Botón que abre GDACS/NHC/protección civil. La app no reemplaza nada.

### Mobile

- Mapa a pantalla completa.
- Buscador flotante arriba.
- Panel de riesgo como **bottom sheet** (colapsado: nivel + score; expandido: razones y fuentes).
- Botón “mi ubicación” grande, pulgar-friendly.

### Estados

| Estado | Qué se ve |
|---|---|
| Cargando | Skeleton del panel + mapa con basemap |
| Sin eventos | “No hay focos en 25 km. Riesgo histórico: bajo” |
| Error de API | Último dato cacheado + “No pudimos actualizar; dato de hace X” |
| Sin permiso de ubicación | Input de búsqueda + “elegí un punto en el mapa” |
| Fuera de cobertura | “Esta fuente no cubre tu región” + capas disponibles |

---

## 4. El mapa

### 4.1 Implementación

`MapCanvas.tsx` es un client component, cargado con `dynamic(..., { ssr: false })` desde un
wrapper cliente (Next 16 no permite `ssr: false` en Server Components).

```tsx
"use client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// useEffect: crear mapa una vez; guardar en useRef.
// Al cambiar datos: source.setData(geojson), no recrear el mapa.
```

Reglas:

- **Una sola instancia** del mapa; los cambios actualizan fuentes, no remontan el componente.
- **GeoJSON en memoria** para eventos (< 5.000 puntos). Si crece, pasar a tiles.
- **Clustering** con `cluster: true` para zoom bajo.
- **`maxzoom`** en capas de calor para no matar el rendimiento.
- **Popups** con `maplibregl.Popup`, no React dentro del mapa.
- **Sin `window`** en SSR: todo el mapa vive en cliente.

### 4.2 Capas por hazard

| Hazard | Capas | Datos |
|---|---|---|
| **Incendios (MVP)** | `heatmap` de focos, `circle` por FRP/confianza, `fill` de densidad histórica, círculo de radio | FIRMS + climatología precomputada |
| **Ciclones** | `line` de trayectoria, `fill` del cono, `circle` de pronóstico por hora, `fill` de radios de viento | NHC/GDACS + probabilidades |
| **Inundación** | raster WMTS de IMERG, `fill` de alertas GDACS, puntos LHASA | GIBS + GDACS + LHASA |
| **Común** | basemap, círculo del usuario, etiquetas de distancia, leyenda | — |

### 4.3 Colores y leyenda

- Riesgo: verde `#22c55e`, ámbar `#f59e0b`, rojo `#ef4444`, extremo `#7f1d1d`.
- Focos: amarillo→naranja→rojo por FRP; baja confianza con opacidad.
- Leyenda fija abajo a la derecha, con la hora del dato.
- Contraste AA; no depender solo del color (íconos + texto).

### 4.4 Performance

- Limitar la consulta FIRMS al **bbox visible** y a 1–5 días.
- Cachear por bbox redondeado (0,5°) y ventana temporal.
- Si hay más de 2.000 puntos, heatmap y cluster; detalle solo al hacer zoom.
- Probar en celular desde el primer día, no al final.

---

## 5. Contratos de datos

```ts
export type Hazard = "fire" | "cyclone" | "flood";

export type LatLon = { lat: number; lon: number };

export type HazardEvent = {
  id: string;
  hazard: Hazard;
  title: string;
  geometry: GeoJSON.Geometry;
  startedAt: string;       // ISO
  updatedAt: string;       // ISO
  severity?: number;       // 0..1 normalizado
  source: "FIRMS" | "EONET" | "GDACS" | "NHC";
  sourceUrl: string;
  distanceKm?: number;
};

export type RiskLevel = "info" | "low" | "moderate" | "high" | "extreme";

export type RiskAssessment = {
  hazard: Hazard;
  level: RiskLevel;
  score: number;           // 0..100
  reasons: { label: string; value: string; weight: number }[];
  confidence: "low" | "medium" | "high";
  updatedAt: string;
  sources: { name: string; url: string; latency: string }[];
  officialUrl?: string;
  disclaimer: string;
};

export type ApiMeta = {
  cached: boolean;
  updatedAt: string;
  latencySeconds: number;
  fallback: boolean;
};
```

Respuesta estándar:

```ts
{ data: T, meta: ApiMeta }
```

### Endpoints

| Ruta | Query | Devuelve |
|---|---|---|
| `GET /api/risk` | `lat, lon, radius, hazard` | `RiskAssessment` |
| `GET /api/events` | `hazard, bbox, days` | `HazardEvent[]` |
| `GET /api/climatology` | `lat, lon, hazard` | percentiles y periodo de retorno |
| `GET /api/health` | — | estado de fuentes y claves |

Validación con Zod; error 400 con mensaje claro; nunca exponer stack traces.

---

## 6. Motor de riesgo (MVP: incendios)

No es un modelo físico. Es un **índice explicable** con pesos visibles:

```text
score = 100 × (
  0.40 × proximidad     // focos activos: distancia, edad, FRP
+ 0.25 × clima de fuego  // FWI o proxy: temp, humedad, viento
+ 0.20 × sequedad        // días sin lluvia, déficit de 30 días
+ 0.15 × historial       // densidad histórica en el radio
)
```

Cada componente se normaliza 0..1 y se muestra como razón:

- “3 focos a 8 km en las últimas 24 h” → 0,82
- “viento 42 km/h, humedad 18 %” → 0,74
- “12 días sin lluvia; 30 días al 40 % de lo normal” → 0,68
- “zona con 4,2 focos/año en noviembre” → 0,55

**Niveles:** 0–24 info, 25–49 bajo, 50–74 alto, 75–100 extremo.

**Confianza:** alta si el dato tiene < 3 h y hay 2+ fuentes; media si tiene < 12 h; baja si es
caché o falta una fuente.

**Regla dura:** si falta el dato principal, no se inventa un score. Se muestra “sin datos” y
se explica qué falta.

### Adaptadores

```ts
interface HazardAdapter {
  id: Hazard;
  getEvents(bbox: BBox, days: number): Promise<HazardEvent[]>;
  assess(point: LatLon, radiusKm: number): Promise<RiskAssessment>;
}
```

El MVP implementa `fire.ts`. `cyclone.ts` y `flood.ts` quedan como stubs con la misma firma.
Así se agrega un hazard sin tocar el mapa ni el panel.

---

## 7. Fuentes, caché y fallback

| Fuente | Dato | Latencia | Caché | Fallback |
|---|---|---|---|---|
| FIRMS | Focos | Horas (URT < 60 s en EE.UU./Canadá) | 5 min | `demo-fallback.json` |
| POWER | Clima diario | 2–3 días | 24 h | JSON precomputado |
| EONET | Catálogo de eventos | Curado | 10 min | último JSON |
| GDACS | Alertas globales | Minutos | 10 min | último JSON |
| NHC | Cono/probabilidades | Cada advisory | 5 min | último JSON |
| GIBS | Imágenes | Horas | tiles CDN | sin capa |

- **Server-side only:** las claves viven en `web/.env.local` y en Vercel; nunca en el cliente.
- **`fetch` con `next: { revalidate }`** + un LRU en memoria para ráfagas.
- **Cuota FIRMS:** 5.000 transacciones/10 min. Cachear por bbox y no consultar en cada pan.
- **Modo demo:** si una API falla, el mapa y el panel siguen con el último dato y un aviso visible.

Variables:

```bash
FIRMS_MAP_KEY=...        # gratis, obligatoria para fuego
# NHC, GDACS, EONET, POWER y GIBS no requieren clave
```

---

## 8. Histórico y validación

### Precomputar (script offline, no en request)

`web/scripts/build-climatology.ts`:

1. Descarga FIRMS de una región y varios años (archivo, no API).
2. Agrega focos por celda 0,1° y mes → `fire-climatology.json` (< 2 MB).
3. Calcula percentiles de lluvia con POWER (1981–2026) para la región.
4. Guarda `data/*.json` versionados.

En runtime solo se leen esos JSON; no se descargan 20 años desde el navegador.

### Hindcast

- Elegir 2 eventos pasados de la región.
- Reproducir “¿qué habría mostrado la app el día anterior?”.
- Medir: detectado sí/no, anticipación, falsos positivos.
- Guardar resultados en `docs/` para el pitch. Sin esto, el score es una opinión.

---

## 9. Deploy y CI

- **Vercel**, root directory `web`. Preview por PR; producción en `main`.
- Variables en Vercel; `FIRMS_MAP_KEY` solo en server.
- `next build` debe pasar sin red (usar fallback) para que el CI no dependa de APIs.
- **CI nuevo job** `web`:

```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: pnpm, cache-dependency-path: web/pnpm-lock.yaml }
- run: pnpm install --frozen-lockfile
  working-directory: web
- run: pnpm lint && pnpm test && pnpm build
  working-directory: web
```

- `Makefile`: `web-dev`, `web-check`, `web-build` que delegan en `web/`.
- Tests: Vitest para `stats.ts`, `geo.ts` y `risk/fire.ts` (funciones puras). Playwright solo si
  sobra tiempo.

---

## 10. Plan de 12 horas (deadline domingo)

| Bloque | Qué se hace | Corte |
|---|---|---|
| 0–2 h | `create-next-app`, Tailwind, layout, mapa con basemap y un punto | — |
| 2–4 h | Adaptador FIRMS + `/api/events` + capa de focos | Sin clusters |
| 4–6 h | `/api/risk` + motor + panel con razones | Sin histórico |
| 6–8 h | Búsqueda, radio, URL compartible, estados | Sin geolocalización |
| 8–10 h | Climatología precomputada + capa histórica | Solo región demo |
| 10–11 h | Deploy, pruebas en celular, fallback | — |
| 11–12 h | Video 30 s + submission + buffer | — |

**Línea de corte:** si a las 6 h no hay mapa + panel funcionando, se elimina el histórico y se
queda solo “focos activos + distancia + fuente”. Eso ya cuenta el demo.

---

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| FIRMS sin key o cuota | Pedirla hoy; cachear; fallback JSON |
| API lenta en vivo | Server route + caché + dato de respaldo |
| Mapa no carga en el celular | Probar desde el inicio; basemap liviano |
| Score “inventado” | Pesos visibles, 3 razones, confianza y fuente |
| Confundir con alerta oficial | Disclaimer fijo + botón a la agencia |
| Next 16 + MapLibre en SSR | `dynamic(..., { ssr: false })` y `useRef` |
| Falta de tiempo | Un hazard, una región, un demo |

---

## 12. Guion del demo (30 s)

1. “Esta es mi casa.” (click en el mapa)
2. “La app dice riesgo alto: 3 focos a 8 km, viento 42 km/h, 12 días sin lluvia.”
3. “Este es el dato de NASA, hace 20 minutos.”
4. “Y este es el enlace a la alerta oficial.”
5. “No predice el futuro: te dice qué tan raro es lo que está pasando y qué tan cerca está.”

---

## 13. Decisiones pendientes

1. **Hazard del MVP:** incendios (recomendado, NASA-native, encaja en #8) o ciclones
   (mejor visual, depende de NOAA).
2. **Región demo:** una sola, con datos precomputados.
3. **Reto oficial:** #8 si es fuego, #2 si el peso es estadístico, #5 si es inundación.
4. **Nombre y dominio** de la app.
