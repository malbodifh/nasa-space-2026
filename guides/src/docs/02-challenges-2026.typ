// Generado desde docs/02-challenges-2026.md con pandoc. No editar a mano.

#import "theme.typ": *

= 02 --- Los 14 retos oficiales 2026
#quote(block: true)[
#strong[Fuente:]
#link("https://www.spaceappschallenge.org/2026/challenges/")[spaceappschallenge.org/2026/challenges]
Traducción y análisis del equipo #strong[Astral Codes]. No es traducción
oficial de NASA. #strong[Revisión:] 14/11/2026. Dificultad según NASA;
el resto es lectura nuestra.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0. Estado de la decisión
#quote(block: true)[
#strong[Decisión abierta.] El equipo reabrió la elección del reto el
14/11/2026. Este documento no asume ningún reto ganador: sirve para
comparar, discutir y votar.
]

#strong[Cómo usar este documento]

+ Leer la #strong[comparación rápida] (§1) para descartar lo que no va.
+ Mirar la #strong[matriz de decisión] (§2): 4 criterios, 20 puntos.
+ Leer solo las #strong[fichas] (§4) de los 5 o 6 retos que queden.
+ Votar con la #strong[rúbrica de 20 minutos] (§5) y registrar la
  decisión (§6).

#strong[Regla que no se negocia:] si no hay dato NASA accesible, el reto
no se elige por lindo que sea el demo. Sin dato, no hay problema.

#quote(block: true)[
¿La idea es alerta temprana de desastres? Antes de votar, leer
`22-investigacion-desastres.md`:
qué datos existen, qué latencia tienen y en qué reto oficial encaja.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Comparación rápida
#figure(
  align(center)[#table(
    columns: (1.0fr, 1.8fr, 1.6fr, 1.8fr, 1.8fr, 1.8fr),
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,auto,),
    table.header([\#], [Reto], [Dificultad], [En una frase], [Dato
      central], [Riesgo],),
    table.hline(),
    [1], [Abandoned but not Forgotten], [Intermediate], [Museo
    interactivo del hardware que NASA dejó en la Luna y
    Marte], [Imágenes y modelos 3D abiertos], [Bajo: mucho contenido,
    poca ciencia],
    [2], [Earth System Trend Detective], [Advanced], [Detective de
    tendencias climáticas con significancia estadística], [Earthdata
    (con cuenta)], [Medio: datos grandes y autenticación],
    [3], [Junior Astronaut Mission Trainer], [Intermediate], [Juego
    donde estudiantes gestionan un puesto lunar], [Conceptos
    ECLSS/HRP], [Bajo: la ciencia está en las reglas],
    [4], [Health Monitoring for Astronauts], [Intermediate], [Panel de
    salud para tripulaciones de misión larga], [HRP, análogos
    HERA], [Alto: no hay datos reales públicos],
    [5], [Dancing with the SARs], [Advanced], [Mapa de cambios de
    superficie con radar NISAR], [ASF / NISAR (cuenta)], [Alto: volumen
    y procesamiento InSAR],
    [6], [Field Shift: Adapting Farms], [Advanced], [Recomendador de
    rotaciones de cultivo con datos NASA], [SMAP, MODIS, POWER], [Medio:
    validación agronómica],
    [7], [Flame in Freefall (SI)], [Advanced], [Dashboard con IA sobre
    combustión en microgravedad], [NTRS, experimentos NASA], [Medio:
    corpus y alucinaciones],
    [8], [MODIS + VIIRS Hot Spots], [Advanced], [Calendario armonizado
    de 20 años de incendios], [FIRMS (clave gratis)], [Medio: la
    armonización debe defenderse],
    [9], [Earth Analogs for Moon/Mars], [Advanced], [Ranking de lugares
    terrestres que imitan la Luna o Marte], [Earthdata, USGS,
    MOLA], [Medio: criterios arbitrarios sin experto],
    [10], [Interplanetary Survival Guide], [Intermediate], [Mapa
    multicapa de una ruta en Marte], [USGS, PDS, HiRISE], [Bajo/medio:
    mapa lindo sin historia],
    [11], [Lunar Landing Site Navigator], [Advanced], [Comparador
    Sol/Tierra por sitio y fecha en el polo sur lunar], [SPICE,
    LOLA/LRO], [Alto: geometría y validación],
    [12], [Planet X and SPHEREx], [Advanced], [Comparador de imágenes
    del cielo en 102 bandas], [IRSA / SPHEREx], [Alto: API intermitente
    (502 el 14/11)],
    [13], [Space Mission Design Game], [Intermediate], [Juego de diseño
    de misión con presupuesto y trade-offs], [Datos públicos de
    misiones], [Bajo: diversión y balance],
    [14], [Earth Information Jukebox], [Intermediate], [Sonificación de
    visualizaciones del Earth Information Center], [EIC frames,
    Earthdata], [Bajo/medio: mapping arbitrario],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. Matriz de decisión
