#import "theme.typ": *

#title_block(
  "PLAN 48 H",
  "De la idea al demo",
  "Sábado 14 · Domingo 15 · entrega 23:59 hora local",
)

#section("Cronograma", color: cyan)

#grid(
  columns: (1fr, 1fr),
  gutter: 7pt,
  card("Sábado 09–12 · Fundación", [
    #text(size: 8.2pt)[
      • Votar challenge y roles.\
      • Crear repo, issues y ramas.\
      • Verificar APIs y datos.
    ]
  ], color: blue),
  card("Sábado 12–18 · PoC", [
    #text(size: 8.2pt)[
      • SIA2 → cutout → PNG.\
      • 1 target end-to-end.\
      • Blink mínimo.
    ]
  ], color: blue),
  card("Sábado 18–23 · Primer demo", [
    #text(size: 8.2pt)[
      • 3 targets cacheados.\
      • Modo diferencia.\
      • UI de búsqueda + presets.
    ]
  ], color: blue),
  card("Domingo 08–12 · Producto", [
    #text(size: 8.2pt)[
      • 5 targets.\
      • Slider 102 bandas.\
      • Ficha de objeto + URL.
    ]
  ], color: orange),
  card("Domingo 12–16 · Freeze", [
    #text(size: 8.2pt)[
      • Cortar features nuevas.\
      • Deploy y bugs.\
      • Grabar video de 30 s.
    ]
  ], color: orange),
  card("Domingo 16–23 · Entrega", [
    #text(size: 8.2pt)[
      • Ensayo 1 y 2.\
      • Submission en inglés.\
      • Submit for Judging + buffer.
    ]
  ], color: orange),
)

#section("Roles", color: green)

#[
  #set text(size: 8.4pt)
  #table(
    columns: (2.2cm, 1fr),
    inset: 3pt,
    stroke: 0.4pt + lineColor,
    fill: (x, y) => if y == 0 { navy } else { white },
    table.header(
      text(fill: white, weight: "bold", size: 7.2pt)[Persona],
      text(fill: white, weight: "bold", size: 7.2pt)[Foco],
    ),
    [*Andy*], [Lead/producto · integración · submission · pitch],
    [*David*], [Backend/datos · SIA2 · cutouts · caché · deploy],
    [*Samuel*], [Frontend · blink · slider · charts · share URL],
    [*Jorge*], [Ciencia/QA · targets · centroides · validación],
    [*Leo*], [Diseño/UX · video · subtítulos · deck · storytelling],
  )
]

#section("Flujo del demo (30 s)", color: orange)

#grid(
  columns: (1fr, 1fr, 1fr, 1fr, 1fr),
  gutter: 3pt,
  box(width: 100%, fill: paper, stroke: 0.5pt + lineColor, inset: 5pt, radius: 3pt)[
    #text(size: 7.2pt, weight: "bold", fill: blue)[1. Target]\
    #text(size: 7pt)[Elegir WISE 0855 o Barnard]
  ],
  box(width: 100%, fill: paper, stroke: 0.5pt + lineColor, inset: 5pt, radius: 3pt)[
    #text(size: 7.2pt, weight: "bold", fill: blue)[2. Blink]\
    #text(size: 7pt)[Play/pause y slider de épocas]
  ],
  box(width: 100%, fill: paper, stroke: 0.5pt + lineColor, inset: 5pt, radius: 3pt)[
    #text(size: 7.2pt, weight: "bold", fill: blue)[3. Diferencia]\
    #text(size: 7pt)[Ver qué cambió]
  ],
  box(width: 100%, fill: paper, stroke: 0.5pt + lineColor, inset: 5pt, radius: 3pt)[
    #text(size: 7.2pt, weight: "bold", fill: blue)[4. 102 bandas]\
    #text(size: 7pt)[Slider espectral]
  ],
  box(width: 100%, fill: paper, stroke: 0.5pt + lineColor, inset: 5pt, radius: 3pt)[
    #text(size: 7.2pt, weight: "bold", fill: blue)[5. Candidato]\
    #text(size: 7pt)[Ficha + créditos]
  ],
)

#section("Checkpoints que no se negocian", color: red)

#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  gutter: 4pt,
  card("Sáb 21:00", [#text(size: 8pt)[3 targets funcionando]], color: red),
  card("Dom 12:00", [#text(size: 8pt)[Freeze de alcance]], color: red),
  card("Dom 19:00", [#text(size: 8pt)[Video + submission listos]], color: red),
  card("Dom 22:00", [#text(size: 8pt)[Submit for Judging]], color: red),
)

#v(4pt)
#block(
  width: 100%,
  fill: navy,
  radius: 5pt,
  inset: 7pt,
)[
  #text(fill: cyan, weight: "bold", size: 8pt)[CAMINO CRÍTICO]
  #v(2pt)
  #text(fill: white, weight: "bold", size: 10pt)[
    SIA2 → cutout → PNG → manifest → UI. Si algo se atrasa, se recorta el bonus, nunca el camino crítico.
  ]
]
