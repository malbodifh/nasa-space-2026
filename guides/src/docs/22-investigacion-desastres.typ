// Generado desde docs/22-investigacion-desastres.md con pandoc. No editar a mano.

#import "theme.typ": *

= 22 --- Investigación: alerta temprana de desastres con datos NASA
#quote(block: true)[
#strong[Fecha:] 14/11/2026. Todo lo marcado como “probado” se consultó
contra el endpoint real ese día. #strong[Esto no es una promesa de
producto.] Es el inventario de datos y límites para decidir la idea. La
verdad del proyecto sigue en
`documentacion.md` y `docs/*.md`.

#strong[Actualización 14/11 22:30 UTC:] los endpoints, cuotas y el
recorte “core NASA” están verificados en
`25-api-research.md`. Este documento queda
como inventario científico; para contratos de datos y fallbacks, usar el
\25.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0. Veredicto en 5 líneas
+ #strong[Sí hay datos NASA públicos] para observar lluvia, incendios,
  deslizamientos, ciclones, sequía y cambios de superficie. La mayoría
  son gratis; algunos piden registro.
+ #strong[NASA observa, no pronostica el tiempo de forma operativa.] Los
  pronósticos oficiales son de NOAA/NHC, GDACS/GloFAS y los servicios
  meteorológicos nacionales.
+ Lo honesto en 48 h es un #strong[tablero personal]: “qué pasa cerca de
  mi ubicación, con qué confianza, según qué fuente y cuándo llega”,
  combinando #strong[un] hazard.
+ “Probabilidad” acá significa #strong[frecuencia histórica / percentil
  \/ periodo de retorno], no un modelo predictivo propio. Eso es
  defendible; inventar probabilidades, no.
+ Ninguno de los 14 retos es “alertas multi-riesgo”. El más cercano es
  #strong[\#2 Trend Detective] (componente estadístico), #strong[\#8 Hot
  Spots] (incendios) o #strong[\#5 SAR] (inundaciones). Hay que
  #strong[encajar la idea en un reto oficial], no crear uno propio.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Observar, pronosticar y “aproximar la probabilidad”
Son tres cosas distintas y el pitch no puede mezclarlas:

#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Capa], [Qué responde], [Quién la da], [Ejemplo],),
    table.hline(),
    [#strong[Observación]], [¿Qué pasó / está pasando?], [Satélites NASA
    (IMERG, FIRMS, SMAP)], [“cayeron 80 mm en 24 h”],
    [#strong[Pronóstico]], [¿Qué va a pasar?], [NOAA/NHC, GloFAS,
    modelos numéricos], [“el ciclón llega en 36 h”],
    [#strong[Probabilidad histórica]], [¿Qué tan raro es?], [Nosotros,
    con climatología], [“es un evento 1-en-20 años”],
  )]
  , kind: table
  )

#strong[Riesgo ≠ probabilidad.] Riesgo = peligro × exposición ×
vulnerabilidad. En 48 h se puede hacer peligro + exposición (ubicación y
radio); la vulnerabilidad fina (material de la casa, rutas de
evacuación) queda fuera.

=== Métodos que sí se pueden defender
+ #strong[Percentiles climatológicos.] Con 40+ años de datos diarios:
  “esta lluvia está sobre el percentil 99 para este mes en este punto”.
  Simple, explicable y validable.
+ #strong[Periodo de retorno.] Frecuencia empírica o ajuste de una
  distribución de valores extremos (GEV/GPD) a máximos anuales. Se
  reporta con intervalo de confianza, no como certeza.
+ #strong[Anomalía vs. climatología.] “Este mes llovió 3× el promedio” o
  “la temperatura está 2 °C sobre lo normal”. Es la base del reto \#2.
+ #strong[Índices compuestos.] Fire Weather Index (FWI) para incendios;
  humedad del suelo + lluvia + pendiente para deslizamientos (LHASA ya
  lo hace).
+ #strong[Probabilidades oficiales.] Para ciclones, usar las
  probabilidades de viento de NHC (34/50/64 kt) en vez de inventar una
  trayectoria.

