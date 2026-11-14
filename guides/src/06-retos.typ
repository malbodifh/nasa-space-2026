#import "theme.typ": *

#set page(footer: align(center)[
  #text(size: 7pt, fill: muted)[Astral Codes · NASA Space Apps 2026 · Revisión de retos · 14/11/2026]
])
#set text(size: 8pt)

#let reto(n, titulo, dif, color, pide, mvp, datos, riesgo, veredicto) = block(
  width: 100%,
  fill: paper,
  stroke: (left: 2.6pt + color),
  radius: 4pt,
  inset: (x: 5pt, y: 4pt),
  breakable: false,
)[
  #grid(
    columns: (0.62cm, 1fr),
    gutter: 3pt,
    align: (center + horizon, left),
    text(fill: color, weight: "bold", size: 11.5pt)[#n],
    [
      #text(size: 8pt, weight: "bold")[#titulo]
      #h(3pt)
      #text(size: 6pt, fill: muted, weight: "bold")[#dif]
      #v(1.2pt)
      #text(size: 6.7pt)[
        *#text(fill: color)[QUÉ PIDE:]* #pide \
        *#text(fill: color)[MVP 48 H:]* #mvp \
        *#text(fill: color)[DATOS:]* #datos \
        *#text(fill: color)[RIESGO:]* #riesgo \
        *#text(fill: color)[VEREDICTO:]* #veredicto
      ]
    ],
  )
]

#title_block(
  "14 RETOS · MAPA DE DECISIÓN",
  "Revisión para elegir el challenge",
  "Comparación, fichas y votación · decisión abierta al 14/11/2026",
)

#v(5pt)
#text(size: 7.4pt)[
  Este documento no asume un reto ganador. Sirve para comparar los 14 challenges oficiales,
  descartar rápido y votar con criterios explícitos. *Regla:* si el dato NASA no está
  accesible hoy, el reto no se elige por lindo que sea el demo.
]

#section("Comparación rápida", color: orange)

#table(
  columns: (0.5cm, 3.5fr, 1.05cm, 5.9fr, 2.5fr, 1.65fr),
  inset: 3.3pt,
  stroke: 0.4pt + lineColor,
  fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
  table.header(
    text(fill: white, weight: "bold", size: 6.2pt)[\#],
    text(fill: white, weight: "bold", size: 6.2pt)[Reto],
    text(fill: white, weight: "bold", size: 6.4pt)[Dif.],
    text(fill: white, weight: "bold", size: 6.2pt)[En una frase],
    text(fill: white, weight: "bold", size: 6.2pt)[Dato central],
    text(fill: white, weight: "bold", size: 6.2pt)[Riesgo],
  ),
  [1], [Abandoned but not Forgotten], [Inter.], [Museo del hardware que NASA dejó en la Luna y Marte], [Imágenes y 3D abiertos], [Bajo],
  [2], [Earth System Trend Detective], [Adv.], [Tendencias climáticas con significancia estadística], [Earthdata (cuenta)], [Medio],
  [3], [Junior Astronaut Mission Trainer], [Inter.], [Juego de gestión de un puesto lunar], [Conceptos ECLSS/HRP], [Bajo],
  [4], [Health Monitoring for Astronauts], [Inter.], [Panel de salud para misiones largas], [HRP / análogos], [Alto],
  [5], [Dancing with the SARs], [Adv.], [Mapa de cambios de superficie con radar], [NISAR (cuenta)], [Alto],
  [6], [Field Shift: Adapting Farms], [Adv.], [Recomendador de rotaciones de cultivo], [SMAP/MODIS], [Medio],
  [7], [Flame in Freefall], [Adv.], [Dashboard con IA sobre fuego en microgravedad], [NTRS/papers], [Medio],
  [8], [MODIS + VIIRS Hot Spots], [Adv.], [Calendario de 20 años de incendios], [FIRMS (clave)], [Medio],
  [9], [Earth Analogs for Moon/Mars], [Adv.], [Ranking de lugares terrestres análogos], [Earthdata/USGS], [Medio],
  [10], [Interplanetary Survival Guide], [Inter.], [Mapa multicapa de una ruta en Marte], [USGS/PDS], [Bajo],
  [11], [Lunar Landing Site Navigator], [Adv.], [Comparador Sol/Tierra por sitio lunar], [SPICE/LOLA], [Alto],
  [12], [Planet X and SPHEREx], [Adv.], [Imágenes del cielo en 102 bandas], [IRSA (502 el 14/11)], [Alto],
  [13], [Space Mission Design Game], [Inter.], [Juego de diseño de misión], [Datos públicos], [Bajo],
  [14], [Earth Information Jukebox], [Inter.], [Sonificación de datos de la Tierra], [EIC/Earthdata], [Bajo],
)

