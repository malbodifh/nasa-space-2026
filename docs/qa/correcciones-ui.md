# Correcciones de UI del estudio y la portada — 2026-11-15

Implementación sobre `develop`, sin escritura Git, sin dependencias nuevas, sin `.env`, sin
build general. Se preserva el i18n ES/EN existente (HomeView, SurfaceStudy, RadarView,
EventList, CompareSlider, SarCompare, SarExplainer, AlertToasts, `useAlertNotifications`,
`lib/display-i18n.ts`) y el demo local de la portada.

- Inicio de la tanda: **2026-11-15 01:30 UTC−06:00**; HEAD `5e1683e`; rama `develop`.
- Entorno: Node `v26.11.1` (el proyecto declara 22.x), pnpm `11.28.5`, Vitest 5.1.0.
- Informe de origen: [baseline.md](baseline.md) (TEST-1, TEST-2 y TEST-4).
- Asistencia de IA: implementador DeepSeek, con archivos asignados por el coordinador.

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `web/lib/study-input.ts` | Nuevos helpers puros `parseStudyPoint`, `parseStudyDate`; `parseStudyInput` los compone. |
| `web/components/SurfaceStudy.tsx` | Validación previa a la conversión numérica; error ≠ falta de imágenes; consulta parcial; reinicio del par elegido; timeout de red. |
| `web/components/HomeView.tsx` | `meta.fallback` deja de mostrarse como verde «Sin alertas»; estado terminal para `assess`; timeout de red. |
| `web/tests/study-input.test.ts` | Casos de borde de coordenadas y fechas reales. |
| `web/tests/study-wiring.test.ts` | Nuevo: cableado estático de ambos componentes (entorno Vitest `node`, sin DOM). |
| `docs/qa/correcciones-ui.md` | Este informe. |

No se tocaron `app/api`, `lib/sources`, `lib/sar*`, mapas, `SiteHeader`/`SiteMenu`/
`LocaleProvider`/`acerca` ni traducciones existentes. `web/components/HomeView.tsx` estaba
marcado `UU` en el índice por una sesión previa; solo se editó el árbol de trabajo, sin
resolver ni registrar el conflicto.

## ID → cambio → prueba

| ID | Corrección | Pruebas |
|---|---|---|
| **TEST-1** | `parseStudyPoint` exige lat y lon presentes, no vacíos tras `trim`, numéricos, finitos y en rango ±90 / ±180. `parseStudyDate` exige `AAAA-MM-DD` de día real. Con entrada inválida la vista muestra el mensaje ES/EN y **no** monta la consulta SWR (la key es `null`), no calcula el par ni llega a `displayDate`: sin crash ni `RangeError`. | `study-input.test.ts` (vacíos, `NaN`, `Infinity`, `0x10`, `1e999`, fuera de rango, `2026-02-31`, `2026-02-29`, `2026-04-31`, `no-fecha`, vacío, ISO con hora) + `study-wiring.test.ts` |
| **TEST-2** | `catalogFailed` = fallo real (red, 502, timeout) o vacío con `meta.fallback`; muestra «No pudimos consultar el catálogo; esto no significa que no haya imágenes» con botón que llama al `mutate` de SWR. `catalogEmpty` exige respuesta 200 válida, `data: null` y sin `fallback`; solo entonces dice que el catálogo «respondió y no devolvió imágenes». `catalogPartial` avisa consulta parcial cuando hay error o `fallback` pero todavía hay datos. | `study-wiring.test.ts`; `study-input.test.ts` no aplica |
| UI-PAR | Al cambiar de zona/punto se descarta la elección previa y vuelve el par por defecto: reinicio en render al cambiar `sourceKey` (sin `setState` en efecto, que ESLint rechaza) más `scopedStudyPair` como segunda barrera. | `study-wiring.test.ts` |
| **TEST-4 (parcial)** | Si `/api/assess` falla o no trae nivel, la tarjeta de condiciones muestra «sin datos» / «no data» en lugar de «…» indefinido. | `study-wiring.test.ts` |
| UI-FALLBACK | Con `events.meta.fallback === true` y sin alertas relevantes, el titular deja de ser verde: tono neutro, texto «Información incompleta: no pudimos revisar todas las fuentes» y aviso de que pueden faltar eventos. Con alertas relevantes se añade la nota de revisión incompleta. | `study-wiring.test.ts` |
| UI-TIMEOUT | `fetcher` de HomeView y SurfaceStudy usa `AbortSignal.timeout(15_000)`; el demo local sigue disponible aunque falle la red. | `study-wiring.test.ts` |