=== Validación obligatoria
- #strong[Hindcast:] reproducir 2--3 eventos conocidos y medir si el
  sistema los detectó y con cuánta anticipación.
- Reportar #strong[falsos positivos y falsos negativos], no solo los
  aciertos.
- Mostrar siempre #strong[fuente, hora del dato y confianza].

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. Datos NASA verificados
=== 2.1 EONET --- catálogo de eventos naturales
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Campo], [Valor],),
    table.hline(),
    [Qué da], [Eventos abiertos/cerrados: incendios, tormentas,
    inundaciones, deslizamientos, volcanes, sequía, etc.],
    [Acceso], [`https://eonet.gsfc.nasa.gov/api/v3/events`
    (JSON/GeoJSON/RSS), #strong[sin clave]],
    [Latencia], [Curada por NASA; no es sensor en tiempo real],
    [Cobertura], [Global],
    [Probado], [14/11: devolvió eventos abiertos (ej. wildfire en
    Mississippi)],
    [Uso], [Catálogo y contexto; #strong[no] para alertar en segundos],
  )]
  , kind: table
  )

Filtros útiles: `category`, `status=open`, `days`, `bbox`,
`start`/`end`. Categorías: `wildfires`, `severeStorms`, `floods`,
`landslides`, `volcanoes`, `drought`, etc.

=== 2.2 FIRMS --- focos de calor
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Campo], [Valor],),
    table.hline(),
    [Qué da], [Detecciones de fuego activo: MODIS, VIIRS (375 m/750 m),
    Landsat],
    [Acceso], [API con #strong[MAP\_KEY gratis]:
    `https://firms.modaps.eosdis.nasa.gov/api/area/`],
    [Cobertura histórica], [MODIS C6.1 desde #strong[2000-11-01]\; VIIRS
    S-NPP desde #strong[2012-01-20]\; NOAA-20 desde 2018; NOAA-21 desde
    2023],
    [Latencia], [NRT global en horas; #strong[URT \< 60 s] en
    EE.UU./Canadá],
    [Límite], [API: 1--5 días por consulta, 5000 transacciones/10 min;
    el archivo completo se descarga aparte],
    [Uso], [Mapa de focos + serie histórica por celda/radio],
  )]
  , kind: table
  )

#strong[Trampa:] la API no entrega 20 años de una vez. Para el histórico
hay que descargar archivos por año/región (o usar una muestra) y
cachearlos.

=== 2.3 IMERG --- lluvia
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Campo], [Valor],),
    table.hline(),
    [Qué da], [Tasa/acumulado de precipitación cada 30 min, 0.1° (\~10
    km)],
    [Latencia], [#strong[Early 4 h], Late 14 h, Final \~3,5 meses],
    [Cobertura], [Global (la IR llega a 60°N--S; V07 amplía con
    microondas)],
    [Acceso], [PPS/GES DISC con registro; #strong[GIBS] sirve imágenes
    WMTS sin clave],
    [Probado], [14/11: GIBS respondió 200 y tiene capas
    `IMERG_Precipitation_Rate_30min`],
    [Uso], [Lluvia observada, acumulados, nowcast; #strong[no] es
    pronóstico],
  )]
  , kind: table
  )

#strong[Trampa:] 4 h de latencia no alcanzan para un flash flood. Sirve
para acumulados, deslizamientos y para confirmar un evento en curso.

=== 2.4 POWER --- climatología y meteorología diaria
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Campo], [Valor],),
    table.hline(),
    [Qué da], [Temperatura, precipitación, viento, humedad, radiación,
    etc., diario/mensual],
    [Acceso], [REST sin clave:
    `https://power.larc.nasa.gov/api/temporal/daily/point`],
    [Cobertura], [Global; #strong[1981 → presente]],
    [Probado], [14/11: 16.751 días válidos para Santiago (1981--2026),
    en una sola llamada],
    [Uso], [Percentiles, promedios, anomalías, línea base histórica],
  )]
  , kind: table
  )