#v(4pt)
#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 5pt,
  block(width: 100%, fill: rgb("#E8F6EE"), radius: 4pt, inset: 5pt)[
    #text(size: 6.8pt, weight: "bold", fill: green)[LISTOS PARA CONSTRUIR]
    #v(1pt)
    #text(size: 6.4pt)[#14 · #3 · #10 · #13 · #1]
  ],
  block(width: 100%, fill: rgb("#FFF4E5"), radius: 4pt, inset: 5pt)[
    #text(size: 6.8pt, weight: "bold", fill: orange)[VIABLES CON FRICCIÓN]
    #v(1pt)
    #text(size: 6.4pt)[#2 · #6 · #7 · #8 · #9]
  ],
  block(width: 100%, fill: rgb("#FDEAEA"), radius: 4pt, inset: 5pt)[
    #text(size: 6.8pt, weight: "bold", fill: red)[ALTO RIESGO TÉCNICO]
    #v(1pt)
    #text(size: 6.4pt)[#5 · #11 · #12]
  ],
)

#pagebreak()

#section("Las 14 fichas", color: cyan)

#grid(
  columns: (1fr, 1fr),
  gutter: 5pt,
  row-gutter: 4.5pt,
  [
    #reto("01", "Abandoned but not Forgotten", "Intermediate", blue,
      "Contar la historia del hardware abandonado en la Luna y Marte.",
      "Mapa 3D con pins + ficha + historia de 100 palabras.",
      "NASA Image Library, 3D Resources, NSSDC.",
      "Mucho contenido, poca ciencia; puede verse como presentación.",
      "Fuerte en storytelling; débil si no hay una lectura propia.")
  ],
  [
    #reto("02", "Earth System Trend Detective", "Advanced", green,
      "Detectar tendencias climáticas y decidir si son significativas.",
      "3 variables, 1 región, mapa + serie + veredicto estadístico.",
      "Earthdata (GES DISC, LP DAAC), Giovanni, POWER.",
      "Autenticación, datos grandes; riesgo de “otro dashboard”.",
      "Ciencia real; la significancia es difícil de explicar en 30 s.")
  ],
  [
    #reto("03", "Junior Astronaut Mission Trainer", "Intermediate", cyan,
      "Gestionar un puesto lunar equilibrando soporte vital, energía y comida.",
      "10 turnos, 5 recursos, 8 eventos, 3 finales; partida < 5 min.",
      "Life Support Baseline, LRO/CRaTER, energía solar.",
      "Que sea gestión genérica; la ciencia debe estar en el feedback.",
      "El más jugable en 48 h; ya existe un intento previo de trivia.")
  ],
  [
    #reto("04", "Health Monitoring for Astronauts", "Intermediate", orange,
      "Recolectar indicadores de salud y ayudar a decidir al astronauta.",
      "30 días simulados, 5 indicadores, semáforo, alerta y acción.",
      "HERA, bed rest, literatura; sintéticos etiquetados.",
      "No hay datos reales públicos; sin honestidad es ficción.",
      "Problema humano; compite contra apps de salud comerciales.")
  ],
  [
    #reto("05", "Dancing with the SARs", "Advanced", red,
      "Rastrear cambios de superficie con radar de NISAR.",
      "2 fechas, slider antes/después y explicación del SAR.",
      "ASF DAAC (NISAR, Sentinel-1), Earthdata Login.",
      "Descargas enormes y procesamiento InSAR.",
      "El demo visual más fuerte; sin plan B, frágil en vivo.")
  ],
  [
    #reto("06", "Field Shift: Adapting Farms", "Advanced", green,
      "Combinar datos NASA y suelo local para proponer rotaciones.",
      "Formulario → 3 rotaciones con pros, agua y resiliencia.",
      "SMAP, MODIS, POWER, SoilGrids.",
      "Integrar fuentes y validar agronomía sin agrónomo.",
      "Impacto local claro; exige validación externa.")
  ],
  [
    #reto("07", "Flame in Freefall", "Advanced", orange,
      "Ordenar décadas de investigación sobre fuego en microgravedad.",
      "20 papers, buscador semántico, respuestas con cita.",
      "BASS, FLEX, Saffire, NTRS.",
      "Corpus y alucinaciones; cada respuesta debe citar.",
      "Hay material sin ordenar; un RAG es fácil de demo, difícil de sorprender.")
  ],
  [
    #reto("08", "MODIS + VIIRS Hot Spots", "Advanced", red,
      "Armonizar 20 años de incendios de sensores distintos.",
      "Una región, 20 años, calendario heatmap + mapa.",
      "FIRMS API (MODIS C6.1, VIIRS), shapefiles.",
      "La armonización necesita un método defendible.",
      "Problema real de datos; difícil de explicar en 30 s.")
  ],
  [
    #reto("09", "Earth Analogs for Moon/Mars", "Advanced", blue,
      "Identificar lugares terrestres análogos a bases lunares/marcianas.",
      "10 sitios, 6 criterios, mapa + ranking + ficha.",
      "Earthdata, USGS, MOLA, CTX, HiRISE.",
      "Sin experto, el peso de los criterios parece arbitrario.",
      "Conecta Tierra y espacio; el método es la parte difícil.")
  ],
  [
    #reto("10", "Interplanetary Survival Guide", "Intermediate", cyan,
      "Dar a los astronautas un mapa multicapa de una ruta en Marte.",
      "Ruta de 5 km, 5 capas, perfil y 5 paradas.",
      "USGS Mars, Mars Trek, PDS, HiRISE, CRISM.",
      "Mapa lindo sin historia; cada capa necesita un porqué.",
      "Visual y abierto; hay que aportar una lectura propia.")
  ],
  [
    #reto("11", "Lunar Landing Site Navigator", "Advanced", orange,
      "Comparar sitios y fechas por Sol, Tierra, energía y comms.",
      "3 sitios, 30 días, horizonte + gráfico + semáforo.",
      "SPICE (NAIF), LOLA/LRO, efemérides.",
      "Un error de geometría invalida todo el producto.",
      "Decisión de misión real y muy visual; exige validar SPICE.")
  ],
  [
    #reto("12", "Planet X and SPHEREx", "Advanced", blue,
      "Ver imágenes del cielo en 102 bandas y detectar cambios.",
      "Coordenada → 20–40 épocas → blink + diferencia + ficha.",
      "IRSA SIA2, cutouts, TAP, HiPS (502 el 14/11).",
      "API intermitente, cutouts pesados, movimiento sub-píxel.",
      "El demo más hipnótico; sin caché propia, depende de una API frágil.")
  ],
  [
    #reto("13", "Space Mission Design Game", "Intermediate", cyan,
      "Diseñar una misión equilibrando masa, energía, órbita y costo.",
      "3 objetivos, 4 cohetes, 6 instrumentos, 5 eventos.",
      "NASA Launch Services, misiones públicas, modelos simples.",
      "Que sea números sin diversión; el feedback es todo.",
      "Trade-offs reales; el balance de juego es difícil en 48 h.")
  ],
  [
    #reto("14", "Earth Information Jukebox", "Intermediate", green,
      "Traducir visualizaciones de la Tierra a sonido en tiempo real.",
      "3 escenas, 3 sonificaciones, controles y mapping explicado.",
      "EIC frames, Earthdata, Web Audio.",
      "Que el sonido sea arbitrario; el mapping debe justificarse.",
      "El mayor espacio para algo nuevo; exige video bien grabado.")
  ],
)

