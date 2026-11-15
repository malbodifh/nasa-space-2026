// Generado desde guides/README.md con pandoc. No editar a mano.

#import "theme.typ": *

= guides/
#quote(block: true)[
#strong[La verdad del proyecto está en
`documentacion.md` y `docs/*.md`.] Esta
carpeta solo produce PDFs para leer o mostrar. No es documentación.
]

== Estructura
```text
guides/
├── src/        # fuentes Typst: no se leen, se compilan
├── dist/       # PDFs versionados + PNGs (ignorados por git)
└── README.md
```

#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Carpeta], [Qué es], [Se lee], [Se edita],),
    table.hline(),
    [`src/`], [Código de maquetación Typst], [#text(fill: red, weight: "bold")[×]], [#text(fill: green, weight: "bold")[✓] si hay que
    cambiar el PDF],
    [`dist/`], [PDF y PNG generados], [#text(fill: green, weight: "bold")[✓] (PDF)], [#text(fill: red, weight: "bold")[×] nunca a mano],
  )]
  , kind: table
  )

== Regla
+ Si un PDF y un `.md` dicen cosas distintas, #strong[gana el `.md`].
+ No se busca información en `src/*.typ`: ahí solo hay layout.
+ `dist/` se regenera con `make guides`\; no se parchea.
+ Una guía no reemplaza un documento: lo resume para mostrar.

== Compilar
```bash
make guides
```

Salida en `guides/dist/`:

```text
06-retos.pdf       Los 14 retos: comparación, fichas y votación
```

== Editar una guía
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Archivo], [Qué contiene],),
    table.hline(),
    [`src/theme.typ`], [Colores, tipografía, tarjetas, barras, tablas],
    [`src/06-retos.typ`], [Los 14 retos: comparación, matriz, fichas y
    cómo votar],
  )]
  , kind: table
  )

== Agregar una guía nueva
+ Crear `guides/src/07-<tema>.typ` con `#import "theme.typ": *` y
  `#title_block(...)`.
+ Agregar las dos líneas en `make guides` (PDF y PNG).
+ Sumar la fila a la tabla de arriba y al índice de `documentacion.md`.
+ `make guides` y revisar el PDF antes de commitear.

=== Recetas del tema
```typ
#section("Título", color: cyan)      // el color va SIEMPRE con nombre
#card("Título", [cuerpo], color: orange)
#grid(columns: (1fr, 1fr), gutter: 6pt, row-gutter: 5pt, ...)
#text(size: 7.2pt, fill: muted)[nota al pie]
```

Trampa conocida: el color de línea se llama `lineColor`, porque `line`
tapa la función built-in de Typst. Si ves
`expected function, found color`, es eso.

== Reglas de diseño
- Una guía = una idea visual.
- Texto grande, una idea por tarjeta.
- Colores del tema; no inventar paleta.
- Compilar antes de commitear (`make guides`).
- Los PDFs se versionan; los PNG no.