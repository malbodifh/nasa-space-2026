# 0008 · Organización de la documentación

- **Fecha:** 2026-11-15 · **Estado:** aprobada
- **Decisión:** la documentación vive en `docs/` en Markdown, separada por ciclo de vida
  (estado, producto, técnico, decisiones, equipo, investigación, bitácora y archivo). Un dato
  tiene un solo dueño. `guides/` solo conserva la guía visual de retos.
- **Reemplaza:** la regla anterior de `documentacion.md` como fuente única y el libro de PDF
  generado con Typst, que duplicaba todos los documentos.
- **Consecuencias:** `documentacion.md` pasa a ser `docs/estado.md`; el CI valida los enlaces de
  todo `docs/`.
