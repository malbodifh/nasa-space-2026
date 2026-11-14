#import "theme.typ": *

#title_block(
  "PITCH · 30 SEGUNDOS",
  "Seis frames, una historia",
  "0:00 → 0:30 · video vertical u horizontal · subtítulos en inglés",
)

#section("Storyboard", color: cyan)

#grid(
  columns: (1fr, 1fr),
  gutter: 7pt,
  card("0:00–0:02 · Hook", [
    #text(size: 8.4pt)[
      *Audio:* “Hola, soy Andy, de Astral Codes.”\
      *Visual:* plano del equipo o logo.\
      *Objetivo:* que sepan quiénes somos en 2 s.
    ]
  ], color: blue),
  card("0:02–0:05 · Problema", [
    #text(size: 8.4pt)[
      *Audio:* “SPHEREx fotografía todo el cielo en 102 bandas, pero nadie puede revisar mil millones de objetos a mano.”\
      *Visual:* render de SPHEREx / all-sky.
    ]
  ], color: orange),
  card("0:05–0:10 · Nombre", [
    #text(size: 8.4pt)[
      *Audio:* “Por eso creamos SkyBlink: el buscador de cambios del cielo.”\
      *Visual:* logo + tagline.\
      *Texto:* “El cielo cambia. Ahora lo podés ver.”
    ]
  ], color: cyan),
  card("0:10–0:20 · Demo", [
    #text(size: 8.4pt)[
      *Audio:* “Elegís una coordenada, ves una película de ese parche, activás la diferencia y movés el slider de 102 bandas.”\
      *Visual:* grabación real: blink → diff → slider → candidato.
    ]
  ], color: green),
  card("0:20–0:27 · Impacto", [
    #text(size: 8.4pt)[
      *Audio:* “Así cualquiera puede ayudar a encontrar asteroides, enanas marrones y estrellas variables.”\
      *Visual:* iconos/arte + “ciencia ciudadana”.
    ]
  ], color: orange),
  card("0:27–0:30 · Cierre", [
    #text(size: 8.4pt)[
      *Audio:* “NASA abrió los datos; nosotros abrimos la puerta para mirarlos. Astral Codes.”\
      *Visual:* equipo + URL + créditos.
    ]
  ], color: green),
)

#section("Reglas de oro", color: red)

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 6pt,
  card("Una idea", [#text(size: 8.2pt)[Si el jurado recuerda una cosa, que sea “el buscador de cambios del cielo”.]], color: red),
  card("Un número", [#text(size: 8.2pt)[Mil millones de objetos. 102 bandas. 6 meses. Elegí uno y repetilo.]], color: red),
  card("Mostrar", [#text(size: 8.2pt)[10 de los 30 s son demo real. No slides, no código, no arquitectura.]], color: red),
)

#section("Checklist de grabación", color: green)

#grid(
  columns: (1fr, 1fr),
  gutter: 8pt,
  [
    #text(size: 8.3pt)[
      • Guion aprobado y cronometrado (≤30 s).\
      • Demo grabada en 1080p, 30 fps.\
      • Audio con micrófono, no el del laptop.\
      • Subtítulos en inglés.\
      • Música libre o sin música.
    ]
  ],
  [
    #text(size: 8.3pt)[
      • Créditos NASA/IRSA.\
      • Logo del equipo.\
      • Link público (YouTube/Drive).\
      • Probado en ventana privada.\
      • Video de respaldo descargado.
    ]
  ],
)

#v(4pt)
#block(
  width: 100%,
  fill: navy,
  radius: 5pt,
  inset: 8pt,
)[
  #text(fill: cyan, weight: "bold", size: 8pt)[FRASE DE CIERRE]
  #v(2pt)
  #text(fill: white, weight: "bold", size: 13pt)[
    “NASA abrió los datos; nosotros abrimos la puerta para mirarlos.”
  ]
]
