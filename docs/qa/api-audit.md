# Auditoría QA de APIs

> **Estado:** auditoría del 2026-11-15 sobre `develop` @ `9256c87` y el deploy
> `https://nasa-space-2026.vercel.app`. Solo lectura: no se corrigió código.
> Reproducciones hechas con `curl` GET sin parámetros destructivos, sin claves FIRMS y sin
> emitir avisos reales (`test=1` solo cuando se indica).
> Contraste normativo: [`../estado.md`](../estado.md), [`../producto/alertas.md`](../producto/alertas.md),
> [`../producto/nisar.md`](../producto/nisar.md), [`../tecnico/fuentes.md`](../tecnico/fuentes.md),
> [`../tecnico/arquitectura.md`](../tecnico/arquitectura.md) y `AGENTS.md`.

## Resumen

| ID | Severidad | Título | Endpoint |
|---|---|---|---|
| BUG-API-1 | **Crítica** | Coordenadas ausentes caen a `(0,0)` y responden 200 «sin alertas» | events, alerts, assess, nisar/search |
| BUG-API-2 | **Alta** | `?hazard=` se ignora: `test=1` siempre devuelve el demo de incendio | alerts |
| BUG-API-3 | **Alta** | «Sin dato» se presenta como vigente / fuente OK | assess, events |
| BUG-API-4 | **Alta** | `meta` miente frescura: `updatedAt` = hora de respuesta, `cached` fijo, sin `latencySeconds` | todos |
| BUG-API-5 | Media | `dedupe` borra alertas reales por cercanía a un GDACS viejo | events, alerts, overlays |
| BUG-API-6 | Media | `nisar/browse` y `nisar/search` sin timeout, sin tope de tamaño y con título de CMR sin validar | nisar/* |

No se reporta como falla la ausencia de eventos: el 15/11 no había tsunami ni ciclón activo y
`ptwc`/`nhc` con `count: 0` es correcto. Los hallazgos de abajo se demuestran con el
comportamiento del código o de la respuesta, no con «no hay eventos».

---

## BUG-API-1 — Coordenadas ausentes caen a `(0,0)` y responden 200 «sin alertas»

**Severidad:** Crítica (falso negativo silencioso: un cliente sin `lat`/`lon` recibe «todo
tranquilo» en vez de un 400).

**Evidencia**
- `web/app/api/events/route.ts:8-9` — `z.coerce.number()` sobre `url.searchParams.get("lat")`,
  que devuelve `null` cuando falta el parámetro.
- `web/app/api/alerts/route.ts:27-28`, `web/app/api/assess/route.ts:11-12`,
  `web/app/api/nisar/search/route.ts:6-7` — mismo patrón.
- `node_modules/zod/v4/core/schemas.js:636-641` — con `coerce`, Zod hace `Number(payload.value)`
  **antes** de validar; `Number(null) === 0` y `Number("") === 0`. Ambos pasan `.min(-90).max(90)`.

**Reproducción**
```bash
curl -s -w '\n%{http_code}\n' 'https://nasa-space-2026.vercel.app/api/events'
curl -s -w '\n%{http_code}\n' 'https://nasa-space-2026.vercel.app/api/events?lat=&lon='
curl -s 'https://nasa-space-2026.vercel.app/api/alerts' | head -c 200
curl -s 'https://nasa-space-2026.vercel.app/api/assess' | head -c 200
curl -s 'https://nasa-space-2026.vercel.app/api/nisar/search?lat=&lon='
```

**Actual**
- `/api/events` → `HTTP 200`, `{"data":{"alerts":[],"history":[]},"meta":{…"fallback":false,
  "fallbackSources":[], "sources":[{"id":"eonet","ok":true,"count":0},…]}}`
- `/api/alerts` → `HTTP 200`, `"point":{"lat":0,"lon":0}`.
- `/api/assess` → `HTTP 200`, `"current":{…"count":0,"available":true,"fallback":false}`.
- `/api/nisar/search` → `HTTP 200`, `{"data":null}`.

**Esperado**
`HTTP 400 {"error":"Parámetros inválidos","detail":[…]}` cuando `lat` o `lon` faltan, vienen
vacíos o no son numéricos (como ya ocurre con `lat=abc`, que sí da 400). El consumidor no puede
distinguir «no hay peligro en tu punto» de «no me diste tu punto».

---

## BUG-API-2 — `?hazard=` se ignora: `test=1` siempre devuelve el demo de incendio

**Severidad:** Alta. El modo demo documentado en [`../estado.md`](../estado.md) y anunciado por
`/api/health` («`?test=1` genera una alerta de prueba») no permite elegir la amenaza, y el
contrato promete `hazard`.

**Evidencia**
- `web/app/api/alerts/route.ts:34-36` — el esquema declara
  `hazard: z.enum([...]).default("fire")`.
- `web/app/api/alerts/route.ts:42-47` — el objeto que se pasa a `safeParse` **no incluye**
  `hazard`, así que siempre queda el default `"fire"`; la línea 56 lo desestructura ya como
  `"fire"` y la 113 construye el demo con ese valor.
- `web/app/api/alerts/route.ts:35` — el enum además no acepta `tsunami`, `landslide` ni
  `drought`, aunque `docs/producto/alertas.md` §4 define color y áreas para deslizamiento y el
  alcance es multi-amenaza.

**Reproducción**
```bash
curl -s 'https://nasa-space-2026.vercel.app/api/alerts?lat=9.9&lon=-84.1&test=1&hazard=volcano' | head -c 200
curl -s 'https://nasa-space-2026.vercel.app/api/alerts?lat=9.9&lon=-84.1&test=1&hazard=earthquake' | head -c 200
curl -s -o /dev/null -w '%{http_code}\n' 'https://nasa-space-2026.vercel.app/api/alerts?lat=9.9&lon=-84.1&test=1&hazard=meteorito'
```

**Actual**
- `hazard=volcano` → `{"kind":"test","title":"Foco de calor a 8 km [DEMO]", "source":"NASA FIRMS [demo]"}`
- `hazard=earthquake` → idéntico: «Foco de calor a 8 km [DEMO]».
- `hazard=meteorito` → `HTTP 200` con el demo de incendio (no valida).

**Esperado**
- `hazard=volcano` → «Volcán Poás — actividad elevada [DEMO]» (plantilla ya existe en
  `web/lib/alerts.ts:143-152`).
- `hazard=meteorito` → `HTTP 400` con `detail.path:["hazard"]`.
- El demo debe cubrir al menos las amenazas del alcance (tsunami/deslizamiento incluidos) o
  documentar explícitamente las cinco soportadas.

---

## BUG-API-3 — «Sin dato» se presenta como vigente / fuente OK

**Severidad:** Alta (viola la regla de ciencia honesta: sin dato no hay score ni «vigente»).

**Evidencia y reproducción**

1. **Un timeout se disfraza de respuesta correcta y borra las alertas oficiales.**
   `web/app/api/alerts/route.ts:12-24` (`withBudget`) resuelve el valor de respaldo en vez de
   rechazar, así que `overlayResult.status === "fulfilled"` siempre (línea 101) aunque GDACS,
   EONET, USGS/OVSICORI y el presupuesto de 8 s hayan fallado. Resultado: `official: []`
   (línea 110), `overlays.sources = []` y `fallbackSources` fijo en `["osm","eonet"]`
   (líneas 71-82, 102-103): nunca menciona `gdacs` ni `seismic`, y la lista queda vacía como si
   no hubiera peligro.
   ```bash
   curl -s 'https://nasa-space-2026.vercel.app/api/alerts' | head -c 260
   ```
   Actual: `"alerts":[], "fallback":true, "fallbackSources":["osm","eonet"], "durationMs":8007`
   — se agotó el presupuesto de 8 s y la ruta respondió como si hubiera consultado todo.
   Esperado: si una fuente no respondió, que se nombre en `fallbackSources` (`gdacs`,
   `seismic`) y que la UI pueda decir «no pudimos consultar GDACS/EONET» en vez de mostrar una
   lista vacía; `durationMs ≈ 8007` con `fallbackSources` incompleto es la firma del problema.

2. **Punto sin cobertura → `available: true`.** `web/lib/sources/gibs.ts:144-167` marca
   `available` en cuanto un mosaico MVT responde, aunque no traiga ningún foco; con BUG-API-1 el
   resultado es `"current":{"count":0,"available":true,"fallback":false}` para el golfo de
   Guinea. `available` debería significar «hay observación para este punto», no «el servidor
   contestó», para que `risk.level` caiga a `info` cuando no hay dato (AGENTS.md: «sin dato
   principal no hay score»).

3. **Fecha ilegible = vigente para siempre.**
   `web/lib/alert-rules.ts:148-149`:
   ```ts
   const reported = Date.parse(alert.date);
   if (!Number.isFinite(reported)) return true;
   ```
   Una alerta con `date` vacío, `"null"` o formato raro nunca caduca y se queda en «activas».
   Esperado: dato sin fecha válida → no vigente (o al historial con «fecha desconocida»).

4. **`meta.sources` cuenta lo que el usuario no ve.**
   ```bash
   curl -s 'https://nasa-space-2026.vercel.app/api/events?lat=9.93&lon=-84.08&radius=450'
   ```
   Actual: `{"id":"eonet","ok":true,"count":3,"latest":"2026-05-30T00:00:00Z"}` mientras
   `data.alerts` no contiene ningún evento EONET (los 3 son incendios ocultos por
   `SHOW_FIRES=false`, `web/lib/sources/overlays.ts:90,191-194`, y/o vencidos por
   `partitionCurrent`). El panel «Fuentes en vivo» dirá «EONET: 3, último 30/05» con lista vacía.
   Esperado: `count` reflejando lo mostrado, o un campo `filtered`/`hidden` para explicar la
   diferencia; y una etiqueta de «sin eventos nuevos» distinta de «sin respuesta», como pide
   `docs/tecnico/fuentes.md` §«Estado de las fuentes».

**Nota:** `ptwc` y `nhc` en `count: 0, ok: true` **no** son falla: no había boletines ni
ciclones activos el 15/11. La falla es que el mismo `count: 0` se usa para «sin eventos» y para
«fuente caída sin datos», y que `available:true` se emite sin observación.

---

## BUG-API-4 — `meta` miente frescura y no cumple el contrato

**Severidad:** Alta para la promesa del producto («hora y latencia de cada dato»).

**Evidencia**
- `docs/tecnico/arquitectura.md:187-189` exige `{ cached, updatedAt, latencySeconds, fallback }`.
- `web/lib/types.ts:79-84` (`ApiMeta`) solo tiene `cached`, `updatedAt`, `fallback`,
  `durationMs`: **no existe `latencySeconds`** en ningún endpoint.
- `cached: false` está escrito a mano en `web/app/api/events/route.ts:37`,
  `web/app/api/alerts/route.ts:123`, `web/app/api/assess/route.ts:76`,
  `web/app/api/overlays/route.ts:36`, aunque las fuentes sí pasan por
  `web/lib/cache.ts` (USGS/OVSICORI/RSN 2 min, NHC 10 min, EONET/GDACS 30 min, FIRMS 15 min).
- `updatedAt: new Date().toISOString()` en las mismas líneas: es la hora de la **respuesta**, no
  la del último dato. En `/api/events` la antigüedad real está en `meta.sources[].latest`
  (p. ej. `rsn.latest = 2026-11-13` con `updatedAt = 2026-11-15T07:05Z`).

**Reproducción**
```bash
curl -s 'https://nasa-space-2026.vercel.app/api/events?lat=9.93&lon=-84.08&radius=450' \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(j.meta.updatedAt, j.meta.cached, "latencySeconds" in j.meta)})'
```
Actual: `2026-11-15T07:05:41.315Z false false`.
Esperado: `cached` real (true si sirvió caché), `updatedAt` = dato más antiguo mostrado o por
fuente, y `latencySeconds` presente; o bien corregir `docs/tecnico/arquitectura.md` y `AGENTS.md`
si el contrato cambió. Hoy documento y código no coinciden.

---

## BUG-API-5 — `dedupe` borra alertas reales por cercanía a un GDACS viejo

**Severidad:** Media (puede suprimir un sismo real; no reproducible con el catálogo del 15/11).

**Evidencia**
- `web/lib/sources/overlays.ts:26-41`: si una alerta **no** es GDACS y hay **cualquier** alerta
  GDACS de la misma `category` a **<10 km**, se descarta. No compara fecha ni magnitud.
- `docs/producto/alertas.md` §5 define el mismo evento como «≤40 km **y** ≤5 min» y dice que
  gana el primer reporte marcando «Confirmado por…», no que se borre.
- GDACS consulta 45 días (`web/lib/sources/gdacs.ts:8`), así que un `GDACS-EQ` de hace un mes
  puede eliminar un sismo de OVSICORI/RSN/USGS de hoy. El 15/11 hay `GDACS-EQ-1570339`
  (2026-10-09) en el historial: basta que caiga a <10 km de un sismo nuevo.
- Además, `dedupe` aplica a `/api/alerts` (`web/lib/sources/overlays.ts:319`) y a `/api/events`
  (`:172-177`), pero **no** rellena `alsoReportedBy`, así que el «Confirmado por…» prometido
  tampoco se cumple.

**Reproducción (estática, sin carga)**
```bash
grep -n "official.some" -A6 "web/lib/sources/overlays.ts"
grep -n "40 km" -A3 docs/producto/alertas.md
```
Esperado: dedupe por ventana temporal (≤5 min) y distancia (≤40 km), conservando el primero y
anotando `alsoReportedBy`; nunca descartar una alerta por coincidir con un GDACS de otra fecha.

---

## BUG-API-6 — `nisar/browse` y `nisar/search` sin timeout ni tope, y título de CMR sin validar

**Severidad:** Media (robustez y superficie de proxy; no hay fuga de clave).

**Evidencia**
- `web/app/api/nisar/browse/route.ts:15` — `fetch(…, { redirect: "follow" })` sin
  `AbortSignal.timeout` y sin límite de bytes: `arrayBuffer()` carga lo que devuelva ASF. Si ASF
  se cuelga, la función de Vercel se cuelga hasta el límite de la plataforma. Comparar con
  `web/lib/sources/feeds.ts:14` y `web/lib/sources/seismic.ts:51`, que sí usan 12 s.
- `web/app/api/nisar/browse/route.ts:11` valida `GRANULE_PATTERN`
  (`web/lib/nisar-remote.ts:8`), correcto contra traversal. **Pero**
  `web/app/api/nisar/search/route.ts:22` construye la URL del KML con
  `frameBounds(pass.collection, pass.granule)` usando `entry.title` **tal cual viene de CMR**,
  sin pasar por `GRANULE_PATTERN`, y también sin timeout ni `redirect` acotado. El host queda
  fijo en `nisar.asf.earthdatacloud.nasa.gov`, así que no es SSRF abierto, pero sí una ruta que
  confía en un tercero.
- `web/app/api/nisar/search/route.ts:12-19` — `parseTitle` indexa `p[5]..p[9]` sin comprobar
  longitud: un título con otro formato produce `frame: "undefined_undefined_undefined_undefined"`,
  y `pol`/`date` quedan `undefined`/`null`. Ese frame basura puede ser el «mejor» por número de
  fechas y devolver `bounds` de otro sitio. `web/app/api/nisar/search/route.ts:71` ordena solo
  por cantidad de fechas, sin comprobar que el frame contenga el punto pedido.
- `web/app/api/nisar/search/route.ts:73` devuelve `200 {"data":null}` sin `meta` ni motivo
  («no hay pasadas» vs «no hay KML» se confunden); el 502 de la línea 93 sí distingue.

**Reproducción**
```bash
curl -s -w '\n%{http_code}\n' 'https://nasa-space-2026.vercel.app/api/nisar/search?lat=10.4&lon=-85.1'
curl -s -w '\n%{http_code}\n' 'https://nasa-space-2026.vercel.app/api/nisar/browse?c=NISAR_L2_GCOV_V1&g=../../etc/passwd'
```
Actual: `nisar/search` hoy responde `{"data":null}` (200) sin explicar si es falta de pasadas o
de esquinas; el `browse` inválido responde 400 (correcto).
Esperado: timeout explícito (≈12 s), `Content-Length` máximo, `pass.granule` validado con
`GRANULE_PATTERN` antes de cada fetch, `parseTitle` con guarda de longitud, y `{data:null}` con
`meta.reason` (`sin-pasadas` / `sin-esquinas`).

---

## Matriz de contratos verificados

Leyenda: ✔ cumple · ✖ falla · ⚠ parcial / no verificable sin build.

| Endpoint | Entrada | 400 si falta coord | Forma `{data,meta}` | `meta.cached` real | `latencySeconds` | `test` / `hazard` | Estado |
|---|---|---|---|---|---|---|---|
| `/api/events` | `lat`, `lon` (req), `radius` 5–600 (def. 150) | ✖ → 200 con (0,0) | ✔ `data.alerts/history`, `meta.sources` | ✖ fijo `false` | ✖ | n/a | BUG-1, 3, 4, 5 |
| `/api/alerts` | `lat`, `lon` (req), `radius` 5–100 (def. 50), `test` 0/1, `hazard` | ✖ → 200 con (0,0) | ✔ `data.alerts/generatedAt/point/radiusKm` | ✖ fijo `false` | ✖ | `test=1` ✔ demo; `hazard` ✖ ignorado; `hazard` inválido ✖ 200 | BUG-1, 2, 4, 5 |
| `/api/alerts?test=0` | idem | ✖ | ✔ | ✖ | ✖ | devuelve alertas reales; `Cache-Control` 60 s | OK salvo BUG-1/4 |
| `/api/alerts?test=1` | idem + `hazard` | ✖ | ✔ | n/a | ✖ | `Cache-Control: no-store` ✔; etiqueta `[DEMO]` ✔ | BUG-2 |
| `/api/assess` | `lat`, `lon`, `radius` 5–100, `date` `YYYY-MM-DD` | ✖ → 200 con (0,0) | ✔ `data.current/memory/climate/risk` | ✖ fijo `false` | ✖ | `date` inválido ✔ 400 | BUG-1, 3, 4 |
| `/api/nisar/search` | `lat`, `lon` | ✖ → `{data:null}` 200 | ⚠ sin `meta` | n/a | ✖ | 502 solo si CMR/KML falla | BUG-1, 6 |
| `/api/nisar/browse` | `c` ∈ colecciones, `g` regex granule | ✔ 400 si no cumple | binario `image/png` | n/a | n/a | sin timeout ni tope de bytes | BUG-6 |
| `/api/health` | — | n/a | `status/app/version/time/routes/env/sources` | n/a | n/a | informa `FIRMS_MAP_KEY` solo como «configurada / no configurada» ✔ sin fuga | ⚠ `routes` omite `/api/nisar/*` y `/api/health` se lista a sí mismo |

### Detalle `/api/alerts?test=0|1` × `hazard`

| `test` \ `hazard` | `fire` (def.) | `earthquake` | `volcano` | `flood` | `storm` | `tsunami` / `landslide` |
|---|---|---|---|---|---|---|
| `0` | alertas reales; `hazard` no aplica | = | = | = | = | = |
| `1` | «Foco de calor a 8 km [DEMO]» ✔ | ✖ devuelve incendio | ✖ devuelve incendio | ✖ devuelve incendio | ✖ devuelve incendio | ✖ 200 + incendio (debería 400 o soportar) |

`test=1` correctamente fuerza `Cache-Control: no-store` (`web/app/api/alerts/route.ts:133-135`),
así que el demo no queda cacheado en CDN.

---

## Fuera de alcance de esta auditoría (para el coordinador)

- No se ejecutó `pnpm build`, `lint` ni `test` (instrucción explícita); `web/tests/events.test.ts`
  y `web/tests/freshness.test.ts` existen y probablemente ya cubren `isCurrent`/`partitionCurrent`,
  pero no verifican el coerce de `null` ni el paso de `hazard`.
- No se usó navegador ni se consultó FIRMS con clave.
- Sin acciones de git ni cambios de código: este informe es el único archivo escrito.
