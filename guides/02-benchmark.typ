#import "theme.typ": *

#title_block(
  "BENCHMARK 2026",
  "Qué existe y dónde está nuestro hueco",
  "8 herramientas, una comparación",
)

#v(3pt)

#block(
  width: 100%,
  fill: navy,
  radius: 5pt,
  inset: 7pt,
)[
  #text(fill: cyan, weight: "bold", size: 8pt)[NUESTRA FRASE]
  #v(2pt)
  #text(fill: white, weight: "bold", size: 11pt)[
    “SkyBlink es el Backyard Worlds de SPHEREx: elegís una coordenada, ves el cielo cambiar en 102 bandas y encontrás candidatos, sin instalar nada.”
  ]
]

#section("Competidores y lecciones", color: cyan)

#[
  #set text(size: 8pt)
  #table(
    columns: (2.2cm, 4.3cm, 4.3cm, 4.5cm),
    inset: 2.8pt,
    stroke: 0.4pt + lineColor,
    fill: (x, y) => if y == 0 { navy } else { white },
    table.header(
      text(fill: white, weight: "bold", size: 7pt)[Herramienta],
      text(fill: white, weight: "bold", size: 7pt)[Qué hace],
      text(fill: white, weight: "bold", size: 7pt)[Qué copiamos],
      text(fill: white, weight: "bold", size: 7pt)[Cómo nos diferenciamos],
    ),
    [*Backyard Worlds* (WISE)], [
      Flipbooks WISE; 3.800+ enanas marrones; 40+ voluntarios coautores.
    ], [
      Tutorial 15 min, flipbook, “Think you've got one”.
    ], [
      SPHEREx + 102 bandas + diferencia + espectro.
    ],
    [*Daily Minor Planet*], [
      Voluntarios clasifican candidatos a asteroides.
    ], [
      Tarjetas de candidato, flujo sí/no.
    ], [
      Movimiento + contexto espectral.
    ],
    [*ESASky* (ESA)], [
      Portal multi-misión; imágenes, catálogos, SSO.
    ], [
      Selector de misión, overlays.
    ], [
      Simple, SPHEREx-first.
    ],
    [*Aladin Lite*], [
      HiPS web, capas, catálogos y cubos.
    ], [
      Slider de cubo, URL state.
    ], [
      Workflow guiado.
    ],
    [*DS9 / AstroImageJ*], [
      Escritorio: blink, diferencia, fotometría.
    ], [
      Controles de blink, diferencia, curva.
    ], [
      Cero instalación, público.
    ],
    [*Firefly / IRSA*], [
      Visor web FITS/HiPS/tablas/espectros.
    ], [
      Panel de metadata/espectro.
    ], [
      Flujo público.
    ],
    [*SPHEREx Data Explorer*], [
      GUI oficial para buscar/visualizar/descargar.
    ], [
      Créditos, enlaces, validación.
    ], [
      Capa de descubrimiento encima.
    ],
  )
]

#section("El hueco: nadie combina las 6 piezas", color: orange)

#[
  #set text(size: 8.8pt)
  #grid(
    columns: (1fr, 1fr),
    gutter: 6pt,
    [
      + Series temporales SPHEREx por coordenada.
      + Blink + diferencia de imágenes.
      + Slider de 102 bandas (HiPS).
    ],
    [
      + Espectro quick-look con `WCS-WAVE`.
      + Ranking de candidatos.
      + URL compartible y créditos.
    ],
  )
]

#v(3pt)

#grid(
  columns: (1fr, 1fr),
  gutter: 8pt,
  card("Copiar", [
    #text(size: 8.2pt)[
      • Tutorial de 15 min.\
      • “Think you've got one” y candidatos.\
      • Flipbook con fechas.\
      • Selector de capa/misión.\
      • Panel de metadata/espectro.\
      • URL con estado.
    ]
  ], color: green),
  card("No copiar", [
    #text(size: 8.2pt)[
      • Instalación de escritorio.\
      • Login obligatorio.\
      • 20 paneles y jerga.\
      • 100 settings antes de la imagen.\
      • Prometer “descubrimientos”.\
      • Mezclar Gaia/ZTF/Rubin.
    ]
  ], color: red),
)

#v(2pt)
#text(size: 7pt, fill: muted)[
  *Brokers adyacentes:* ALeRCE, Fink, ANTARES y Lasair hacen triage de Rubin/ZTF; no son SPHEREx y no están en nuestras APIs. Copiamos la idea de ranking, no la dependencia.
]