#pagebreak()

#section("Matriz de decisión", color: navy)

#text(size: 6.8pt, fill: muted)[
  Escala 1–5. Total /20. Es una lectura interna para ordenar la discusión,
  no una medición: el equipo puede cambiar cualquier puntaje y el orden.
]

#v(3pt)
#table(
  columns: (0.55cm, 5.2fr, 1.5cm, 1.5cm, 1.5cm, 1.9cm, 1.4cm),
  inset: 2.6pt,
  stroke: 0.4pt + lineColor,
  fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
  table.header(
    text(fill: white, weight: "bold", size: 6.2pt)[\#],
    text(fill: white, weight: "bold", size: 6.2pt)[Reto],
    text(fill: white, weight: "bold", size: 6.2pt)[Datos],
    text(fill: white, weight: "bold", size: 6.2pt)[Demo],
    text(fill: white, weight: "bold", size: 6.2pt)[48 h],
    text(fill: white, weight: "bold", size: 6.2pt)[Diferenciación],
    text(fill: white, weight: "bold", size: 6.2pt)[Total],
  ),
  [1], [Abandoned but not Forgotten], [5], [4], [4], [3], [*16*],
  [2], [Earth System Trend Detective], [4], [3], [3], [3], [*13*],
  [3], [Junior Astronaut Mission Trainer], [5], [3], [5], [4], [*17*],
  [4], [Health Monitoring for Astronauts], [2], [3], [4], [4], [*13*],
  [5], [Dancing with the SARs], [2], [5], [2], [4], [*13*],
  [6], [Field Shift: Adapting Farms], [3], [3], [3], [3], [*12*],
  [7], [Flame in Freefall], [4], [3], [3], [4], [*14*],
  [8], [MODIS + VIIRS Hot Spots], [4], [4], [3], [3], [*14*],
  [9], [Earth Analogs for Moon/Mars], [3], [4], [2], [3], [*12*],
  [10], [Interplanetary Survival Guide], [4], [5], [4], [4], [*17*],
  [11], [Lunar Landing Site Navigator], [4], [4], [2], [5], [*15*],
  [12], [Planet X and SPHEREx], [2], [5], [2], [5], [*14*],
  [13], [Space Mission Design Game], [5], [3], [5], [4], [*17*],
  [14], [Earth Information Jukebox], [4], [5], [4], [5], [*18*],
)

