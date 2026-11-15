# Rendimiento y recuperación de mapas — 15/11/2026

## Línea base, no resultado de estos cambios

PageSpeed Insights real facilitado por el coordinador, producción `5e1683e`,
15/11 a las 01:13 GMT−6:
[informe móvil](https://pagespeed.web.dev/analysis/https-nasa-space-2026-vercel-app/rvn2u2mz8l?form_factor=mobile).

| Métrica | Móvil | Escritorio |
|---|---:|---:|
| Performance | 57 | 66 |
| FCP | 2,9 s | 0,2 s |
| LCP | 2,9 s | 1,1 s |
| TBT | 2280 ms | 1630 ms |
| CLS | 0 | 0,074 |
| Speed Index | 5,6 s | 1,4 s |

Móvil: Accessibility 96, Best Practices 96, SEO 100; trabajo en hilo principal
3,9 s, ejecución JS 2 s, JS no usado 182 KiB y 12 tareas largas. El Lighthouse
local anterior facilitado por el coordinador tenía Accessibility 96,
Best Practices 100 y SEO 100; no es la misma corrida que PSI.
La API de PSI respondió 429; el informe se obtuvo mediante su interfaz web.
**No hay medición posterior al despliegue de estos cambios y no se afirma una
mejora de puntuación o TBT.**

## Evidencia → cambio → validación

### 1. Píxeles retenidos sin límite

- **Antes:** `web/lib/sar-image.ts` retenía un `Map<string, Promise<ImageData>>`
  por cada URL visitada, sin expulsión. Una vista de 3,88 MP RGBA ocupa unos
  15,52 MB de píxeles; cambiar de fecha podía acumular muchas vistas. Las
  descargas fallidas ya se retiraban, pero sin proteger frente a una petición
  antigua expulsada y un reintento de la misma URL.
- **Cambio:** caché LRU de hasta **32 MiB de píxeles y cuatro entradas**,
  compartiendo promesas por URL. Una imagen mayor que el límite se entrega al
  consumidor, pero no se retiene. Los errores y el timeout de 20 s permiten
  reintento; un fallo antiguo no borra una entrada más reciente. Canvas e imagen
  temporal se liberan en `finally`, también al fallar. El canvas de exportación
  se vacía después de obtener el PNG.
- **Validación:** ocho tests en `web/tests/sar-image.test.ts`: deduplicación,
  liberación, reintento, expulsión por bytes/LRU, imagen sobredimensionada,
  límite por entradas, fallo antiguo y timeout. El límite corresponde a la
  **caché retenida**, no a toda la memoria del navegador: las imágenes en uso,
  descargas en curso, recortes y resultados siguen teniendo coste temporal.

### 2. Estilo bloqueado: espera infinita

- **Antes:** `HomeMap`, `SarMap` y `MapCanvas` solo capturaban el fallo síncrono
  del constructor WebGL. Si el estilo no llegaba, nunca se alcanzaba
  `style.load` y el texto «Cargando mapa…» podía permanecer indefinidamente.
- **Cambio:** error del estilo o límite de **15 s** → estado legible con botón
  de reintento manual. Se retiran mapa, popup, observador y temporizador;
  desmontar ejecuta la misma limpieza idempotente. Un fallo de capa después
  de cargar el estilo muestra un aviso sin ocultar las capas útiles.
- **Validación:** ESLint focal correcto. La recuperación visual real ante
  bloqueo de Carto/WebGL y al navegar requiere verificación en navegador;
  no se declara comprobada mediante estos tests unitarios.

### 3. Render y actualización innecesarios

- **Antes:** se usaba el `devicePixelRatio` completo y `SarMap` volvía a enviar
  ambas imágenes al cambiar cualquiera de ellas, incluso inmediatamente
  después de crear las fuentes. El encuadre inicial se repetía.
- **Cambio:** `pixelRatio` máximo de **2**, sin alterar píxeles de análisis,
  umbrales ni imágenes fuente. En DPR 3, el framebuffer pasa de 9 a 4 píxeles
  por píxel CSS (reducción geométrica de aproximadamente 56 %, **no una
  medición de rendimiento**). `SarMap` actualiza únicamente la imagen cuyo
  URL o extensión cambia y no repite su encuadre inicial. `HomeMap` evita
  repetir encuadres idénticos y no anima el primero. `MapCanvas` no reenvía
  objetos de capas sin cambios, por ejemplo al cambiar de idioma.
- **Sin cambio innecesario:** `maplibre-gl/src/util/worker_pool.ts` de la versión
  instalada ya configura **un worker en Chrome**; no se añadió otro límite.
  Los mapas ya se cargan con `next/dynamic` desde componentes cliente; se
  mantuvo ese límite de chunks. No se modificaron `next.config.ts` ni deps.
- **Validación:** revisión de la API instalada de `pixelRatio`, `updateImage`
  y ciclo de workers. La mejora de TBT requiere una nueva corrida de PSI
  después de desplegar; el cambio no elimina el coste de parsear MapLibre.

### 4. Idioma, accesibilidad y comunicación honesta

- **Antes:** cargas, errores, leyendas, enlaces de popups y nombres accesibles
  de mapas estaban en español fijo. Las áreas roja/amarilla de la leyenda
  podían leerse como zonas oficiales.
- **Cambio:** `useLocale()` en los tres mapas; textos de popup vía ref o
  propiedades GeoJSON traducidas y `setData()`, sin recrear MapLibre al cambiar
  ES/EN. Se cierra el popup abierto al cambiar idioma para no retener texto
  anterior. Canvas y botones de zoom/atribución reciben nombres traducidos.
  Estados de carga/error usan `role="status"` y el botón de reintento conserva
  el nombre visible como nombre accesible. Las áreas dicen explícitamente
  **«estimada, no oficial»**; HH fuerte se presenta como vegetación inundada
  **posible**, no una causa confirmada.
- **Contraste revisado, sin cambio de paleta:** los tokens actuales de
  `web/app/globals.css` dan blanco sobre `#5266eb` **4,71:1**, blanco sobre
  aviso `#946200` **5,24:1**, y texto `#5a5f6e` sobre blanco **6,37:1**.
  El naranja anterior `#e8a317` daría **2,17:1** con blanco, pero no es el token
  actual. Cálculo WCAG de luminancia sRGB, no una nueva auditoría Lighthouse.

## Comandos y alcance

- `pnpm --dir web exec vitest run tests/sar-image.test.ts tests/sar-change.test.ts tests/geo.test.ts tests/hazard-style.test.ts`
  → **4 archivos, 28 tests correctos**.
- `pnpm --dir web exec eslint components/HomeMap.tsx components/SarMap.tsx components/MapCanvas.tsx lib/sar-image.ts tests/sar-image.test.ts`
  → correcto.
- `pnpm --dir web exec tsc --noEmit --incremental false` → en la primera
  verificación solo falló en trabajo paralelo ajeno:
  `web/app/api/_lib/query.ts:5,6,8` (entrada de `ZodCoercedNumber<unknown>`).
  No se modificó ese archivo.

Sin build general, operaciones de escritura Git ni dependencias nuevas.
Sin cambios a `sar-change.ts`, bandas HH/HV, ciencia, manifiestos/granules,
descarga HDF5, ubicación automática o fuentes de datos.
Pendiente del coordinador: compilar la integración, comprobar mapas ES/EN
y bloqueos de estilo/teselas en desktop y móvil, y repetir PSI en el preview
publicado. Cambios de código y este informe asistidos por IA (GPT Sol).
