// Generado desde backups/ideas/spherex/docs/07-pitch-30s.md con pandoc. No editar a mano.

#import "theme.typ": *

= 07 --- Pitch de 30 segundos (y cómo hacerlo bien)
#quote(block: true)[
#strong[Regla oficial:] el demo es un video de #strong[≤30 segundos]
#strong[o] un deck de #strong[≤7 slides] (incluyendo título).
#strong[Idioma:] la submission y los slides en inglés. El video puede
ser en español #strong[con subtítulos en inglés]. #strong[Criterio de
jurado:] Impact, Creativity, Validity, Relevance, Presentation (escala
1--5).
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Lo que dice la guía oficial (traducido)
El video debe seguir esta estructura:

#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Tiempo], [Qué decir],),
    table.hline(),
    [#strong[0:00]], [#strong[Presentate:] tu nombre y el nombre del
    equipo.],
    [#strong[0:02]], [#strong[Entrá en tema:] ¿qué challenge abordás?
    ¿qué te inspiró?],
    [#strong[0:05]], [#strong[Nombrá el proyecto:] título y tagline que
    capturen la atención.],
    [#strong[0:10]], [#strong[Describí la idea:] ¿cómo funciona? Mostrá
    imágenes o el prototipo, describí la experiencia del usuario y cómo
    usaron datos abiertos de NASA.],
    [#strong[0:20--0:30]], [#strong[Mirá al futuro:] ¿qué podría lograr?
    ¿qué impacto tiene para las personas, el mundo y más allá?],
  )]
  , kind: table
  )

#strong[Límites:] si te pasás de 30 s o de 7 slides, #strong[no sos
elegible para Global Judging].

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. Cómo se puntúa (y cómo sacar 5)
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Criterio], [Qué busca el jurado], [Cómo lo logramos],),
    table.hline(),
    [#strong[Impact]], [Problema importante, audiencia amplia, cambio
    real], [“Cualquiera puede ayudar a descubrir objetos”; ciencia
    ciudadana; educación],
    [#strong[Creativity]], [Idea original o mejora
    significativa], [Blink + diferencia + 102 bandas + trayectoria
    sub-píxel en una sola UI],
    [#strong[Validity]], [Base científica, factible, usable], [Datos
    reales de SPHEREx/IRSA; pipeline reproducible; demo funcionando],
    [#strong[Relevance]], [Responde al challenge y usa NASA data de
    forma central], [Es literalmente el challenge; SIA2/cutouts/HiPS son
    el core],
    [#strong[Presentation]], [Storytelling claro, estructura,
    delivery], [Guion de 30 s, visuals fuertes, ensayo, subtítulos],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Guion del video (30 s) --- versión español
#strong[Nombre de trabajo:] SkyBlink (se puede cambiar).
#strong[Tagline:] “El cielo cambia. Ahora lo podés ver.”

#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Tiempo], [Audio (español)], [Visual],),
    table.hline(),
    [#strong[0:00]], [“Hola, soy Andy, de Astral Codes.”], [Plano del
    equipo / logo],
    [#strong[0:02]], [“Elegimos Planet X and SPHEREx: cada seis meses,
    SPHEREx fotografía todo el cielo en 102 bandas
    infrarrojas.”], [Render de SPHEREx / animación all-sky],
    [#strong[0:05]], [“Nadie puede revisar mil millones de objetos a
    mano. Por eso creamos #strong[SkyBlink]\.”], [Logo + tagline],
    [#strong[0:09]], [“Escribís una coordenada y ves una película de ese
    parche del cielo entre épocas.”], [Grabación: input + blink],
    [#strong[0:13]], [“Activás la diferencia, movés el slider de 102
    bandas y la herramienta marca candidatos a movimiento.”], [Toggle
    diff + slider + marcadores],
    [#strong[0:20]], [“Así, cualquiera puede ayudar a encontrar
    asteroides, enanas marrones y estrellas variables.”], [Iconos / arte
    \/ galería],
    [#strong[0:25]], [“NASA abrió los datos. Nosotros abrimos la puerta
    para mirarlos.”], [Créditos NASA/IRSA],
    [#strong[0:29]], [“Astral Codes. Gracias.”], [Equipo + URL],
  )]
  , kind: table
  )

