// Generado desde CONTRIBUTING.md con pandoc. No editar a mano.

#import "theme.typ": *

= Contribuir --- Astral Codes
#quote(block: true)[
#strong[Regla:] si no está documentado, no existe. Si no se puede
probar, no entra. Workflow completo:
`docs/18-workflow.md`.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Quick start
```bash
git clone https://github.com/malbodifh/nasa-space-2026.git
cd "NASA SPACEAPPS"

make setup          # crea .venv e instala herramientas
source .venv/bin/activate

make check          # ruff + pytest
make guides         # compila las guías Typst
```

== 2. Antes de escribir código
#block[
#set enum(numbering: "1.", start: 0)
+ Leer `AGENTS.md`: es la base compartida (setup,
  comandos, reglas y gotchas).
+ El challenge todavía no está elegido: leer
  `docs/02-challenges-2026.md`.
+ Revisar el estado y las decisiones en
  `documentacion.md`.
+ Si el cambio define producto, primero se acuerda con el equipo y se
  anota en el Decision Log.
]

== 3. Ramas y commits
```text
andy · david · samuel · jorge · leo   →  develop  →  staging  →  main
```

- Una rama por tarea: `feat/`, `fix/`, `docs/`.
- Commits chicos, en imperativo y en español.
- PR obligatorio para llegar a `main`\; revisión de 1 persona y CI en
  verde.
- Nunca commitear directo en `main`, `staging` ni `develop`, ni forzar
  push.

== 4. Qué no se commitea
- `.env`, claves o tokens.
- `data/cache/`, `*.fits`, videos pesados.
- PNG de las guías (los PDF sí se versionan).

== 5. Definition of Done
+ Se puede mostrar funcionando.
+ Está documentado en una línea.
+ No rompe `main` (`make check` en verde).

== 6. Dudas
Si algo no está en `documentacion.md`, no existe: preguntá y actualizalo
el mismo día.