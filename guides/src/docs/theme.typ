// Tema de la documentación — Astral Codes / NASA Space Apps 2026
// Se aplica con `#show: docs` en el documento maestro o en cada wrapper.

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
#let soft = rgb("#EDF3FB")

#let docs(body) = {
  set document(title: "Documentación — Astral Codes", author: "Astral Codes")
  set page(
    paper: "a4",
    margin: (x: 2.1cm, y: 2.0cm),
    header: context {
      if counter(page).get().first() > 1 {
        set text(size: 7.2pt, fill: muted)
        grid(
          columns: (1fr, auto),
          [Astral Codes · NASA Space Apps 2026],
          [Documentación],
        )
        v(-0.15cm)
        line(length: 100%, stroke: 0.4pt + lineColor)
      }
    },
    footer: context {
      set text(size: 7.2pt, fill: muted)
      grid(
        columns: (1fr, auto),
        [Documentación del proyecto],
        [Página #counter(page).display()],
      )
    },
  )
  set text(font: ("Noto Sans", "DejaVu Sans"), size: 9.6pt, fill: ink, lang: "es")
  set par(justify: false, leading: 0.65em, spacing: 0.9em)
  set list(indent: 1.1em, body-indent: 0.45em, spacing: 0.55em)
  set enum(indent: 1.1em, body-indent: 0.45em, spacing: 0.55em)
  set heading(numbering: none)

  show link: it => text(fill: blue, it)

  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(0.1cm)
    rect(width: 1.0cm, height: 2.6pt, fill: cyan)
    v(0.18cm)
    text(size: 22pt, weight: "bold", fill: navy, it.body)
    v(0.22cm)
    line(length: 100%, stroke: 1.0pt + cyan)
    v(0.35cm)
  }
  show heading.where(level: 2): it => block(
    breakable: false,
    sticky: true,
    above: 0.35cm,
    below: 0.2cm,
  )[
    #text(size: 13.5pt, weight: "bold", fill: blue, it.body)
    #v(0.12cm)
    #line(length: 100%, stroke: 0.5pt + lineColor)
  ]
  show heading.where(level: 3): it => block(
    breakable: false,
    sticky: true,
    above: 0.25cm,
    below: 0.12cm,
  )[
    #text(size: 11pt, weight: "bold", fill: cyan, it.body)
  ]
  show heading.where(level: 4): it => block(
    breakable: false,
    sticky: true,
    above: 0.2cm,
    below: 0.08cm,
  )[
    #text(size: 9.8pt, weight: "bold", fill: ink, it.body)
  ]

  show quote.where(block: true): it => block(
    width: 100%,
    fill: paper,
    stroke: (left: 3pt + cyan),
    radius: 4pt,
    inset: (x: 10pt, y: 8pt),
    it,
  )
  show raw.where(block: true): set text(size: 7.8pt, font: "DejaVu Sans Mono")
  show raw.where(block: true): it => block(
    width: 100%,
    fill: soft,
    stroke: (left: 3pt + blue),
    radius: 4pt,
    inset: (x: 10pt, y: 8pt),
    breakable: true,
    it,
  )
  show raw.where(block: false): set text(size: 8.6pt, font: "DejaVu Sans Mono", fill: blue)

  show table: it => {
    let n = it.columns.len()
    set text(size: if n >= 7 { 6.4pt } else if n >= 5 { 7.0pt } else { 7.6pt })
    set par(justify: false, leading: 0.5em)
    it
  }
  show table.cell.where(y: 0): set table.cell(fill: navy)
  show table.cell.where(y: 0): set text(fill: white, weight: "bold")

  body
}

#let cover() = page(
  margin: 0pt,
  background: rect(width: 100%, height: 100%, fill: navy),
  header: none,
  footer: none,
)[
  #block(width: 100%, height: 100%, inset: (x: 2.4cm, y: 2.2cm))[
    #v(2.2cm)
    #text(fill: cyan, size: 9pt, tracking: 2.5pt, weight: "bold")[ASTRAL CODES · NASA SPACE APPS 2026]
    #v(1.0cm)
    #text(fill: white, size: 34pt, weight: "bold")[Documentación]
    #v(0.3cm)
    #text(fill: rgb("#C9D6E8"), size: 14pt)[Producto, datos, arquitectura y operación]
    #v(0.35cm)
    #text(fill: cyan, size: 10pt)[30 documentos · 7 partes]
    #v(0.8cm)
    #line(length: 38%, stroke: 2pt + cyan)
    #v(0.8cm)
    #text(fill: white, size: 11pt)[Equipo Astral Codes]
    #v(0.15cm)
    #text(fill: rgb("#9FB3CC"), size: 9pt)[14/11/2026 · Documento generado desde docs/\*.md]
    #v(1fr)
    #text(fill: rgb("#6F86A6"), size: 8pt)[NASA Space Apps Challenge 2026 · Repositorio malbodifh/nasa-space-2026]
  ]
]

#let part(num, title, desc) = page(
  background: rect(width: 100%, height: 100%, fill: paper),
  header: none,
  footer: none,
)[
  #v(3.2cm)
  #text(fill: cyan, size: 9pt, tracking: 3pt, weight: "bold")[PARTE #num]
  #v(0.4cm)
  #text(fill: navy, size: 26pt, weight: "bold")[#title]
  #v(0.4cm)
  #text(fill: muted, size: 11pt)[#desc]
  #v(1.0cm)
  #line(length: 100%, stroke: 0.8pt + lineColor)
]

#let colophon() = page(
  background: rect(width: 100%, height: 100%, fill: paper),
  header: none,
  footer: none,
)[
  #v(6cm)
  #text(fill: navy, size: 16pt, weight: "bold")[Fin de la documentación]
  #v(0.4cm)
  #text(fill: muted, size: 10pt)[
    Generado desde los archivos Markdown del repositorio con Typst.
    Si encontrás una diferencia entre este PDF y el Markdown, gana el Markdown.
  ]
  #v(0.8cm)
  #line(length: 42%, stroke: 0.6pt + lineColor)
]