#strong[Trampa:] es reanálisis (\~0,5°), no un pluviómetro. En la
prueba, la DANA de Valencia 2024 dio 21,9 mm/día cuando la lluvia local
fue mucho mayor. #strong[No sirve para extremos locales]\; para eso,
IMERG o estaciones.

=== 2.5 LHASA --- deslizamientos
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Campo], [Valor],),
    table.hline(),
    [Qué da], [Indicador global de deslizamientos por lluvia
    (susceptibilidad + lluvia + humedad del suelo)],
    [Actualización], [Nowcast cada \~30 min],
    [Acceso], [`https://portal.nccs.nasa.gov/datashare/landslides/nrt/`,
    GES DISC; también integrado en PDC DisasterAWARE],
    [Cobertura], [Global, \~1 km],
    [Uso], [Alerta de deslizamiento en zonas de pendiente],
  )]
  , kind: table
  )

=== 2.6 GFWED --- peligro de incendio
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Campo], [Valor],),
    table.hline(),
    [Qué da], [Fire Weather Index (FWI) global],
    [Acceso], [NetCDF desde
    `https://portal.nccs.nasa.gov/datashare/GlobalFWI/`\; documentación
    en GISS],
    [Uso], [“Qué tan inflamable está el combustible” + viento/humedad],
  )]
  , kind: table
  )

=== 2.7 Otras piezas NASA útiles
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Producto], [Para qué], [Nota],),
    table.hline(),
    [#strong[GIBS/WMTS]], [Mapas e imágenes NRT sin clave], [Probado
    200; sirve para el fondo del mapa],
    [#strong[SMAP]], [Humedad del suelo], [Earthdata; LHASA ya la
    integra],
    [#strong[NASA Disasters Portal]], [Catálogo de productos por
    desastre], [`science.data.nasa.gov/disasters`],
    [#strong[Worldview]], [Explorador visual], [Referencia para el demo,
    no API de alertas],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Datos complementarios (no NASA, pero necesarios)
#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Fuente], [Qué aporta], [Acceso], [Límite],),
    table.hline(),
    [#strong[NOAA NHC]], [Trayectoria, cono, arribo de vientos,
    #strong[probabilidades de viento 34/50/64
    kt]], [Shapefiles/KMZ/GeoJSON, sin clave], [Solo Atlántico y
    Pacífico este/central],
    [#strong[GDACS]], [Alertas globales multi-riesgo (EQ, TC, FL, VO,
    DR, WF), nivel rojo/naranja/verde], [API GeoJSON gratis:
    `gdacs.org/gdacsapi/api/events/geteventlist/SEARCH`], [100 registros
    por consulta; atribución obligatoria],
    [#strong[Copernicus GloFAS]], [Pronóstico de caudales hasta 15--30
    días], [CDS/EWDS con clave gratis], [Más pesado; validar en región],
    [#strong[Google Flood Hub]], [Inundación fluvial 7 días y flash
    flood 24 h], [API con clave y #strong[lista de espera]], [Cobertura
    limitada por país],
    [#strong[USGS]], [Sismos y caudales en EE.UU.], [GeoJSON sin
    clave], [Solo EE.UU. para ríos],
    [#strong[OSM / WorldPop]], [Exposición: casas, caminos,
    población], [Descarga abierta], [Calidad variable],
    [#strong[CAP (OASIS)]], [Formato estándar de
    alertas], [Especificación abierta], [No es una fuente de datos],
  )]
  , kind: table
  )