#v(3pt)
#text(size: 6.4pt, fill: muted)[
  *Datos:* ¿se consigue sin fricción? · *Demo:* ¿se entiende y sorprende en 10 s? ·
  *48 h:* ¿hay algo usable el domingo? · *Diferenciación:* ¿hay espacio para una idea propia?
]

#section("Cómo decidir en 20 minutos", color: orange)

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 6pt,
  card("1 · Descartar (5 min)", [
    Cada persona marca los retos cuyo dato no podría conseguir hoy.
    Se van los que tengan 3 o más marcas.
  ], color: red),
  card("2 · Votar (10 min)", [
    Cada persona elige *3 retos* y los ordena.
    Puntaje: 3, 2 y 1.
  ], color: cyan),
  card("3 · Prueba de la frase (5 min)", [
    “Es una app que \_\_\_\_\_\_ para \_\_\_\_\_\_, usando \_\_\_\_\_\_ de NASA.”
    Si no sale en una frase, no está listo para el pitch.
  ], color: green),
)

#v(3pt)
#text(size: 7pt)[
  *Desempate, en orden:* ¿tenemos el dato hoy? → ¿se puede usar el domingo a las 12:00? →
  ¿alguien ya trabajó con ese dato? → ¿el demo se entiende sin audio ni explicación?
]

#section("Preguntas para el equipo", color: red)

#grid(
  columns: (1fr, 1fr),
  gutter: 6pt,
  row-gutter: 4pt,
  [
    - ¿Qué demo se explica en 10 segundos, sin audio?
    - ¿Qué dato podemos abrir hoy, sin permiso ni 10 GB?
  ],
  [
    - ¿Quién ya trabajó con ese tipo de dato?
    - ¿Qué pasa si la API falla el domingo?
  ],
)

#section("Registro de la decisión", color: green)

#table(
  columns: (4.2cm, 1fr),
  inset: 5pt,
  stroke: 0.5pt + lineColor,
  fill: (x, y) => if x == 0 { paper } else { white },
  [Fecha de la votación], [],
  [Reto elegido], [],
  [Votos (3-2-1)], [],
  [Por qué], [],
  [Plan B si falla el dato], [],
  [Responsable de datos], [],
  [Responsable de demo], [],
)

#v(4pt)
#block(width: 100%, fill: navy, radius: 5pt, inset: (x: 8pt, y: 6pt))[
  #text(fill: cyan, weight: "bold", size: 7.4pt)[REGLA QUE NO SE NEGOCIA]
  #v(2pt)
  #text(fill: white, size: 7.2pt)[
    Sin dato NASA accesible no hay problema. El reto se elige por el dato y por el demo,
    no por la idea más linda en la pizarra.
  ]
]
