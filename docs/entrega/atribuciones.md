# Atribuciones y licencias

> **Estado:** inventario verificado el 2026-11-15. **No se creó una licencia para el proyecto:**
> esa decisión es del equipo. Este documento reúne lo que hay que declarar en la submission.

## 1. Licencia del código (decisión pendiente)

El repositorio **no tiene archivo `LICENSE`**. Sin él, el código queda con derechos reservados
por defecto, aunque sea público. La guía de submission pide una solución *open-source*.

Opciones habituales, todas compatibles con las dependencias actuales:

| Licencia | Qué implica |
|---|---|
| MIT | La más simple; permite reutilización con atribución. |
| Apache-2.0 | Añade concesión explícita de patentes. |
| GPL-3.0 | Obliga a publicar derivados con la misma licencia; menos amable para un jurado que quiera reutilizar. |

Ninguna dependencia obliga a GPL. Hay binarios LGPL (`@img/sharp-libvips`, usado por `sharp`
para generar las imágenes del estudio), que se pueden distribuir mientras se mantenga su aviso
de licencia y se permita reemplazarlos.

**Acción:** el equipo elige una, se agrega `LICENSE` en la raíz y se enlaza desde el README.

## 2. Dependencias de la aplicación

Resumen generado con `pnpm licenses list` sobre `web/`:

- **MIT:** 502 paquetes.
- **Apache-2.0:** 25.
- **ISC:** 23.
- **BSD-2-Clause:** 13 · **BSD-3-Clause:** 10.
- **MPL-2.0:** 3 (`axe-core`, `lightningcss`, `lightningcss-linux-x64-gnu`).
- **BlueOak-1.0.0:** 3 (`graceful-fs`, `isexe`, `minimatch`).
- **LGPL-3.0-or-later:** 1 (`@img/sharp-libvips-linux-x64`).
- Otras de un solo paquete: `0BSD` (tslib), `Python-2.0` (argparse), `CC-BY-4.0` (caniuse-lite),
  `CC0-1.0` (language-subtag-registry), `(MIT OR CC0-1.0)` (type-fest), `(MIT OR Apache-2.0)`
  (`@maplibre/mlt`).

Todas son permisivas salvo la MPL (por archivo) y la LGPL del binario de `libvips`. Ninguna
contamina el código del proyecto.

## 3. Datos y servicios

- **NASA–ISRO NISAR L2 GCOV**, vistas previas vía **ASF DAAC**; catálogo **NASA CMR**.
  Producto provisional/validado según colección. NASA no respalda este proyecto.
- **NASA EONET**, **NASA GIBS**, **NASA POWER**, **NASA Worldview**.
- **USGS** (FDSN), **OVSICORI–UNA**, **RSN UCR–ICE**.
- **NOAA PTWC/NTWC**, **NOAA NHC**.
- **GDACS**, **Open-Meteo** (modelo, no aviso del IMN).
- **Smithsonian GVP** (catálogo de volcanes), **Natural Earth** (fronteras).
- **OpenStreetMap** — datos © colaboradores de OSM, **ODbL**.
- **CARTO Positron** — mapa base; atribución visible en el propio mapa.

Cada tarjeta de la app enlaza el reporte original. Las áreas roja y amarilla son estimaciones
propias, no zonas oficiales. Las cifras del radar son de píxeles de vistas previas, no de daño.

## 4. Uso de inteligencia artificial

Se declara en la submission:

- **OpenAI GPT-6.1 Sol**: implementación de backend, interfaz, i18n y revisión.
- **DeepSeek V4.1**: auditorías independientes de APIs y de ciencia, y correcciones de UI.
- **Playwright MCP** (Microsoft) para navegación automatizada en pruebas.

La IA produjo código, textos y análisis. El equipo revisa y responde por el resultado. Las notas
internas de `/acerca` son una simulación, no una evaluación de NASA ni del jurado.

## 5. Antes de enviar

1. Elegir licencia y agregar `LICENSE`.
2. Verificar que la app enlace CNE, IMN, OVSICORI y RSN en los lugares donde se citan.
3. Confirmar que el video y los materiales enlazados estén en inglés, o con subtítulos en inglés.
4. Revisar que ninguna captura muestre datos personales.
