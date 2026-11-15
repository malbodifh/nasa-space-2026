// Generado desde scripts/README.md con pandoc. No editar a mano.

#import "theme.typ": *

= scripts/
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Script], [Qué hace], [Estado],),
    table.hline(),
    [`setup_branches.sh`], [Crea `main`, `develop`, `staging` y las 5
    ramas personales], [#text(fill: green, weight: "bold")[✓]],
  )]
  , kind: table
  )

== Uso
```bash
make branches          # equivale a bash scripts/setup_branches.sh
```

== Scripts archivados
`backups/ideas/spherex/scripts/` tiene `poc_spherex.py` y
`align_diff.py`, del reto anterior. No se usan en este proyecto, pero
siguen documentados por si se retoman.