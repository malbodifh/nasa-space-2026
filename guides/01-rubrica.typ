#import "theme.typ": *

#title_block(
  "RÚBRICA OFICIAL 2026",
  "Cómo ganar con SkyBlink",
  "Impacto 30% · Creatividad 20% · Viabilidad 20% · Prototipo 20% · Presentación 10%",
)

#v(6pt)

#grid(
  columns: (1.05fr, 1fr),
  gutter: 10pt,
  [
    #section("Pesos de la rúbrica", color: orange)
    #bar("Impacto", 30, orange)
    #v(3pt)
    #bar("Creatividad", 20, cyan)
    #v(3pt)
    #bar("Viabilidad", 20, green)
    #v(3pt)
    #bar("Prototipo & MVP", 20, blue)
    #v(3pt)
    #bar("Presentación", 10, muted)
    #v(5pt)
    #text(size: 8.5pt, fill: muted)[
      El 80% del score está en Impacto + Creatividad + Viabilidad + Prototipo.
      La presentación es el 10%, pero sin ella no se entiende el 90%.
    ]
  ],
  [
    #section("Nuestra autoevaluación", color: cyan)
    #table(
      columns: (1fr, 0.8cm, 1.0cm),
      inset: 3pt,
      stroke: 0.5pt + lineColor,
      fill: (x, y) => if y == 0 { navy } else { white },
      table.header(
        text(fill: white, weight: "bold", size: 7.4pt)[Criterio],
        text(fill: white, weight: "bold", size: 7.4pt)[Hoy],
        text(fill: white, weight: "bold", size: 7.4pt)[Meta],
      ),
      [Impacto], [4], [5],
      [Creatividad], [4], [4],
      [Viabilidad], [4], [4],
      [Prototipo], [3], [4],
      [Presentación], [3], [5],
      [*Total*], [*3.7*], [*4.4*],
    )
    #v(3pt)
    #text(size: 8pt, fill: muted)[3.7/5 = 74/100 → objetivo 4.4/5 = 88/100]
  ],
)

#section("Lo que el jurado tiene que ver", color: green)

#grid(
  columns: (1fr, 1fr),
  gutter: 8pt,
  card("Impacto · 30%", [
    Un problema grande, una audiencia amplia y una historia que se entiende.
    #v(2pt)
    #text(size: 8.5pt)[
      *Evidencia:* 5 targets, test con 3 personas, tiempo hasta el primer hallazgo,
      ciencia ciudadana y educación.
    ]
  ], color: orange),
  card("Creatividad · 20%", [
    La combinación, no una feature suelta: blink + diferencia + 102 bandas +
    espectro + candidatos.
    #v(2pt)
    #text(size: 8.5pt)[
      *Frase:* “el Backyard Worlds de SPHEREx”.
    ]
  ], color: cyan),
  card("Viabilidad · 20%", [
    Datos reales, pipeline probado, caché/fallback y límites honestos.
    #v(2pt)
    #text(size: 8.5pt)[
      *Evidencia:* `make precompute`, manifiesto, manejo de errores, demo offline.
    ]
  ], color: green),
  card("Prototipo & MVP · 20%", [
    Que se pueda tocar: blink, diff, slider 102 bandas, ficha y URL.
    #v(2pt)
    #text(size: 8.5pt)[
      *Evidencia:* deploy público + video de respaldo.
    ]
  ], color: blue),
)

#section("Top 5 acciones (por impacto en el score)", color: red)

#grid(
  columns: (1fr, 1fr),
  gutter: 8pt,
  [
    + *Precomputar 5 targets* (Impacto + Prototipo).
    + *Blink + diferencia* (Prototipo + Creatividad).
    + *Slider 102 bandas* (Creatividad + Impacto).
  ],
  [
    + *Ficha de objeto* (Viabilidad + Impacto).
    + *Video de 30 s con subtítulos* (Presentación).
  ],
)

#section("Reparto del pitch de 30 s", color: blue)

#grid(
  columns: (5fr, 5fr, 10fr, 7fr, 3fr),
  gutter: 2pt,
  box(width: 100%, fill: orange, inset: 4pt, radius: 3pt)[#text(fill: white, size: 7.2pt, weight: "bold")[0–5 s\ Impacto]],
  box(width: 100%, fill: cyan, inset: 4pt, radius: 3pt)[#text(fill: white, size: 7.2pt, weight: "bold")[5–10 s\ Creatividad]],
  box(width: 100%, fill: blue, inset: 4pt, radius: 3pt)[#text(fill: white, size: 7.2pt, weight: "bold")[10–20 s\ Demo]],
  box(width: 100%, fill: orange, inset: 4pt, radius: 3pt)[#text(fill: white, size: 7.2pt, weight: "bold")[20–27 s\ Impacto]],
  box(width: 100%, fill: green, inset: 4pt, radius: 3pt)[#text(fill: white, size: 7.2pt, weight: "bold")[27–30\ Cierre]],
)

#v(3pt)
#text(size: 8.5pt, fill: muted)[
  *Regla de oro:* 10 de los 30 segundos del pitch son demo pura. El jurado tiene que *ver* el producto, no imaginarlo.
]