## Validación ejecutada

| Comando | Resultado |
|---|---|
| `pnpm --dir web exec vitest run tests/study-input.test.ts tests/study-wiring.test.ts` | **PASS**: 2 archivos, **72 tests** |
| `pnpm --dir web exec eslint components/HomeView.tsx components/SurfaceStudy.tsx lib/study-input.ts` | **PASS**, exit 0, sin salida |
| `pnpm --dir web exec eslint` sobre los dos tests nuevos | **PASS**, exit 0 |
| `pnpm --dir web exec tsc --noEmit --incremental false` | **PASS**, sin errores de tipos |
| `pnpm --dir web test` (suite completa) | **PASS**: 26 archivos, **316 tests**, 94,62 s |

Warnings conocidos y ajenos: engine Node declarado `22.x` frente a Node 26 local; `vitest.config.ts`
cargado como CommonJS; plugin `vite-tsconfig-paths` redundante. No se cambió configuración.
No se ejecutó `build` ni se escribió `.next`.

## Evidencia de TEST-1 (evaluación sin red)

`parseStudyPoint` / `parseStudyDate` se prueban como funciones puras con `URLSearchParams`, que es
lo que entrega `useSearchParams`:

```text
lat=10                 → { status: "missing" }        (ya no produce el punto falso (10, 0))
lat=&lon=              → { status: "invalid" }        (ya no produce (0, 0))
lat=NaN&lon=-85        → { status: "invalid" }
lat=999&lon=999        → { status: "invalid" }
lat=-90&lon=-180       → válido (límites incluidos)
lat=0&lon=0            → válido (cero explícito, no vacío)
fecha=2026-02-31       → { status: "invalid" }
fecha=2024-02-29       → válido (bisiesto real)
fecha=               → { status: "invalid" }
fecha=no-fecha         → { status: "invalid" }
```

## Qué queda pendiente de prueba manual

Nada de esto se certifica desde acá; requiere navegador y árbol congelado:

1. **M10**: repetir `/superficie?lat=10`, `?lat=&lon=`, `?lat=999&lon=999`, `?lat=NaN&lon=-85`,
   `?lat=10&lon=-85&fecha=no-fecha` y `?lat=10&lon=-85&zona=inexistente`. Verificar mensaje, que
   **no** aparezca ninguna petición a `/api/nisar/search` en Network y que no haya crash.
   La zona desconocida cae hoy a búsqueda remota por punto; su salida recuperable no se probó.
2. **M09 / M11 / M13**: inducir offline, HTTP 502 y respuesta vacía controlada. Confirmar que el
   texto de error y el de «el catálogo respondió…» son mutuamente excluyentes y que el botón
   «Reintentar consulta» vuelve a pedir datos. La inducción de red no se hizo aquí.
3. **UI-PAR**: cambiar de zona con una pareja elegida a mano y comprobar que vuelve al par por
   defecto (no se puede verificar sin DOM).
4. **UI-FALLBACK**: forzar `meta.fallback: true` con la lista de alertas vacía y comprobar tono
   neutro, texto en español e inglés y que no se lea como «sin peligro».
5. **TEST-4**: bloquear `/api/assess` y confirmar «sin datos» como estado terminal (el timeout de
   15 s acota la espera; medir el tiempo real observado).
6. **M14**: revisar los textos nuevos en English y con almacenamiento bloqueado.
7. Re-test de regresión de las cuatro zonas SAR: el reinicio del par y el nuevo orden de ramas de
   estado comparten el mismo componente que el visor.
8. No se verificó el comportamiento bajo hidratación ni en 320/390 px para los banners nuevos.

## Nota de alcance

`meta.fallback` describe que alguna fuente falló; no mide cuánta información falta ni certifica
cobertura. El estudio sigue mostrando porcentajes de píxeles de vistas previas no calibradas, no
superficie dañada. Error, vacío válido y una sola pasada se distinguen ahora en el código, pero la
prueba en navegador sigue siendo necesaria para cerrar los issues ante QA.