#strong[Duración objetivo:] 29--30 s. #strong[Palabras:] \~75.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Guion del video (30 s) --- versión inglés (para subtítulos)
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Time], [Audio (English)],),
    table.hline(),
    [#strong[0:00]], [“Hi, I\'m Andy from Astral Codes.”],
    [#strong[0:02]], [“We chose Planet X and SPHEREx: every six months,
    SPHEREx maps the entire sky in 102 infrared bands.”],
    [#strong[0:05]], [“No one can inspect a billion objects by hand. So
    we built #strong[SkyBlink]\.”],
    [#strong[0:09]], [“Enter a coordinate and watch a movie of that
    patch across epochs.”],
    [#strong[0:13]], [“Turn on difference mode, slide through 102 bands,
    and SkyBlink flags moving candidates.”],
    [#strong[0:20]], [“Now anyone can help find asteroids, brown dwarfs,
    and variable stars.”],
    [#strong[0:25]], [“NASA opened the data; we open the door to look at
    it.”],
    [#strong[0:29]], [“Astral Codes. Thank you.”],
  )]
  , kind: table
  )

#strong[Subtítulos:] obligatorios si el audio no está en inglés. Podés
usar CapCut, DaVinci Resolve o YouTube Studio.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Storyboard / shot list
+ #strong[0:00 --- Hook humano:] cara de Andy, buena luz, audio claro.
+ #strong[0:02 --- Contexto:] render de SPHEREx o animación del cielo;
  texto “102 bands · every 6 months”.
+ #strong[0:05 --- Nombre:] logo + tagline; fondo oscuro, tipografía
  grande.
+ #strong[0:09 --- Demo:] pantalla real; cursor entra coordenada; blink
  se reproduce.
+ #strong[0:13 --- Diferenciador:] toggle “Difference”, slider “102
  bands”, marcadores de candidatos.
+ #strong[0:20 --- Impacto:] imágenes de asteroides/enanas
  marrones/estrellas variables; texto “Citizen science”.
+ #strong[0:25 --- Créditos:] “Data: NASA/SPHEREx · IRSA/Caltech”.
+ #strong[0:29 --- Cierre:] equipo + URL + QR.

#strong[Regla:] el 70% del video debe ser #strong[demo real], no slides.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. Deck de respaldo (7 slides)
Si el video falla o si el evento pide slides:

+ #strong[Título:] Astral Codes · SkyBlink · Planet X and SPHEREx.
+ #strong[Problema:] mil millones de objetos, 102 bandas, datos que
  cambian cada 6 meses; nadie puede mirarlos a mano.
+ #strong[Solución:] buscador de cambios del cielo: blink + diferencia +
  102 bandas + candidatos.
+ #strong[Demo:] 2--3 capturas/GIF del blink y la diferencia.
+ #strong[Cómo funciona:] SIA2 → cutouts → caché → UI; datos NASA/IRSA;
  URL compartible.
+ #strong[Impacto:] ciencia ciudadana, educación, descubrimiento de
  asteroides/enanas marrones/variables.
+ #strong[Equipo + links + créditos + uso de IA.]

#strong[Regla:] ≤7 slides, texto grande, una idea por slide.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Guion de “cómo trabajamos” (30 s)
Para presentar al equipo (no es el demo oficial; sirve para el kickoff o
para jueces locales):

#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Tiempo], [Audio],),
    table.hline(),
    [#strong[0:00]], [“Somos Astral Codes: cinco personas, dos días, un
    objetivo.”],
    [#strong[0:03]], [“Un solo documento fuente de verdad, tareas en
    GitHub y standups de diez minutos.”],
    [#strong[0:08]], [“Cada feature entra con demo, datos cacheados y
    una decisión registrada.”],
    [#strong[0:14]], [“A las doce horas congelamos alcance: solo
    pulimos, probamos y ensayamos.”],
    [#strong[0:20]], [“Ciencia honesta: etiquetamos candidatos,
    mostramos incertidumbre y citamos cada dato.”],
    [#strong[0:26]], [“Astral Codes: rápido, reproducible y en
    equipo.”],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Cómo hacer un buen pitch (investigación y práctica)
