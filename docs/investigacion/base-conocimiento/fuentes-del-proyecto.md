# Parámetros vigentes del proyecto

> **Fuente de verdad:** código de `web/` al **15/11/2026**. Este documento traduce constantes a
> lenguaje humano; si hay conflicto, gana el código.
> **No** inventa configuración ausente. Si un valor no está en el código, se dice.
> **Relación con otros documentos:** [`../../producto/alertas.md`](../../producto/alertas.md)
> explica las reglas y [`../../producto/nisar.md`](../../producto/nisar.md) el método; este
> archivo es la foto técnica de constantes para auditar el código.

## 1. Radar NISAR

| Parámetro | Valor vigente | Archivo | Nota |
|---|---|---|---|
| Umbral de cambio | **38** (niveles de 8 bits, 0–255) | `lib/sar-change.ts`, `scripts/build-nisar.mjs` | Diferencia de HH suavizado. |
| Oscuro en ambas | **70** | `lib/sar-change.ts`, `scripts/build-nisar.mjs` | Exclusión exploratoria; **no** es máscara de agua. |
| Cobertura mínima | **0.85** (85 %) | `scripts/build-nisar.mjs` | Se omite una fecha si cubre menos. |
| Cobertura mínima en cliente | **0.5** (50 %) | `lib/sar-image.ts` | Si una de las dos fechas cubre menos, error. |
| Suavizado | Media móvil **5×5** de HH | `lib/sar-change.ts` | Ignora píxeles sin dato. |
| Corrección de brillo (cliente) | **Mediana** de las diferencias | `lib/sar-change.ts` | Submuestrea cada 7 píxeles. |
| Corrección de brillo (precálculo) | **Media del cuadro completo** de HH | `scripts/build-nisar.mjs` | No es equivalente a la mediana. |
| Detecciones informativas | `minPct = 5` | `lib/events.ts` | Suma de más brillante + más oscuro. |
| Próxima pasada | **+12 días** | `lib/sar-change.ts` | Oportunidad orbital; no confirma adquisición. |
| Zona más cercana | `maxKm = 60` | `lib/sar.ts` | Si el punto no cae dentro de una zona. |
| Radio “cerca de usted” | **100 km** | `lib/events.ts` | `NEAR_KM`. |
| Radio de la portada | **450 km** | `components/HomeView.tsx` | `REGION_KM`; cubre Costa Rica. |
| Radio del score de fuego (portada) | **25 km** | `components/HomeView.tsx` | `/api/assess?radius=25`. |
| Ventana del estudio | **0.22°** por lado | `components/SurfaceStudy.tsx` | ~24 km; recorte alrededor del punto. |
| Timeout de imágenes | **20 s** | `lib/sar-image.ts` | Decodificación en canvas. |
| Caché de imágenes | **32 MiB / 4 entradas** | `lib/sar-image.ts` | LRU. |
| Timeout de `/api/nisar/search` en cliente | **15 s** | `components/SurfaceStudy.tsx` | `AbortSignal.timeout`. |

### Zonas precalculadas

| Zona | Frame | Base | Entradas | Validadas | Provisionales | Primer → último |
|---|---|---|---|---|---|---|
| Palo Verde | `170_D_083_4005` | 2026-07-20 | 10 | 2 | 8 | 2026-06-26 → 2026-11-05 |
| Caño Negro | `170_D_083_4005` | 2026-07-20 | 10 | 2 | 8 | 2026-06-26 → 2026-11-05 |
| Rincón de la Vieja | `170_D_083_4005` | 2026-07-20 | 10 | 2 | 8 | 2026-06-26 → 2026-11-05 |
| Tortuguero | `004_A_007_4005` | 2026-06-26 | 11 | 2 | 9 | 2026-06-26 → 2026-11-05 |

Totales del manifiesto: **41 entradas**, **33 provisionales**, **8 validadas**, **11 fechas
únicas** (2026-06-26 a 2026-11-05), ciclos 23–35. Tamaño HDF5 declarado en el campo `sizeMB`:
**3.872–5.838 MB** por gránulo. `data/nisar.json` pesa ~36 KB; las imágenes ~1,8 MB.

