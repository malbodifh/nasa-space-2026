// Generado desde .github/pull_request_template.md con pandoc. No editar a mano.

#import "theme.typ": *

= Pull Request
== Qué cambia
== Por qué
== Cómo probarlo
== Evidencia
== Checklist
- ☐ `make check` pasa (lint + tests).
- ☐ Lo probé en la demo, no solo en mi máquina.
- ☐ Actualicé la documentación si cambió el alcance.
- ☐ Si usa datos, completé el #strong[contrato de datos] (dataset, API,
  campos, caché, fallback).
- ☐ Si usa IA/SI, está declarado.
- ☐ No agregué secretos, datos pesados ni `data/cache/`.
- ☐ No rompe `main`.