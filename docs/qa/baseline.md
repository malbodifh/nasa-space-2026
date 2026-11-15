# Baseline independiente de QA

## Identidad y alcance

- Inicio: **2026-11-15 01:06:22 UTC−06:00** (Costa Rica).
- SHA: `9256c875bf7f8026721418564010cc25a4b646d4`; rama `develop`.
- Estado inicial: ` M AGENTS.md` preexistente. No se descartó ni modificó.
- Node local `v26.11.1`; pnpm `11.28.5`; `web/package.json` requiere Node `22.x`.
- Tester documental, sin cambios de código, git writing, dependencias, secretos,
  browser, build ni comandos que escriban `.next`.
- Fuentes de aceptación: `AGENTS.md`, `web/AGENTS.md`, `docs/estado.md`,
  `docs/producto/{alertas,nisar,limites}.md`, `docs/tecnico/fuentes.md`.
- Plan ejecutable: [pruebas.md](pruebas.md). QA de APIs y ciencia asignados a otros:
  no se repitió auditoría de endpoints ni se certificó validez científica.

## Gates ejecutados

Horas locales UTC−06:00. Logs completos fuera del repo en `/tmp/opencode/`.

| Comando | Inicio–fin | Resultado | Evidencia |
|---|---|---|---|
| `make check` | 01:06:37–01:06:53 | **PASS**, exit 0: Ruff y 3 tests Python | `qa-baseline-make-check-9256c87.log` |
| `pnpm --dir web lint` inicial | 01:06:37 aprox.–timeout 120 s | **INCONCLUSO**, herramienta termina con 143; llegó a `$ eslint .` | `qa-baseline-web-lint-9256c87.log` |
| `pnpm --dir web test` inicial | 01:06:37 aprox.–timeout 120 s | **INCONCLUSO**, herramienta termina con 143; llegó a `RUN v5.1.0` | `qa-baseline-web-test-9256c87.log` |
| `pnpm --dir web lint`, único reintento con límite 180 s | 01:10:48–01:11:27 | **PASS**, exit 0 | `qa-baseline-web-lint-retry-9256c87.log` |
| `pnpm --dir web test`, único reintento con límite 180 s | 01:10:48–01:11:10 | **PASS**, exit 0: **14 archivos / 93 tests**; duración Vitest 14,60 s | `qa-baseline-web-test-retry-9256c87.log` |
| Build | No ejecutado | Reservado al coordinador | No hay evidencia de build de este tester |

**No confundir verde con release certificado:** el primer arranque de los checks web
fue interrumpido; el reintento ocurrió con cambios concurrentes. No se aisló la causa
de los timeouts iniciales, y no se los atribuye al producto.

Warnings no bloqueantes del reintento: engine Node incompatible con el declarado;
config Vite ESM cargada como CommonJS; plugin `vite-tsconfig-paths` ahora redundante.
No se cambiaron configuración ni versiones.

### Concurrencia observada

A las **01:11:36**, SHA sin cambios, pero ya existían modificaciones ajenas en
`web/app/api/{alerts,assess,events,nisar/search,overlays}`, `web/app/{icon.svg,layout.tsx}`,
`web/components/{HomeView,SiteHeader}.tsx` y archivos nuevos de menú/i18n/utilidad de API.
`docs/qa/api-audit.md` ya existía por el QA de APIs. Los reintentos no prueban exclusivamente
el contenido versionado de `9256c87`: no hubo snapshot inmutable del árbol.

Control de cierre documental a las **01:14:48**: HEAD cambió por trabajo ajeno a
`5e1683e06733cbc672169fed5de1fdca9e4a969e`. `git status --short` mostró
`UU web/components/HomeView.tsx` y `UU web/components/useAlertNotifications.ts`,
además de otros cambios concurrentes y `MM web/components/EventList.tsx`.
**No se ejecutaron gates contra este estado ni se tocaron conflictos.**
Los resultados anteriores no certifican este nuevo HEAD/working tree.

## Smoke HTML de producción, sin browser

GET únicos a `/` y `/superficie`, con `curl --max-time 35`; inspección de texto HTML
guardado a **01:12:05**:

| Ruta | HTTP / tiempo | Observación comprobada |
|---|---|---|
| `/` | **200 / 0,226449 s** | HTML 13.825 bytes; título Memoria de Fuego, marca, estado «Buscando su ubicación…», métricas, fuentes y disclaimer 911/CNE. También texto «Probar la app con una alerta simulada». |
| `/superficie` | **200 / 0,318116 s** | HTML 10.726 bytes; título y marca; contenido de estudio no presente en texto inicial, compatible con Suspense. No prueba error ni éxito de hidratación. |

