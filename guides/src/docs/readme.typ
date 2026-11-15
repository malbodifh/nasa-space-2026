// Generado desde README.md con pandoc. No editar a mano.

#import "theme.typ": *

= Astral Codes --- NASA Space Apps Challenge 2026
#strong[Equipo:] Andy, David, Samuel, Jorge, Leo #strong[Repo:]
#link("https://github.com/malbodifh/nasa-space-2026")[malbodifh/nasa-space-2026]
#strong[Estado:] reinicio --- challenge #strong[sin elegir]

#quote(block: true)[
Estamos eligiendo entre los 14 retos oficiales de 2026. El mapa de
decisión está en
`guides/dist/06-retos.pdf`.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== Empezar
```bash
make setup      # crea .venv e instala herramientas
make check      # ruff + pytest
make guides     # compila las guías Typst a PDF
```

== Qué hay acá
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Ruta], [Qué es],),
    table.hline(),
    [`documentacion.md`], [Fuente única de
    verdad: estado, decisiones, reglas],
    [`AGENTS.md`], [Base compartida para quien
    escriba código (humanos e IA)],
    [`docs/02-challenges-2026.md`], [Los
    14 retos, matriz /20 y método de votación],
    [`guides/dist/06-retos.pdf`], [El
    mapa de retos para mostrar al equipo],
    [`docs/18-workflow.md`], [Ramas, PRs,
    commits y recuperación],
    [`docs/19-herramientas.md`], [Comandos,
    CI y guías],
    [`CONTRIBUTING.md`], [Cómo contribuir],
  )]
  , kind: table
  )

== Ramas
```text
main        producción (solo merge desde staging)
  ↑
staging     puente de integración / pre-producción
  ↑
develop     desarrollo diario
  ↑
andy · david · samuel · jorge · leo    rama personal
```

El proyecto anterior (Mission Trainer, reto \#3) está archivado en la
rama `archive/mission-trainer` y en el tag `v1-mission-trainer`.

== Créditos
Contenido basado en material público de NASA. NASA no respalda este
proyecto.