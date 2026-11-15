# QA: punto de entrada para la revisión

> **Estado:** trabajo del 15/11/2026 sobre `develop`. No es un certificado de NASA ni una
> garantía de seguridad. Las mejoras no se presumen desplegadas en producción.

## Leer en este orden

1. [`pruebas.md`](pruebas.md): mini guía manual y matriz de casos para revisar la app.
2. [`baseline.md`](baseline.md): qué pasó en la versión inicial, evidencias y observaciones del usuario.
3. [`api-audit.md`](api-audit.md): auditor QA de APIs, sin correcciones de código.
4. [`correcciones-backend.md`](correcciones-backend.md): implementador distinto, correcciones y tests.
5. [`challenge-review.md`](challenge-review.md): evaluación científica independiente y simulación
   de criterios; no una nota del jurado.
6. [`correcciones-ciencia.md`](correcciones-ciencia.md): límites y procedencia corregidos.
7. [`rendimiento-baseline.md`](rendimiento-baseline.md): PageSpeed móvil/escritorio de producción.
8. [`rendimiento-cambios.md`](rendimiento-cambios.md): correcciones locales y qué falta medir.
9. [`e2e-playwright.md`](e2e-playwright.md): navegación real con Playwright MCP y resultados
   observados después de las correcciones.
10. [`correcciones-ui.md`](correcciones-ui.md): TEST-1 y TEST-2 cerrados, con lo que falta probar.

Los informes baseline son fotografías de sus versiones: no se reescriben como si las correcciones
siempre hubieran existido. Un hallazgo se cierra con evidencia de retest, no solo con un cambio.

## Equipo de IA y responsabilidades

- DeepSeek V4.1: auditorías de contratos de APIs y de ciencia/encaje con el reto; documenta, no repara.
- GPT-6.1 Sol: implementación backend, navegación/marca, traducción, mapas/rendimiento y coordinación.
- GPT-6.1 Sol tester: ejecuta pruebas y registra resultados; no corrige los fallos que encuentra.

Los agentes comparten árbol de trabajo pero tienen archivos asignados para no sobrescribirse.
El coordinador deriva cada reporte al implementador y solicita retest independiente al final.

## Criterio mínimo de aceptación

- Ruff/Pytest y frontend lint/test/build verdes.
- Coordenadas ausentes o fuera de rango y fechas imposibles devuelven error, no un punto `(0,0)`.
- `test=1` distingue las amenazas admitidas y conserva la etiqueta simulada; `test=0` no incluye demo.
- El demo de portada se puede activar y retirar sin modificar ni publicar reportes reales.
- No se solicitan permisos del navegador sin una acción explícita.
- Fuentes, fecha, calidad, error/fallback y falta de cobertura se distinguen.
- Las cifras SAR son de píxeles de vistas previas, no km² dañados ni probabilidad de desastre.
- El menú, ES/EN y enlaces funcionan en Inicio, Superficie y Acerca.
- Solo se publica lo autorizado en `develop`. La promoción de `main` la decide la persona responsable.

## Estado al cerrar la jornada del 15/11

- `make check`, `tsc --noEmit`, ESLint, **321 tests** en 28 archivos y `next build`: verdes.
- Verificación en navegador con Playwright MCP sobre el build de producción local: menú,
  inglés, demo, cuatro zonas SAR, entradas inválidas y móvil 390 px, todo PASS.
- Correcciones aplicadas: validación de coordenadas, `hazard` en modo prueba, frescura de
  metadata, GDACS por país, timeouts de Overpass, estados de error del catálogo NISAR,
  contraste, geolocalización por gesto y límites del estudio SAR.

### Caché

`meta.cached` ahora informa si al menos una fuente vino de la caché en memoria del proceso;
no cubre la caché del CDN, que el origen no puede observar. Tiene prueba propia en
`web/tests/cache-tracking.test.ts`.

### Pendiente de medición

El rendimiento se corrigió en código pero **no se volvió a medir**. Hace falta publicar un
preview de `develop` y repetir PageSpeed móvil/escritorio.

## Pendientes humanos

Revisar la preview de `develop`, repetir móvil y escritorio en un dispositivo real, confirmar
registro del reto y licencia, elegir el logo final si cambia, grabar el demo y enviar la
submission. El uso de IA y las fuentes deben declararse en la entrega.