Evidencia local: `/tmp/opencode/qa-prod-{home,superficie}-9256c87.{headers,html}`.
El sufijo identifica esta tanda, **no** el SHA desplegado. No se consultó versión
del deploy. Producción contiene texto de demo no encontrado en Home de HEAD:
no se asume equivalencia entre deploy y working tree.

No se probaron interacción, screenshots, responsive, canvas, permisos, idioma,
fallback runtime ni estado de fuentes desde browser. Todos siguen pendientes.

## OBSERVACIÓN DEL USUARIO · sismo de Nicaragua en vivo

- **Reporte recibido del usuario, no observación propia certificada:** el usuario
  informó que apareció un sismo de Nicaragua en la app en vivo. Lo describió como
  evento real, **no como demo**. No aportó ID, hora exacta, captura ni magnitud;
  no se conoce ni se infiere su ubicación.
- Verificación adicional limitada a **un único GET**, iniciado
  **2026-11-15 01:17:16 UTC−06:00**:
  `https://nasa-space-2026.vercel.app/api/events?lat=10.635&lon=-85.4377&radius=450`.
  Las coordenadas son un punto de consulta de QA, **no la ubicación del usuario**.
- Resultado propio comprobado: **HTTP 200**, 0,318445 s;
  `meta.updatedAt=2026-11-15T07:17:16.523Z`, `cached=false`, `fallback=false`.
  La respuesta contiene estos dos registros recientes relacionados con Nicaragua:

| ID de API | Fecha UTC / hora Costa Rica | Magnitud / calidad | Fuente y URL devuelta |
|---|---|---|---|
| `seismic:OVSICORI:ov2026wpwt` | `2026-11-15T06:53:50.860Z` / 15 nov 00:53:50,860 | `magnitudeValue=3.7`, preliminar | OVSICORI · `https://www.ovsicori.una.ac.cr/` |
| `seismic:OVSICORI:ov2026wonx` | `2026-11-14T13:28:49.376Z` / 14 nov 07:28:49,376 | `magnitudeValue=4.0`, revisado | OVSICORI · `https://www.ovsicori.una.ac.cr/` |

El primero lleva título «M 3.7 · costa de Nicaragua» y epicentro de fuente
`11.480254173278809, -86.00299835205078`; el segundo «M 4.0 · Nicaragua» y epicentro
`11.204168319702148, -85.73656463623047`. Estos son datos del evento, no del usuario.
Ambos tienen `alsoReportedBy=[]`: **sin corroboración entre redes en esta respuesta**.
La URL devuelta es la portada de OVSICORI, no un permalink individual; no se hizo
otra petición para verificarla ni para contrastar el catálogo original.

La consulta no incluyó `test` ni `hazard`, y los registros llevan IDs sísmicos de
fuente, no IDs de demo. Eso corrobora **presencia en el feed normal de producción**,
pero no demuestra cuál vio el usuario ni la aparición/notificación en pantalla.
**No se identifica el reporte del usuario con ninguno solo por su título**, ni
se certifica latencia extremo a extremo, impacto local, intensidad sentida o peligro.

Evidencia guardada fuera del repo:
`/tmp/opencode/qa-prod-events-nicaragua.{headers,json}`.
No se ejecutó re-test total; siguen cambios concurrentes. El coordinador informó
que main/develop/local están en `5e1683e`, con UIfix incorporado y traducción aún
resolviéndose; esta información se registra como comunicación, no como nuevo gate.

## Issues documentados, sin fixes

No se observó P0 en el alcance limitado; esto **no** es una auditoría de seguridad.

### TEST-1 · P1 · Coordenadas inválidas aceptadas en estudio

- **Estado:** confirmado por evaluación de la expresión de validación; impacto visual
  pendiente de prueba manual. Presente en HEAD y en lectura local inicial.
- **Reproducir:** abrir `/superficie?lat=10`, `/superficie?lat=&lon=` o
  `/superficie?lat=999&lon=999`.
- **Esperado:** rechazar coordenada incompleta, vacía o fuera de rangos
  latitud ±90 / longitud ±180, con mensaje de entrada inválida, sin buscar otro lugar.