La vista `SAR_ZONES` **oculta** las adquisiciones anteriores a la base. Por eso Palo Verde, Caño
Negro y Rincón muestran 9 fechas, no 10; Tortuguero muestra 11. El manifiesto y los archivos
originales se conservan para trazabilidad.

## 2. Radios de alerta

### ¿Le afecta? (`affects`)

| Amenaza | Regla vigente | Archivo |
|---|---|---|
| Sismo | M4+ a ≤50 km; M5+ a ≤150 km; M6,5+ a ≤400 km; **sentido a ≤60 km** | `lib/alert-rules.ts` |
| Tsunami | Nivel rojo o naranja | `lib/alert-rules.ts` |
| Ciclón/tormenta | ≤500 km, o nivel serio | `lib/alert-rules.ts` |
| Incendio | ≤25 km | `lib/alert-rules.ts` |
| Volcán | ≤30 km | `lib/alert-rules.ts` |
| Inundación | ≤50 km, o nivel serio a ≤150 km | `lib/alert-rules.ts` |
| Lluvia fuerte | Siempre que el pronóstico la marque | `lib/alert-rules.ts` |
| Otras | ≤50 km, o nivel serio a ≤300 km | `lib/alert-rules.ts` |

Los valores históricos del encargo (50/150/400 km) siguen vigentes para sismo; el código agrega
la regla de “sentido” a 60 km. No son polígonos oficiales.

### ¿Está vigente? (`MAX_AGE_HOURS`)

| Amenaza | Horas |
|---|---|
| Sismo | 72 |
| Tsunami / lluvia | 24 |
| Inundación / ciclón / incendio | 168 |
| Volcán | 720 |
| Otras | 168 |
| FIRMS | 24 |
| NHC | ∞ (mientras esté publicado) |

### ¿Está en curso? (`ONGOING_HOURS`)

| Amenaza | Horas |
|---|---|
| Sismo | 1 |
| Tsunami | 12 (solo rojo/naranja) |
| Volcán / deslizamiento | 24 |
| Inundación / ciclón | 48 |
| NHC / Open-Meteo | Mientras estén publicados |
| Otras | 24 |

### Radios visuales (`alertZones`)

| Amenaza | Rojo | Amarillo |
|---|---|---|
| Sismo | `10^(0,45·M − 1,1)`, 1–150 km | `10^(0,45·M − 0,3)`, 5–400 km |
| Volcán | 5 km | 15 km |
| Tsunami rojo | 300 km | 1.000 km |
| Tsunami naranja | 0 km | 500 km |
| Huracán | 100 km | 300 km |
| Tormenta/depresión | 50 km | 200 km |
| Inundación | 10 km | 30 km |
| Lluvia naranja | 10 km | 25 km |
| Lluvia informativa | 0 km | 25 km |
| Deslizamiento | 2 km | 5 km |
| Radar / informativo | Sin área | Sin área |
| Otras | 5 km | 20 km |

**No** son áreas de afectación ni zonas oficiales. La fórmula de sismo es una aproximación
magnitud–distancia para sismos superficiales, no un mapa de sacudida.

## 3. Deduplicación y calidad

| Regla | Valor |
|---|---|
| Misma categoría | Sí (normaliza `EQ`, `TC`, `FL`, `VO`, `WF`). |
| Fuentes distintas | Sí; no deduplica dos reportes de la misma fuente. |
| Ventana temporal | ≤5 min. |
| Distancia | ≤40 km para sismos; ≤10 km para el resto. |
| Calidad | `revisado` gana sobre `preliminar`. |
| Sismos listados | M≥3,5 o sentidos; historial M4+ de 30 días. |

## 4. Consultas, caché y timeouts

