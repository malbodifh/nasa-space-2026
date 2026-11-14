#import "theme.typ": *

#let idea(n, reto, nombre, twist, color) = block(
  width: 100%,
  fill: paper,
  stroke: (left: 3pt + color),
  radius: 4pt,
  inset: (x: 5pt, y: 3.4pt),
  breakable: false,
)[
  #grid(
    columns: (0.72cm, 1fr),
    gutter: 3.5pt,
    align: (center + horizon, left),
    text(fill: color, weight: "bold", size: 10.5pt)[#n],
    [
      #text(size: 6pt, fill: muted, weight: "bold")[#reto]
      #v(0.3pt)
      #text(size: 8.2pt, weight: "bold")[#nombre]
      #v(0.3pt)
      #text(size: 6.6pt)[#twist]
    ],
  )
]

#title_block(
  "14 RETOS · 14 IDEAS",
  "Una idea por challenge",
  "Coherente con el reto, sin ser la solución obvia · cada tarjeta trae el twist",
)

#v(1.5pt)
#text(size: 7.4pt, fill: muted)[
  Para votar: leé el *nombre* y el twist. El detalle —datos, demo, riesgo, 48 h— está en `docs/20-ideas-creativas.md`.
]

#section("Las 14 ideas", color: cyan)

#grid(
  columns: (1fr, 1fr),
  gutter: 5pt,
  [
    #idea("01", "ABANDONED BUT NOT FORGOTTEN", "Exit Interview",
      "Entrevistas de despedida al hardware abandonado: el objeto \"habla\" y deja un legajo.", blue)
    #v(1.8pt)
    #idea("02", "EARTH SYSTEM TREND DETECTIVE", "The Trend Court",
      "Un juicio con evidencia, testigos y veredicto: enseña significancia sin dar una clase.", orange)
    #v(1.8pt)
    #idea("03", "JUNIOR ASTRONAUT TRAINER", "Delay",
      "Cooperativo con 20 min de latencia Marte–Tierra: el problema real es comunicar, no el oxígeno.", cyan)
    #v(1.8pt)
    #idea("04", "HEALTH MONITORING FOR ASTRONAUTS", "Gravity Check",
      "Pronóstico del clima de tu salud: verde, amarillo o rojo, con 3 acciones concretas.", green)
    #v(1.8pt)
    #idea("05", "DANCING WITH THE SARS", "The Sinking City",
      "Misterio resuelto con interferogramas: ¿por qué se hunde la ciudad?", red)
    #v(1.8pt)
    #idea("06", "FIELD SHIFT: ADAPTING FARMS", "10 Seasons",
      "Simulador de 10 temporadas: heredás un campo y vivís las consecuencias de cada rotación.", green)
    #v(1.8pt)
    #idea("07", "FLAME IN FREEFALL", "Fire Drill",
      "Crisis de 5 minutos en un hábitat: cada decisión con evidencia de combustión en microgravedad.", orange)
  ],
  [
    #idea("08", "MODIS + VIIRS HOT SPOTS", "The Fire Almanac",
      "Almanaque narrativo semanal: comparás 20 años de incendios y volvés cada semana.", red)
    #v(1.8pt)
    #idea("09", "EARTH ANALOGS FOR MOON/MARS", "Match Point",
      "Dating app de sitios análogos: definís necesidades y la app calcula compatibilidad.", blue)
    #v(1.8pt)
    #idea("10", "INTERPLANETARY SURVIVAL GUIDE", "Mars Commute",
      "Google Maps para Marte: ruta, tiempo, energía, radiación y ventana de comunicaciones.", cyan)
    #v(1.8pt)
    #idea("11", "LUNAR LANDING SITE NAVIGATOR", "Earthrise",
      "Reloj poético: cuándo sale la Tierra en tu sitio lunar y cuánta luz te queda.", orange)
    #v(1.8pt)
    #idea("12", "PLANET X AND SPHEREX", "The Sky's Memory",
      "Rewind del cielo: los objetos dejan \"fantasmas\" y cada uno abre un dossier espectral.", navy)
    #v(1.8pt)
    #idea("13", "SPACE MISSION DESIGN GAME", "The Review Board",
      "Sos el jurado, no el constructor: aprobás o rechazás misiones con presupuesto finito.", red)
    #v(1.8pt)
    #idea("14", "EARTH INFORMATION JUKEBOX", "Earth's Mixtape",
      "Playlist social de datasets: cada \"canción\" es un fenómeno de NASA y se comparte.", green)
  ],
)

#v(1pt)
#block(
  width: 100%,
  fill: paper,
  stroke: (left: 3pt + orange),
  radius: 3pt,
  inset: (x: 6pt, y: 4pt),
)[
  #text(size: 7pt, weight: "bold", fill: orange)[TOP 5 · ]
  #text(size: 7.3pt)[
    *The Sky's Memory* 5/5 · *Delay* 5/5 · *Fire Drill* 5/5 · *Mars Commute* 4/5 · *The Trend Court* 4/5
  ]
]

#v(2.5pt)

#block(
  width: 100%,
  fill: navy,
  radius: 5pt,
  inset: (x: 8pt, y: 5pt),
)[
  #text(fill: cyan, weight: "bold", size: 7.4pt)[ESTADO DE DATOS · VERIFICADO 14/11/2026]
  #v(2pt)
  #text(fill: white, size: 7.6pt)[
    #text(fill: rgb("#7BE0A8"), weight: "bold")[7 ideas] con datos que responden sin fricción ·
    #text(fill: rgb("#FFC46B"), weight: "bold")[4] necesitan clave gratis (FIRMS + Earthdata) ·
    #text(fill: rgb("#FF9B9B"), weight: "bold")[1] (SPHEREx) devolvió 502 → demo desde caché.
    \
    #text(fill: rgb("#C9D6E8"))[Regla: sin dato NASA accesible, no hay problema.]
  ]
]