- **Real:** `Number(null)`/`Number("")` se convierte a 0, y `hasPoint` solo exige
  `params.has("lat")` y números finitos. Los tres casos pasan como punto válido.
- **Evidencia:** `web/components/SurfaceStudy.tsx:101–115`, verificado también con
  `git show HEAD:web/components/SurfaceStudy.tsx`. Evaluación Node sin llamadas de red:

  ```text
  lat=10                 → lat=10,  lon=0,   hasPoint=true
  lat=&lon=              → lat=0,   lon=0,   hasPoint=true
  lat=999&lon=999         → lat=999, lon=999, hasPoint=true
  lat=NaN&lon=-85         → hasPoint=false (control)
  ```

### TEST-2 · P1 · Error de consulta se presenta como falta de imágenes

- **Estado:** confirmado por lectura de rama render; fallo de red no inducido aquí.
  Presente en HEAD.
- **Reproducir:** abrir estudio de punto remoto fuera de zonas precalculadas y hacer
  fallar la consulta al catálogo (offline/error HTTP), no devolver un vacío exitoso.
- **Esperado:** indicar consulta fallida/sin conexión, sin afirmar ausencia de cobertura.
- **Real:** la condición `remoteError || (remote && !remote.data)` comparte el texto
  «El radar NISAR todavía no tiene imágenes de este lugar» y pide volver en días.
- **Evidencia:** `web/components/SurfaceStudy.tsx:223–228`; `fetcher` lanza en HTTP
  no OK (`:41–44`). Un error de transporte no demuestra falta de imágenes.
- **Re-test:** M09/M11/M13; separar error, vacío válido y una sola pasada.

### TEST-3 · P2 · Selector de demo de cinco amenazas no está en Home de HEAD

- **Estado:** brecha de cobertura de presentación confirmada por grafo de componentes
  local/HEAD; producción distinta y cambios concurrentes, revalidar al cierre.
- **Reproducir:** abrir Home en versión `9256c87`, buscar modo demo y selector de
  incendio/sismo/volcán/inundación/tormenta.
- **Esperado para el plan solicitado:** probar las cinco amenazas desde UI y distinguir
  inequívocamente simulación de alertas reales.
- **Real:** `web/app/page.tsx` monta `HomeView`; éste usa
  `useAlertNotifications.test`, que emite solo «Aviso de prueba» genérico.
  `AppShell.tsx` contiene selector/demo pero no se encontró montado en otra vista.
  No se trató la llamada directa de API como prueba de UI.
- **Evidencia:** `web/app/page.tsx:1–5`,
  `web/components/useAlertNotifications.ts:90–94`,
  `web/components/AppShell.tsx:452–491`. `git show HEAD` confirma Home y hook.
- **Nota:** el HTML de producción sí incluye un botón de alerta simulada;
  no se verificó qué abre ni si permite cinco amenazas.

### TEST-4 · P2 · Fallo de condiciones de incendio no tiene estado terminal propio

- **Estado:** confirmado por lectura; pendiente de inducción manual.
  Patrón presente en HEAD y lectura concurrente.
- **Reproducir:** cargar Home con `/api/events` disponible y hacer fallar
  `/api/assess`, o mantener esa petición pendiente.
- **Esperado:** distinguir carga de dato no disponible/timeout, sin inventar score.
- **Real:** SWR de assess no consume `error`; la tarjeta usa `fire ? etiqueta : "…"`,
  sin estado de error propio. La rama de error visible corresponde solo a events.
- **Evidencia:** `web/components/HomeView.tsx:97–104,140,210–213`
  (líneas de lectura concurrente; HEAD tiene el mismo patrón).
- **Re-test:** M13; registrar tiempo observado, no asumir timeout del navegador.

## Prioridad y siguiente control

1. Verificar TEST-1 y TEST-2 antes de presentar estudio remoto: entrada y mensajes
   de ausencia de datos afectan la confianza del flujo principal.
2. Alinear demo cinco amenazas (TEST-3) con UI realmente desplegada.
3. Validar estados de fallo/timeout de Home (TEST-4).
4. Re-test de menú/logo, English, cuatro zonas, mobile y seguridad superficial
   tras congelar árbol. No hay aprobación manual implícita en los gates.
5. Repetir gates con SHA/estado de cierre y Node 22 si está disponible sin instalar.
   Esperar resultado de build del coordinador.

**Pendiente:** re-test final al ser contactado en esta misma sesión. No se realizó
ninguna corrección de producto ni se declaró resuelto ningún issue.
