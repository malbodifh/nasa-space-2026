# Verificación E2E con Playwright

> **Herramienta:** Playwright MCP (Microsoft), Chromium headless. No se agregó ninguna
> dependencia al proyecto; la configuración vive fuera del repo.
> **Alcance:** build de producción local (`pnpm build` + `pnpm start`) sobre `develop`,
> 15/11/2026. No es la URL de Vercel: producción sigue con la versión publicada.
> **Qué es y qué no:** Playwright MCP navega, hace clic y lee la interfaz, pero **no decide
> solo** qué es un fallo. Cada PASS de abajo tiene evidencia observada; no hay aserciones
> automáticas ni CI.

## Resultado del coordinador (tras las correcciones)

| Caso | Resultado | Evidencia |
|---|---|---|
| Home carga y muestra alertas | PASS | 8 eventos, 8 sismos, fuentes en vivo; 0 errores de consola |
| Menú superior | PASS | Abre con «Abrir menú», muestra Inicio / Superficie / Acerca de la app y selector de idioma; `aria-expanded` correcto |
| Navegación menú → Superficie | PASS | Carga `h1` correcto y mapa; 0 errores propios |
| Idioma English | PASS | `documentElement.lang = "en"`, `h1` «Alert for your location», menú «Home / Surface / About», URL pasa a `?lang=en` |
| Modo demo | PASS | Banner «Modo demo: incluye alertas marcadas «Simulación»», aviso «[Demostración] Desborde de río simulado · Simulación, no es un evento real», botón «Salir del demo» |
| Zona por id sin coordenadas | PASS | `/superficie?zona=palo-verde` muestra Antes 20 jul / Después 5 nov, tabs y 4,2 % de píxeles comparables. Antes decía «Falta el lugar del evento» |
| Entrada inválida `?lat=10` | PASS | «The event location is missing: provide both latitude and longitude»; sin crash |
| Entrada vacía `?lat=&lon=` | PASS | «The location is invalid…»; sin crash |
| Fuera de rango `?lat=999&lon=999` | PASS | «The location is invalid…»; sin crash |
| Móvil 390×844 | PASS | `scrollWidth = 390 = innerWidth` (sin scroll horizontal), menú presente |
| Consola | PASS | 0 errores; 4 warnings de driver WebGL del entorno headless, no del producto |
| API `/api/events` | PASS | 200, 8 alertas y 32 de historial, `fallback: false`, `latencySeconds` en horas (antes 169 días) |

Captura: `.playwright-mcp/e2e-mobile.png`.

## Límites de esta verificación

- No cubre Safari, Firefox ni un dispositivo físico.
- No prueba notificaciones reales del sistema (requiere permiso del usuario).
- No mide PageSpeed: eso se hace aparte con PageSpeed Insights.
- El informe previo de un tester intermedio quedó obsoleto: su `/api/events` 500 fue un
  servidor de desarrollo caído, no un fallo del código. Se verificó reiniciando el servidor.
- No sustituye revisión humana del contenido científico.