| Fuente | Consulta | Caché | Timeout / presupuesto | Límite |
|---|---|---|---|---|
| USGS | 30 días, M≥2,5, bbox 600 km | 2 min | 5 s / 5,5 s | `limit=200` |
| OVSICORI | `latest.geojson` | 2 min | 5 s / 5,5 s | Sin CORS; stale >12 h |
| RSN | RSS de sentidos | 2 min | 5 s / 5,5 s | — |
| PTWC/NTWC | Atom PHEB + PAAQ | 2 min | 12 s | 2 feeds |
| NHC | `CurrentStorms.json` | 10 min | 12 s | Solo activos |
| Open-Meteo | Pronóstico 2 días, precipitación horaria | 30 min | 12 s | Alerta ≥50 mm/24 h; naranja ≥100 |
| GDACS | 45 días, 6 tipos | 30 min | 12 s | 600 km; sequía por país |
| EONET abiertos | `status=open`, bbox 600 km | 30 min | 12 s | `limit=200` |
| EONET historial | `status=closed`, 365 días | 30 min | 12 s | `limit=200` |
| FIRMS | 3 VIIRS, bbox 300 km, 5 días | 15 min | 12 s | Reporta 24 h; clave |
| GIBS | Tile MVT del día | 5 min (hoy) / 7 días (pasado) | 8 s | Zoom 6; matriz 1 km |
| POWER | Diario 1981–hoy | 24 h | 12 s | `-999` se filtra |
| Overpass | Caminos/áreas, radio+6 km | 24 h | 7 s por endpoint | 2 endpoints; simplifica >80k coords |
| NISAR CMR | `point`, 2 colecciones | 6 h | 6 s | 2 MiB; `page_size=200` |
| NISAR browse | PNG de ASF | 1 día / 7 días CDN | 8 s | 24 MiB; 2 redirecciones |

### Presupuestos de las rutas

| Ruta | Radio | Caché CDN | Notas |
|---|---|---|---|
| `/api/events` | 5–600, default 150 | 60 s, SWR 300 s | Agrega 8 fuentes; 6 s por fuente, 6,5 s sismos. |
| `/api/alerts` | 5–100, default 50 | 60 s, SWR 300 s | Fuego 6 s, clima 4,5 s, overlays 8 s. |
| `/api/assess` | 5–100, default 50 | 300 s, SWR 600 s | Fuego actual + memoria + clima; 6 s. |
| `/api/overlays` | 5–100, default 50 | 1.800 s, SWR 1 día | OSM + EONET + GDACS + sismos. |
| `/api/nisar/search` | N/A | 6 h, SWR 1 día | `lat`, `lon` obligatorios. |
| `/api/nisar/browse` | N/A | 7 días CDN | `c`, `g` validados. |

## 5. Validación de entrada

- `lat` y `lon` son obligatorios; no se acepta vacío, `null`, `NaN` ni rango fuera de
  −90..90 / −180..180.
- `radius` es numérico, mínimo 5, máximo según ruta.
- Parámetros repetidos o desconocidos devuelven **400**.
- Fechas del estudio: `YYYY-MM-DD` real; `2026-02-31` se rechaza.
- `test=0` nunca incluye demo; `test=1` aísla la simulación.

## 6. Discrepancias detectadas

| Documento | Dice | Código dice | Acción |
|---|---|---|---|
| `web/README.md` y `/api/health` | FIRMS “2 días” | `feeds.ts` pide **5 días** y reporta 24 h | Documentar 5 días; el README/health están desactualizados. |
| `docs/tecnico/fuentes.md` | FIRMS caché 5 min | `feeds.ts` usa **15 min** | El código manda; conviene corregir la tabla en otro cambio. |
| `docs/tecnico/fuentes.md` | GDACS caché “—” | `gdacs.ts` usa **30 min** | Documentar 30 min. |
| `docs/producto/nisar.md` | “descarga unos 70 MB” | No hay `.cache` versionado; el volumen depende de fechas | Es una estimación, no un valor medido. |

No se modificaron esos documentos en este trabajo para no pisar cambios locales.

## 7. Lo que no está configurado

- No hay base de datos, auth, cola de trabajos ni cron.
- No hay descarga de HDF5 en runtime.
- No hay procesamiento Python de NISAR en el repositorio.
- No hay score de inundación, deslizamiento, sismo, volcán ni tsunami.
- No hay alertas push del servidor; solo avisos del navegador con la página abierta.

## Referencias internas

- Método NISAR: [`../../producto/nisar.md`](../../producto/nisar.md)
- Reglas de alerta: [`../../producto/alertas.md`](../../producto/alertas.md)
- Fuentes: [`../../tecnico/fuentes.md`](../../tecnico/fuentes.md)
- Auditoría: [`../../qa/challenge-review.md`](../../qa/challenge-review.md)
- Correcciones: [`../../qa/correcciones-ciencia.md`](../../qa/correcciones-ciencia.md)
