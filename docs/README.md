# Documentación

Todo el proyecto en Markdown. **Empiece por [`estado.md`](estado.md).**

## Cómo está organizado

Cada carpeta tiene un ciclo de vida distinto. Eso decide dónde va un documento nuevo.

| Carpeta | Qué contiene | Cambia |
|---|---|---|
| [`estado.md`](estado.md) | Reto, alcance, pendientes y registro de decisiones | a diario |
| [`producto/`](producto/) | Qué hace la app y sus reglas; debe coincidir con el código | con el código |
| [`tecnico/`](tecnico/) | Fuentes de datos, arquitectura, herramientas y deploy | con el código |
| [`decisiones/`](decisiones/) | Una decisión por archivo (ADR) | nunca se edita: se reemplaza |
| [`equipo/`](equipo/) | Reglas del equipo y workflow de Git | rara vez |
| [`investigacion/`](investigacion/) | Estudios fechados que fundamentaron las decisiones; [`base-conocimiento/`](investigacion/base-conocimiento/README.md) es referencia viva | los fechados no se tocan; la base se actualiza |
| [`bitacora/`](bitacora/) | Un archivo por día | solo se agrega |
| [`archivo/`](archivo/) | Planes cumplidos e ideas descartadas (SPHEREx) | no se toca |

## Qué leer según la tarea

| Quiero… | Leer |
|---|---|
| Saber en qué estamos | [`estado.md`](estado.md) |
| Entender qué hace la app | [`producto/vision.md`](producto/vision.md) |
| Tocar las alertas | [`producto/alertas.md`](producto/alertas.md) y [`tecnico/fuentes.md`](tecnico/fuentes.md) |
| Tocar el radar | [`producto/nisar.md`](producto/nisar.md) y [`base-conocimiento/`](investigacion/base-conocimiento/README.md) |
| Saber qué no debemos prometer | [`producto/limites.md`](producto/limites.md) |
| Subir cambios o resolver un error de Git | [`equipo/workflow.md`](equipo/workflow.md) |
| Correr o desplegar | [`tecnico/herramientas.md`](tecnico/herramientas.md) y [`../web/README.md`](../web/README.md) |
| Saber por qué se decidió algo | [`decisiones/`](decisiones/) |

## Reglas para escribir documentos

1. **Un dato, un dueño.** Si ya está en otro documento, se enlaza; no se copia.
2. **Sin números en el nombre.** El orden lo da este índice.
3. Los documentos de `tecnico/` y `producto/` abren con `Estado:` y se corrigen en el mismo PR
   que cambia el código que describen.
4. Los de `investigacion/` y `archivo/` llevan fecha y no se reescriben; si quedan viejos, se
   dice en su cabecera `Estado: histórico`.
5. Nada de PDF versionados salvo la guía de retos ([`../guides/`](../guides/README.md)).
6. Un enlace roto rompe `make check`.