Escala 1--5 por criterio. #strong[Total /20.] Es una lectura interna
para ordenar la discusión, no una medición: el equipo puede cambiar
cualquier puntaje y el orden.

#figure(
  align(center)[#table(
    columns: (1.0fr, 0.7fr, 2.0fr, 2.4fr, 0.9fr, 0.5fr, 1.4fr),
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,auto,auto,),
    table.header([\#], [Reto], [Datos], [Demo], [48
      h], [Diferenciación], [Total],),
    table.hline(),
    [1], [Abandoned but not
    Forgotten], [5], [4], [4], [3], [#strong[16]],
    [2], [Earth System Trend
    Detective], [4], [3], [3], [3], [#strong[13]],
    [3], [Junior Astronaut Mission
    Trainer], [5], [3], [5], [4], [#strong[17]],
    [4], [Health Monitoring], [2], [3], [4], [4], [#strong[13]],
    [5], [Dancing with the SARs], [2], [5], [2], [4], [#strong[13]],
    [6], [Field Shift: Farms], [3], [3], [3], [3], [#strong[12]],
    [7], [Flame in Freefall], [4], [3], [3], [4], [#strong[14]],
    [8], [MODIS + VIIRS Hot Spots], [4], [4], [3], [3], [#strong[14]],
    [9], [Earth Analogs], [3], [4], [2], [3], [#strong[12]],
    [10], [Martian Map], [4], [5], [4], [4], [#strong[17]],
    [11], [Lunar Landing Site
    Navigator], [4], [4], [2], [5], [#strong[15]],
    [12], [Planet X and SPHEREx], [2], [5], [2], [5], [#strong[14]],
    [13], [Space Mission Design
    Game], [5], [3], [5], [4], [#strong[17]],
    [14], [Earth Information
    Jukebox], [4], [5], [4], [5], [#strong[18]],
  )]
  , kind: table
  )

#strong[Qué mide cada columna]

- #strong[Datos:] ¿se consigue el dato sin fricción y alcanza para el
  demo?
- #strong[Demo:] ¿se entiende y sorprende en 10 segundos de video?
- #strong[48 h:] ¿un equipo de 5 puede tener algo jugable/usable el
  domingo?
- #strong[Diferenciación:] ¿hay espacio para una idea propia o se
  compara con la herramienta oficial?

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Shortlist
=== A. Listos para construir (datos abiertos + demo claro)
#strong[\#14 Jukebox · \#3 Junior Astronaut · \#10 Martian Map · \#13
Mission Design Game · \#1 Abandoned]

Son los que permiten empezar hoy sin depender de una API que falle. Los
tres juegos (\#3, \#13, \#14) además se explican en una frase, que es lo
que el jurado recuerda.

=== B. Viables con fricción conocida
#strong[\#2 Trend Detective · \#6 Farms · \#7 Flame · \#8 Hot Spots ·
\#9 Earth Analogs]

Necesitan cuenta gratis (Earthdata/FIRMS) o un corpus curado. Se pueden
hacer, pero consumen horas de la primera mitad del hackatón en plomería,
no en producto.

=== C. Alto riesgo técnico
#strong[\#5 SAR · \#11 Lunar Navigator · \#12 SPHEREx]

El demo depende de descargas pesadas, geometría orbital o una API que ya
falló. Solo elegirlos si hay alguien del equipo que ya trabajó con ese
dato.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Fichas
=== 1. Abandoned but not Forgotten
#strong[Qué pide:] contar la historia del hardware que NASA dejó en la
Luna, Marte y el espacio profundo, para que estudiantes entiendan qué
hizo posible la ciencia.

#strong[MVP 48 h:] mapa 3D de la Luna/Marte con pins; ficha con foto,
misión, estado actual y una historia de 100 palabras; modo docente con
preguntas.

#strong[Datos:] NASA Image and Video Library, NASA 3D Resources,
archivos de misión, NSSDC.

#strong[Demo que convence:] click en un pin → el objeto “cuenta” su
historia con una foto real.

#strong[Riesgo:] mucho contenido y poca ciencia; sin un diseño excelente
se ve como una presentación con mapa.

#strong[Por qué sí:] datos abiertos, historia emocional, encaja con
#emph[Best Storytelling]. #strong[Por qué no:] el jurado puede verlo
como museo, no como herramienta.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 2. Be An Earth System Trend Detective!
#strong[Qué pide:] elegir variables de misiones/modelos NASA, ver cómo
cambian en el tiempo y decidir si el cambio es estadísticamente
significativo.

#strong[MVP 48 h:] 3 variables, 1 región; mapa de tendencia + serie
temporal + tarjeta “significativo / no significativo” + explicación en
lenguaje simple.

#strong[Datos:] NASA Earthdata (GES DISC, LP DAAC), Giovanni, POWER,
MODIS, GRACE-FO.

#strong[Demo que convence:] el mismo lugar sube en una variable y baja
en otra; el veredicto estadístico cambia la conclusión.

#strong[Riesgo:] autenticación Earthdata, datos grandes y limpieza; sin
cuidado es “otro dashboard”.

#strong[Por qué sí:] ciencia real y #emph[Best Use of Science].
#strong[Por qué no:] la significancia es difícil de explicar en 30 s sin
simplificar de más.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3. Build a Junior Astronaut Mission Trainer
#strong[Qué pide:] un juego o app donde estudiantes gestionan un puesto
lunar o marciano, equilibrando soporte vital, radiación, energía y
alimentos.

#strong[MVP 48 h:] 10 turnos, 5 recursos, 8 eventos (tormenta solar,
fuga de O₂, falla de cultivo), 3 finales; una partida completa en menos
de 5 minutos.

#strong[Datos:] NASA Life Support Baseline Values, radiación
(LRO/CRaTER), energía solar, invernaderos; el contenido se escribe desde
fuentes públicas.

#strong[Demo que convence:] una decisión → un recurso cae → el juego
explica por qué y cita NASA.

#strong[Riesgo:] que sea un juego genérico de gestión; la ciencia tiene
que estar en los números y en el feedback, no en el título.

#strong[Por qué sí:] el más jugable en 48 h; el feedback puede ser el
diferencial. #strong[Por qué no:] es el reto más “obvio” y ya existe la
trivia como intento previo.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4. Create Health Monitoring Software for Astronauts
#strong[Qué pide:] software que recolecte indicadores de salud (sueño,
hueso, cardiovascular, radiación, salud mental) y ayude al astronauta a
evaluar y actuar.

#strong[MVP 48 h:] simulación de 30 días, 5 indicadores, semáforo de
riesgo, una alerta y una recomendación concreta.

#strong[Datos:] estudios análogos de NASA (HERA, bed rest), literatura y
datos sintéticos #strong[etiquetados como sintéticos].

#strong[Demo que convence:] un indicador se pone en rojo y el sistema
propone tres acciones.

#strong[Riesgo:] no hay datos reales de astronautas públicos; sin
honestidad, se vuelve ficción.

#strong[Por qué sí:] problema humano y #emph[Galactic Impact].
#strong[Por qué no:] un dashboard de salud sin datos reales compite
contra apps comerciales.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 5. Dancing with the SARs
#strong[Qué pide:] app interactiva con radar de NISAR para rastrear
cambios de superficie (humedales, incendios, terremotos, glaciares).

#strong[MVP 48 h:] 2 fechas, slider antes/después, explicación de qué es
un SAR y por qué ve a través de nubes.

#strong[Datos:] ASF DAAC (NISAR, Sentinel-1), Earthdata Login.

#strong[Demo que convence:] el antes/después de un glaciar o una ciudad
que se hunde.

#strong[Riesgo:] acceso, tamaños enormes y procesamiento InSAR; el demo
puede quedar en imágenes preprocesadas.

#strong[Por qué sí:] el demo visual más fuerte de los 14. #strong[Por
qué no:] si la descarga falla en vivo, no hay plan B creíble.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 6. Field Shift: Adapting Farms with NASA Data
#strong[Qué pide:] herramienta que combine observaciones NASA, suelo
local, cultivo y prioridades del agricultor para explorar rotaciones más
resilientes.

#strong[MVP 48 h:] formulario (ubicación, suelo, agua, objetivo) → 3
rotaciones con pros/contras, huella hídrica y resiliencia climática.

#strong[Datos:] SMAP, MODIS, POWER, SoilGrids, datos locales.

#strong[Demo que convence:] dos rotaciones, la misma finca, distinta
agua y distinto riesgo.

#strong[Riesgo:] integrar muchas fuentes y validar agronomía; sin
agrónomo, las recomendaciones son superficiales.

#strong[Por qué sí:] impacto local claro y #emph[Best Use of Data].
#strong[Por qué no:] el jurado puede preguntar “¿esto lo validó un
agrónomo?”.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 7. Flame in Freefall (SI)
#strong[Qué pide:] dashboard con IA que resuma, ordene e interprete
décadas de investigación NASA sobre fuego en microgravedad, para
seguridad contra incendios.

#strong[MVP 48 h:] 20 documentos, buscador semántico, 5 preguntas de
ejemplo, respuestas con cita.

#strong[Datos:] NASA combustión (BASS, FLEX, Saffire), NTRS, papers.

#strong[Demo que convence:] preguntar “¿cómo se apaga una llama
esférica?” y recibir una respuesta con la cita del experimento.

#strong[Riesgo:] calidad del corpus y alucinaciones; cada respuesta debe
citar.

#strong[Por qué sí:] hay mucho material y nadie lo tiene ordenado.
#strong[Por qué no:] un RAG es fácil de demo, difícil de sorprender.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 8. Harmonization of MODIS and VIIRS Hot Spots
#strong[Qué pide:] armonizar más de 20 años de detecciones de incendios
de sensores distintos en un calendario de actividad de quema.

#strong[MVP 48 h:] una región, 20 años, calendario tipo heatmap + mapa +
comparación de sensores.

#strong[Datos:] NASA FIRMS API (MODIS C6.1, VIIRS 375 m/750 m),
shapefiles, límites administrativos.

#strong[Demo que convence:] el mismo mes, dos sensores, y la diferencia
explicada.

#strong[Riesgo:] la armonización seria necesita un método defendible;
sin eso es un mapa bonito.

#strong[Por qué sí:] problema real de datos y #emph[Best Use of Data].
#strong[Por qué no:] explicar la corrección entre sensores en 30 s es
cuesta arriba.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 9. Earth Analogs for Moon/Mars Bases
#strong[Qué pide:] identificar y caracterizar lugares de la Tierra
análogos a bases lunares o marcianas, con datos abiertos.

#strong[MVP 48 h:] 10 sitios candidatos, 6 criterios (pendiente,
temperatura, radiación, mineralogía, acceso, agua), mapa + ranking +
ficha comparativa.

#strong[Datos:] Earthdata, USGS, MOLA, CTX, HiRISE, OpenStreetMap.

#strong[Demo que convence:] un sitio terrestre y su equivalente lunar
lado a lado.

#strong[Riesgo:] sin experto, el ranking parece arbitrario.

#strong[Por qué sí:] conecta Tierra y espacio, #emph[Best Use of
Science]. #strong[Por qué no:] el peso de los criterios es la parte
difícil y no se ve en el demo.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 10. Interplanetary Survival Guide: Martian Map
#strong[Qué pide:] vista multicapa de un lugar o ruta en Marte con datos
de varias misiones NASA: rutas, destinos, condiciones y recursos.

#strong[MVP 48 h:] una ruta de 5 km, 5 capas, perfil de elevación, 5
paradas con datos.

#strong[Datos:] USGS Mars, Mars Trek, PDS, HiRISE, MOLA, CRISM.

#strong[Demo que convence:] recorrer la ruta y ver cómo cambian
radiación, polvo y pendiente.

#strong[Riesgo:] mapa lindo sin historia; cada capa necesita un “por
qué”.

#strong[Por qué sí:] visual, datos abiertos y #emph[Best Mission
Concept]. #strong[Por qué no:] hay visores oficiales de Marte; hay que
aportar una lectura propia.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 11. Lunar Landing Site Navigator
#strong[Qué pide:] comparar sitios y fechas del polo sur lunar
visualizando Sol y Tierra respecto del horizonte, para evaluar energía y
ventanas de comunicación.

#strong[MVP 48 h:] 3 sitios, 30 días, horizonte local + gráfico
Sol/Tierra + semáforo de energía y comms.

#strong[Datos:] SPICE (NAIF), LOLA/LRO, efemérides.

#strong[Demo que convence:] el mismo sitio cambia de viable a inviable
según la fecha.

#strong[Riesgo:] geometría SPICE y terreno; hay que validar con un caso
conocido.

#strong[Por qué sí:] decisión de misión real y muy visual. #strong[Por
qué no:] un error de geometría invalida todo el producto.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 12. Planet X and SPHEREx
#strong[Qué pide:] herramienta web pública para ver imágenes del cielo
de SPHEREx (102 bandas) y detectar cambios entre épocas.

#strong[MVP 48 h:] coordenada → 20--40 épocas → blink + diferencia +
slider + ficha.

#strong[Datos:] IRSA SIA2, cutouts, TAP, HiPS, AWS.

#strong[Demo que convence:] parpadeo entre dos épocas y un objeto que se
mueve.

#strong[Riesgo:] TAP intermitente (502 el 14/11), cutouts pesados,
movimiento sub-píxel.

#strong[Por qué sí:] el dato más “NASA” y el demo más hipnótico.
#strong[Por qué no:] sin caché propia, el demo depende de una API que ya
falló.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 13. Space Mission Design Game
#strong[Qué pide:] juego para diseñar una misión completa equilibrando
objetivos, nave, instrumentos, cohete, presupuesto, energía, masa,
comunicaciones y órbita.

#strong[MVP 48 h:] 3 objetivos, 4 cohetes, 6 instrumentos, 5 eventos;
una misión completa.

#strong[Datos:] NASA Launch Services, datos públicos de misiones,
modelos simplificados.

#strong[Demo que convence:] dos diseños, el mismo presupuesto, y uno
falla por una decisión que el jugador tomó.

#strong[Riesgo:] que sea un juego de números sin diversión; el feedback
es todo.

#strong[Por qué sí:] trade-offs reales y muy alineado con el reto.
#strong[Por qué no:] el balance de juego es difícil de clavar en 48 h.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 14. The Earth Information Jukebox
#strong[Qué pide:] traducir la ciencia de la Tierra a sonido: combinar
frames del Earth Information Center con sonificación dinámica en tiempo
real.

#strong[MVP 48 h:] 3 escenas, 3 sonificaciones, controles accesibles y
la explicación del mapping.

#strong[Datos:] EIC frames/videos, NASA Earthdata; Web Audio para el
sonido.

#strong[Demo que convence:] el mismo fenómeno suena distinto al cambiar
de variable.

#strong[Riesgo:] que el sonido sea arbitrario; el mapping tiene que ser
intuitivo y documentado.

#strong[Por qué sí:] es el reto con más espacio para algo que el jurado
no haya visto. #strong[Por qué no:] el audio no se puede “mostrar” en
una captura; exige video bien grabado.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Cómo decidir en 20 minutos
#strong[Ronda 1 --- descartar (5 min).] Cada persona marca los retos
cuyo dato no podría conseguir hoy. Se van los que tengan 3 o más marcas.

#strong[Ronda 2 --- votar (10 min).] Cada persona elige #strong[3 retos]
y los ordena. Puntaje: 3, 2, 1.

#strong[Ronda 3 --- prueba de la frase (5 min).] Para el top 3,
completar en voz alta:

#quote(block: true)[
“Es una app que \_\_\_\_\_\_ para \_\_\_\_\_\_, usando \_\_\_\_\_\_ de
NASA.”
]

Si no sale en una frase, el reto no está listo para el pitch.

#strong[Desempate, en este orden:]

+ ¿Tenemos el dato hoy? (gana el que no necesita cuenta ni descarga
  grande)
+ ¿Se puede jugar/usar el domingo a las 12:00?
+ ¿Alguien del equipo ya trabajó con ese tipo de dato?
+ ¿El demo se entiende sin audio ni explicación?

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. Registro de la decisión
Completar cuando el equipo vote.

#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Campo], [Valor],),
    table.hline(),
    [Fecha de la votación], [],
    [Reto elegido], [],
    [Votos (3-2-1)], [],
    [Por qué], [],
    [Plan B (si falla el dato)], [],
    [Responsable de datos], [],
    [Responsable de demo], [],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Links oficiales
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([\#], [Challenge], [URL],),
    table.hline(),
    [1], [Abandoned but not
    Forgotten], [#link("https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/")],
    [2], [Be An Earth System Trend
    Detective!], [#link("https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/")],
    [3], [Build a Junior Astronaut Mission
    Trainer], [#link("https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/")],
    [4], [Create Health Monitoring Software for
    Astronauts], [#link("https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/")],
    [5], [Dancing with the
    SARs], [#link("https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/")],
    [6], [Field Shift: Adapting Farms with NASA
    Data], [#link("https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/")],
    [7], [Flame in
    Freefall], [#link("https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/")],
    [8], [Harmonization of MODIS and VIIRS Hot
    Spots], [#link("https://www.spaceappschallenge.org/2026/challenges/modis-and-viirs-hot-spots/")],
    [9], [Earth Analogs for Moon/Mars
    Bases], [#link("https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/")],
    [10], [Interplanetary Survival Guide: Martian
    Map], [#link("https://www.spaceappschallenge.org/2026/challenges/interplanetary-survival-guide-martian-map/")],
    [11], [Lunar Landing Site
    Navigator], [#link("https://www.spaceappschallenge.org/2026/challenges/lunar-landing-site-navigator/")],
    [12], [Planet X and
    SPHEREx], [#link("https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/")],
    [13], [Space Mission Design
    Game], [#link("https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/")],
    [14], [The Earth Information
    Jukebox], [#link("https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/")],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Nota sobre “Create Your Own Challenge”
Históricamente NASA ofrece una categoría “Create Your Own Challenge”,
pero #strong[no es elegible para Global Judging] ni para Global Awards.
En 2026 la lista oficial tiene 14 retos y no aparece. Si el equipo
quiere hacer algo distinto, la estrategia es #strong[encajarlo dentro de
un reto oficial]. Ver #link("09-custom-challenge.md").