#strong[Conclusión:] NASA no alcanza sola para “avisar antes”. El
sistema tiene que combinar observación NASA + pronóstico oficial +
exposición.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Qué existe ya (no duplicar)
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Herramienta], [Qué hace], [Gap que deja],),
    table.hline(),
    [#strong[GDACS]], [Alertas globales multi-riesgo con nivel y países
    afectados], [No es personal ni explica “mi casa”],
    [#strong[PDC DisasterAWARE]], [Monitoreo multi-riesgo para gestión
    de desastres; usa LHASA], [Profesional, no ciudadano],
    [#strong[Google Flood Hub]], [Pronóstico de inundación con
    IA], [Solo algunos países; API cerrada],
    [#strong[NHC]], [Pronóstico oficial de ciclones], [No traduce a “mi
    ubicación” ni a histórico],
    [#strong[Watch Duty]], [Alertas de incendios en EE.UU. con
    voluntarios y escáneres], [Solo EE.UU.; no usa NASA como fuente
    principal],
    [#strong[NASA Worldview / EONET]], [Exploración visual y
    catálogo], [No alerta ni prioriza],
    [#strong[Windy / Zoom Earth]], [Clima y satélite para
    consumidor], [No explica probabilidad histórica],
  )]
  , kind: table
  )

#strong[Espacio real:] una vista #strong[personal, en español, con una
sola pregunta]: “¿esto me va a afectar, cuándo y con qué confianza?”.
Con fuente, hora, incertidumbre y enlace a la alerta oficial. No otro
dashboard global.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Tres alcances posibles para 48 h
=== Opción A --- Un hazard, una región (recomendada)
#strong[Incendios] (mejor relación datos/demo):

- Mapa: focos FIRMS de 24--48 h + FWI + viento + lluvia de los últimos 7
  días (POWER).
- Histórico: 20 años de FIRMS en un radio de 25/50 km → “noviembre
  normal: X focos”.
- Tarjeta: riesgo alto/medio/bajo con 3 razones y fuente.
- Hindcast: reproducir un evento conocido y mostrar cuándo se detectó.
- Encaje: #strong[\#8 Hot Spots] (armonización MODIS/VIIRS) es casi
  literal.

#strong[Ciclones] (mejor demo visual):

- Tormentas activas de GDACS/NHC; cono y probabilidades de viento en la
  ubicación.
- “Tu casa: 40 % de vientos ≥ 64 kt en 36 h; arribo estimado 14:00”.
- Histórico: cuántas tormentas pasaron a menos de 100 km en 50 años
  (HURDAT2/NOAA).
- Encaje: #strong[\#2] (análisis) o ninguno; el dato fuerte no es NASA.

#strong[Inundación/deslizamiento] (más difícil):

- IMERG de 7 días + LHASA + climatología POWER + alertas GDACS/GloFAS.
- “Lluvia acumulada 1-en-20 años; deslizamiento probable en la ladera
  X”.
- Encaje: #strong[\#2] o #strong[\#5]\; latencia y validación son el
  riesgo.

=== Opción B --- Multi-riesgo
Un tablero con ciclón + incendio + inundación. #strong[No recomendado
para 48 h:] triplica la plomería, diluye el demo y hace imposible
validar. Si el equipo lo quiere, que sea fase 2.

=== Opción C --- Solo tendencias históricas
Sin alertas: explorador de “cómo cambió el riesgo en 40 años”. Encaja
perfecto en #strong[\#2], pero pierde el ángulo de prevención que
pediste.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. Encaje con los 14 retos oficiales
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Reto], [Encaje], [Veredicto],),
    table.hline(),
    [#strong[\#2 Earth System Trend Detective]], [Tendencias +
    significancia estadística; se le puede sumar
    “ahora”], [#strong[Medio-alto]: el más flexible],
    [#strong[\#8 MODIS + VIIRS Hot Spots]], [20 años de incendios,
    armonización de sensores], [#strong[Alto] si el hazard es fuego],
    [#strong[\#5 Dancing with the SARs]], [Cambio de superficie con
    radar (inundación, deslizamiento)], [#strong[Medio]: pesado para 48
    h],
    [#strong[\#6 Field Shift]], [Riesgo agroclimático], [Bajo: otro
    público],
    [#strong[\#14 Jukebox]], [Sonificación], [Ninguno],
    [Resto], [No relacionado], [Descartar],
  )]
  , kind: table
  )

#strong[Regla del repo:] “Create Your Own Challenge” no es elegible para
Global Judging. Si la idea es multi-riesgo, hay que #strong[encajarla]
en \#2, \#5 u \#8, no presentarla como reto propio.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Riesgos y ética (no negociable)
+ #strong[No reemplazar una alerta oficial.] La app informa y deriva a
  la agencia; no evacúa.
