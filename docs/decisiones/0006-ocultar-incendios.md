# 0006 · Ocultar los incendios

- **Fecha:** 2026-11-14 · **Estado:** aprobada (temporal)
- **Decisión:** los focos de FIRMS no se muestran en la app.
- **Motivo:** casi todos resultaron falsos (calor de ciudades y volcanes, pasadas sueltas) aun
  después de filtrarlos.
- **Cómo se revierte:** `SHOW_FIRES = true` en `web/lib/sources/overlays.ts`. Los filtros siguen
  en `web/lib/feeds-parse.ts`.