=== 8.1 La estructura que funciona
+ #strong[Hook:] una pregunta, un dato o una imagen que sorprenda.
+ #strong[Problema:] ¿por qué es difícil? ¿a quién le importa?
+ #strong[Solución:] una frase clara, sin jerga.
+ #strong[Prueba:] demo real, números, datos NASA.
+ #strong[Impacto:] ¿qué cambia para el usuario?
+ #strong[Cierre:] una frase memorable + pedido.

=== 8.2 Reglas de oro
- #strong[Una sola idea.] Si el jurado recuerda una cosa, ¿cuál es?
- #strong[Un número.] “Mil millones de objetos” o “102 bandas” pega más
  que “muchos datos”.
- #strong[Mostrar, no contar.] 10 s de demo valen más que 20 s de
  explicación.
- #strong[Cero jerga.] Si decís “SIA2”, explicá en 3 palabras: “el
  buscador de imágenes de NASA”.
- #strong[Empezá por el problema, no por la tecnología.]
- #strong[Terminá con una frase que se repita.]
- #strong[Ensayá 10 veces.] Grabá, mirá, corregí.
- #strong[Cronometrá.] 30 s son \~75 palabras.
- #strong[Audio \> video.] Un buen audio con imagen simple gana a un
  video lindo con audio malo.
- #strong[Subtítulos siempre.] Ayudan a accesibilidad y a jueces no
  nativos.

=== 8.3 Errores comunes
- Decir “somos un equipo de 5 y usamos React” antes de decir qué
  problema resuelven.
- Explicar la arquitectura en el video.
- Mostrar una slide de código.
- Prometer “descubrir planetas” sin evidencia.
- Usar música con copyright.
- Pasarse de 30 s.
- No mostrar el producto.
- Leer el guion mirando el papel.

=== 8.4 Checklist de grabación
- ☐ Guion final aprobado.
- ☐ Storyboard con timestamps.
- ☐ Demo grabada en pantalla (1080p, 30 fps).
- ☐ Audio grabado con micrófono (no el del laptop).
- ☐ Subtítulos en inglés.
- ☐ Música libre o sin música.
- ☐ Créditos NASA/IRSA.
- ☐ Logo del equipo.
- ☐ Duración ≤30 s.
- ☐ Export 16:9, MP4/H.264.
- ☐ Subido a YouTube/Drive con link público.
- ☐ Probado en ventana privada.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 9. Cómo hablar de la ciencia sin exagerar
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([En vez de…], [Decí…],),
    table.hline(),
    [“Descubrimos un planeta.”], [“Marcamos candidatos para que la
    comunidad los revise.”],
    [“Detectamos movimiento.”], [“Medimos un desplazamiento de menos de
    un píxel.”],
    [“Es preciso.”], [“Tiene una incertidumbre de X arcsec.”],
    [“Funciona con cualquier coordenada.”], [“Funciona con 5 targets
    precomputados y modo live experimental.”],
    [“IA”], [“Usamos IA para \[tarea concreta\], declarada en la
    submission.”],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 10. Ensayo y feedback
- #strong[Ensayo 1 (domingo 16:00):] guion + demo, sin cámara.
- #strong[Ensayo 2 (domingo 18:00):] grabación completa.
- #strong[Feedback:] pedir a alguien fuera del equipo que diga qué
  entendió en 30 s.
- #strong[Ajuste:] si no entendió el problema, reescribir el hook.
- #strong[Final:] grabar 3 tomas y elegir la mejor.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 11. Frases de cierre posibles
- “NASA abrió los datos; nosotros abrimos la puerta para mirarlos.”
- “El cielo cambia. Ahora lo podés ver.”
- “Mil millones de objetos. Una herramienta para encontrarlos.”
- “No hace falta ser astrónomo para descubrir algo nuevo.”

Elegir #strong[una] y repetirla en el video, el deck y la submission.