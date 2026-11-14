// Tema visual compartido — Astral Codes / NASA Space Apps 2026
#let navy = rgb("#0B1F3A")
#let blue = rgb("#1F4E79")
#let cyan = rgb("#00A6D6")
#let orange = rgb("#FF7A00")
#let green = rgb("#2E9E5B")
#let red = rgb("#D64545")
#let ink = rgb("#1B1F24")
#let muted = rgb("#5B6675")
#let lineColor = rgb("#D9E1EC")
#let paper = rgb("#F6F8FC")

#set page(
  paper: "a4",
  margin: (x: 1.3cm, y: 1.15cm),
  footer: align(center)[
    #text(size: 7.5pt, fill: muted)[Astral Codes · NASA Space Apps Challenge 2026 · SkyBlink]
  ],
)
#set text(font: ("Noto Sans", "DejaVu Sans"), size: 9.4pt, fill: ink)
#set par(leading: 0.62em, justify: true)

#let title_block(k, t, s) = block(
  width: 100%,
  fill: navy,
  radius: 7pt,
  inset: (x: 14pt, y: 9pt),
)[
  #text(fill: cyan, weight: "bold", size: 8pt, tracking: 1.4pt)[#k]
  #v(3pt)
  #text(font: "Noto Sans", fill: white, weight: "bold", size: 20pt)[#t]
  #v(2pt)
  #text(fill: rgb("#C9D6E8"), size: 9.2pt)[#s]
]

#let section(label, color: cyan) = block(
  width: 100%,
  below: 4pt,
  above: 8pt,
)[
  #text(weight: "bold", size: 11.5pt, fill: color)[#label]
  #v(-2pt)
  #line(length: 100%, stroke: 0.8pt + color)
]

#let card(title, body, color: cyan) = block(
  width: 100%,
  fill: paper,
  stroke: (left: 3pt + color),
  radius: 4pt,
  inset: 7pt,
)[
  #text(weight: "bold", fill: color, size: 9.8pt)[#title]
  #v(1.5pt)
  #body
]

#let badge(label, color: cyan) = box(
  fill: color,
  radius: 20pt,
  inset: (x: 6pt, y: 1.8pt),
)[#text(fill: white, weight: "bold", size: 7.5pt)[#label]]

#let bar(label, pct, color) = grid(
  columns: (2.6cm, 1fr, 1.0cm),
  align: (left, left, right),
  [ #text(size: 9pt)[#label] ],
  [
    #box(width: 100%, height: 0.32cm, fill: rgb("#E8EDF5"), radius: 2pt)[
      #rect(width: pct * 1%, height: 0.32cm, fill: color, radius: 2pt)
    ]
  ],
  [ #text(weight: "bold", fill: color)[#pct%] ],
)

#let kv(k, v) = grid(
  columns: (2.2cm, 1fr),
  align: (left, left),
  [ #text(fill: muted, size: 8.5pt)[#k] ],
  [ #text(size: 9pt)[#v] ],
)