+ #strong[Mostrar incertidumbre y hora del dato.] “Dato de hace 4 h” es
  parte del mensaje.
+ #strong[Falsos positivos.] Un aviso de más también cuesta: explicar la
  confianza y el motivo.
+ #strong[Latencia.] IMERG Early (4 h) no detecta un flash flood; sirve
  para acumulados.
+ #strong[Resolución.] 0,1° no ve una quebrada; no prometer precisión de
  casa.
+ #strong[Privacidad.] La ubicación del usuario no se guarda ni se
  comparte.
+ #strong[Accesibilidad e idioma.] Texto claro, sin alarmismo, legible
  en celular.
+ #strong[Atribución.] NASA, NOAA, GDACS, Copernicus y OSM en la UI y en
  la submission.
+ #strong[Datos inventados.] Sin fuente publicada no hay cifra; se dice
  “según NASA”.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Pruebas hechas hoy (14/11/2026)
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Prueba], [Resultado],),
    table.hline(),
    [EONET abierto], [200; eventos abiertos con geometría y fuente],
    [GDACS multi-riesgo], [200; GeoJSON de ciclón/inundación/incendio],
    [POWER 1981--2026, Santiago], [16.751 días; p99 = 15,5 mm/día;
    máximo 71,8 mm (2002-05-25)],
    [POWER, Valencia 2024-10-29], [21,9 mm/día → #strong[subestima] el
    evento local; no usar para extremos],
    [GIBS WMTS], [200; capas IMERG disponibles],
    [FIRMS], [Documentación y archivo verificados; la API exige MAP\_KEY
    gratis],
    [NHC], [Feed activo y productos GIS; sin tormenta activa el 14/11],
  )]
  , kind: table
  )

#strong[Conclusión técnica:] el pipeline es viable con datos abiertos,
pero la calidad depende del hazard. Incendios y ciclones son los más
demostrables en 48 h; inundación local es el más frágil.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 9. Próximos pasos
+ #strong[Elegir un hazard y una región] (decisión del equipo, no del
  agente).
+ Prototipo de datos: FIRMS (fuego) o NHC/GDACS (ciclón) + POWER para la
  línea base.
+ Hindcast de 2--3 eventos; medir detección y falsos positivos.
+ Decidir el reto oficial (\#2, \#5 u \#8) y escribir el documento de
  producto.
+ Recién después: UI, deploy, video y submission.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 10. Fuentes
- EONET v3: #link("https://eonet.gsfc.nasa.gov/docs/v3")
- FIRMS API: #link("https://firms.modaps.eosdis.nasa.gov/api/area/")
- FIRMS descarga histórica:
  #link("https://firms.modaps.eosdis.nasa.gov/download/")
- IMERG: #link("https://gpm.nasa.gov/data/imerg")
- POWER API: #link("https://power.larc.nasa.gov/docs/services/api/")
- LHASA: #link("https://gpm.nasa.gov/landslides/") ·
  #link("https://github.com/nasa/lhasa")
- GFWED: #link("https://data.giss.nasa.gov/impacts/gfwed/")
- GIBS: #link("https://nasa-gibs.github.io/gibs-api-docs/")
- NASA Disasters: #link("https://science.data.nasa.gov/disasters/")
- NHC GIS: #link("https://www.nhc.noaa.gov/gis/")
- NHC probabilidades de viento:
  #link("https://www.nhc.noaa.gov/aboutnhcprobs3.shtml")
- GDACS API: #link("https://www.gdacs.org/gdacsapi/swagger/index.html")
- GloFAS: #link("https://global-flood.emergency.copernicus.eu/")
- Google Flood Hub API:
  #link("https://developers.google.com/flood-forecasting")
- CAP (OASIS):
  #link("https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html")
- PDC DisasterAWARE + LHASA:
  #link("https://pdc.org/nasa-pdc-new-landslide-alerting")