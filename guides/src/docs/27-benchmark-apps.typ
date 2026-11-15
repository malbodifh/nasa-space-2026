// Generado desde docs/27-benchmark-apps.md con pandoc. No editar a mano.

#import "theme.typ": *

= 27 --- Benchmark de apps de alerta y datos NASA
#quote(block: true)[
#strong[Fecha de investigación:] 14/11/2026. #strong[Objetivo:] entender
qué hacen las apps que ya usan datos NASA/NOAA/USGS, dónde fallan y qué
hueco real queda para el proyecto. #strong[No es una decisión de hazard
ni de región.] La recomendación técnica sigue siendo incendio, pero la
decisión está abierta.

Documentos relacionados:
`25-api-research.md` (APIs verificadas),
`23-plan-app.md` (producto),
`24-arquitectura-app.md` (arquitectura)
y
`22-investigacion-desastres.md`
(ciencia).
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0. Resumen ejecutivo
+ #strong[Watch Duty es el mejor benchmark de producto], no de
  tecnología: demuestra que la gente quiere #strong[claridad
  verificada], no otro mapa. Pero es EE. UU., notifica por condado,
  depende de un newsroom humano y sus alertas críticas son solo iOS.
+ #strong[FIRMS/Worldview tienen el dato, pero no la traducción.]
  Muestran puntos rojos; no dicen “está a 3 km, es confiable, el viento
  va hacia vos y esto deberías hacer”.
+ #strong[Zoom Earth es el ejemplo del error que hay que evitar:] heat
  spots diarios, con horas de retraso, falsos positivos y un aviso
  propio de “no usar para preservar vida o propiedad”.
+ #strong[Google Flood Hub ya cubre Costa Rica] y da pronósticos a 7
  días. Si el hazard es inundación, competimos con Google; si es
  incendio, el campo está más libre.
+ #strong[OVSICORI y UNA Costa Segura] demuestran que las apps locales
  fallan en latencia, notificaciones y mantenimiento, no en cantidad de
  datos.
+ #strong[El hueco:] una app personal, en español, que responda en 5
  segundos #strong[“¿qué peligro hay cerca, qué tan confiable es, cuándo
  llegaría y qué hago?”].
+ #strong[La innovación no es una capa nueva de satélite:] es
  #strong[radio personal + confianza explicada + memoria histórica +
  acción + transparencia de latencia].

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Metodología
Revisé sitios oficiales, centros de ayuda, blogs y fichas de Google
Play. No inventé funciones: lo que afirmo sale de documentación pública
de cada app. Cuando una app no expone su API interna, lo digo.

#strong[Qué miré en cada una:]

- #strong[Utilidad:] qué problema resuelve y para quién.
- #strong[Habilidades:] qué hace mejor que el resto (notificaciones,
  mapa, verificación, etc.).
- #strong[Datos/APIs:] qué fuentes usa o declara.
- #strong[Límites y errores:] cobertura, latencia, precisión,
  notificaciones, idioma, dependencias.
- #strong[Hueco:] qué podría hacer nuestro proyecto distinto.

#strong[Fecha de los datos:] 14/11/2026. Los estados de cobertura y
funciones pueden cambiar.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. Matriz competitiva
#figure(
  align(center)[#table(
    columns: (1.0fr, 1.8fr, 1.6fr, 1.8fr, 1.8fr, 1.8fr),
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,auto,),
    table.header([App], [Qué hace], [Datos/APIs], [Habilidad], [Límite o
      error], [Hueco para nosotros],),
    table.hline(),
    [#strong[Watch Duty]], [Alertas de incendios e inundaciones en EE.
    UU., mapa, evacuaciones y reportes], [NASA FIRMS URT, NGFS/NOAA,
    Landsat, GOES, radios, fuentes oficiales], [Verificación humana
    24/7; “el satélite encuentra el calor, el reportero confirma qué
    es”], [Solo EE. UU.; notifica por #strong[condado], no por radio;
    free = 4 condados; Critical Alerts solo iOS; no SMS/email/web push;
    depende de voluntarios], [#strong[Radio personal] (1/5/10/25 km),
    multi-plataforma, español, sin newsroom, con confianza explícita],
    [#strong[NASA FIRMS Fire Map]], [Mapa global de focos, capas,
    timeline, alertas por email y archivo], [FIRMS, GIBS,
    Worldview], [Dato operativo global; email alerts por área; archivo
    histórico], [Herramienta profesional: puntos rojos sin traducción;
    API 1--5 días; falsos positivos; no dice “qué hago”], [Traducir el
    punto rojo a #strong[“qué tan cerca, qué tan confiable, qué hago”]],
    [#strong[Zoom Earth]], [Mapa meteorológico: satélite, radar,
    pronóstico, huracanes, focos de calor], [GOES, GIBS, NHC, GDACS,
    FIRMS], [Visualización rápida y global; mezcla clima +
    incendios], [Heat spots #strong[diarios, con horas de retraso],
    falsos positivos, nubes tapan focos; su propio aviso: “no usar para
    preservar vida o propiedad”], [Confianza + hora + incertidumbre +
    acción; no solo capa visual],
    [#strong[Global Forest Watch]], [Alertas de incendios por área,
    tendencias y mapas], [FIRMS/GLAD, datasets forestales], [“Guardar
    área” + email cuando hay alerta; tendencia vs promedio], [Enfoque
    forestal/global; no es alerta personal ni de proximidad; no hay
    viento/ETA], [#strong[“¿Es normal?”] con POWER + GIBS, y radio
    personal],
    [#strong[MyShake]], [Alerta temprana de sismos y reportes
    ciudadanos], [ShakeAlert/USGS, sensores del teléfono], [EEW real;
    alerta crítica que atraviesa No Molestar; 6 idiomas; Homebase], [EEW
    solo CA/OR/WA; no configurás radio/magnitud; una sola Homebase; no
    multi-riesgo], [#strong[Multi-riesgo] y radio configurable; no
    competir con EEW],
    [#strong[Google Flood Hub]], [Pronóstico de inundaciones a 7 días,
    estado, gauges y cobertura], [Modelos Google, gauges, API de flood
    forecasting], [Cobertura global (incluye #strong[Costa Rica]), 7
    días, gauges verificados/baja confianza, API gratuita], [API solo
    por #strong[waitlist] (meses); web “aproximada, informativa”; no es
    alerta oficial; no cubre incendios], [Si el hazard es inundación,
    #strong[ya hay un gigante]\; para incendio no],
    [#strong[FEMA]], [Alertas NWS, refugios, preparación y
    recuperación], [NWS, IPAWS, datos FEMA], [Hasta 5 ubicaciones;
    accesibilidad; lenguaje simple; refugios], [Solo EE. UU.; no cubre
    incendios satelitales; no es global], [#strong[Accesibilidad +
    lenguaje simple + acción], pero global],
    [#strong[GDACS]], [Alertas multi-riesgo globales (sismos, ciclones,
    inundaciones, volcanes, sequías, incendios)], [USGS, NOAA, JRC,
    Copernicus, UN], [Cobertura global; RSS/KML/CAP; mapas y satélite;
    Virtual OSOCC], [No es personal; alerta por evento/país, no por “mi
    casa”; no traduce a acción local], [#strong[Capa personal] sobre
    GDACS: distancia, radio, confianza, acción],
    [#strong[OVSICORI-UNA]], [Alerta de sismos sentidos en Costa
    Rica], [Red sísmica OVSICORI], [Alerta roja/naranja/verde;
    voz/vibración/sonido; reporte ciudadano; 50--150 km], [3,3★ en Play
    Store; reseñas reportan alertas #strong[5--10 min tarde], réplicas
    sin aviso y sonido que no suena en silencio], [#strong[Latencia
    honesta], alertas críticas multiplataforma, réplicas y “por qué
    llegó tarde”],
    [#strong[UNA Costa Segura]], [Reportes de tsunami de SINAMOT,
    historial y ruta a punto seguro], [SINAMOT,
    IOC/UHSLC], [Notificación de tsunamis; ruta de evacuación;
    compartir], [35 reseñas; usuarios reportan #strong[crash al abrir la
    notificación]\; una sola amenaza], [#strong[Confiabilidad de deep
    links] + multi-riesgo + offline],
  )]
  , kind: table
  )

#strong[Otras referencias:] NASA Worldview/Earthdata (potentes, pero
para expertos), PDC DisasterAWARE (gobierno/empresa), ReliefWeb
(información humanitaria), Ushahidi (reportes ciudadanos), HOT (mapeo
OSM). No son competidores directos, pero sirven para exposición y
contexto.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Fichas por app
=== 3.1 Watch Duty
#strong[Utilidad:] decirle a una persona si un incendio o una inundación
amenaza su vida o su propiedad, con información verificada y
actualizada.

#strong[Habilidades:]

- Mapa en vivo con incendios, inundaciones, quemas prescritas y niveles
  de río.
- Alertas por #strong[condado]\; free = 4 condados, miembros =
  ilimitados.
- #strong[Critical Alerts] en iOS: atraviesan modo silencio, Focus y No
  Molestar.
- Seguimiento de un incendio específico; silenciar un incidente.
- Evacuaciones, refugios, información de aeronaves, viento/lluvia y
  capas satelitales.
- #strong[Verificación humana:] staff y voluntarios (dispatchers, first
  responders, reporters) escuchan radios, cámaras e información oficial.
- Usa #strong[NASA FIRMS URT] (VIIRS/MODIS), #strong[NGFS/NOAA] (imagen
  cada 5 min en EE. UU.), #strong[Landsat] y satélites; el equipo pone
  en contexto los falsos positivos.

#strong[Límites/errores:]

- Solo EE. UU. (según su centro de ayuda, 50 estados desde 2025).
- Notifica por #strong[condado], no por radio; no se puede excluir una
  ciudad.
- No envía notificaciones por SMS, email ni web push.
- Critical Alerts solo iOS, opt-in y con umbral alto; no para cada
  emergencia.
- No todos los incendios/actualizaciones generan notificación: hay
  “silent incidents”.
- Depende de un newsroom humano; no es replicable en 48 h.

#strong[Qué copiar:] la frase “el satélite encuentra el calor; el
reportero confirma qué es”; la separación entre observación y
confirmación; la alerta crítica con prueba; la gestión de lugares; la
transparencia sobre qué no notifica.

#strong[Qué no copiar:] el modelo por condado, el newsroom, la cobertura
EE. UU., el muro de miembros.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.2 NASA FIRMS Fire Map
#strong[Utilidad:] explorar focos de calor globales y descargar datos
para análisis.

#strong[Habilidades:]

- Mapa global y US/Canada; capas MODIS/VIIRS, color verdadero,
  aerosoles, etc.
- Timeline, medición, captura, share, modo de vista.
- #strong[Fire Alerts] por email: mundo, país, área protegida o región
  custom; near real-time, diario o semanal; CSV/KML opcional.
- Descarga de archivo histórico y servicios web.
- Datos: MODIS 1 km, VIIRS 375 m; NRT global \<3 h; RT \<30 min y URT
  \<5 min en EE. UU./Canadá.

#strong[Límites/errores:]

- No es una app de alerta personal; es una herramienta de expertos.
- API solo 1--5 días; el histórico masivo pide Earthdata o GIBS.
- Cada hotspot es el #strong[centro de un píxel], no la ubicación exacta
  del fuego.
- Falsos positivos: gas flares, calor industrial, sun glint, humo
  sobrecalentado, maniobras de calibración.
- “Sin detección” no significa “sin fuego”: nubes, humo, dosel, fuegos
  pequeños o entre sobrevuelos.
- #strong[Suomi NPP dejó de entregar datos el 2/11/2026]\; hay que
  migrar a NOAA-20/21.

#strong[Qué copiar:] la capa global, el email de área de interés, la
transparencia de latencia y la documentación de falsos positivos.

#strong[Qué no copiar:] el punto rojo sin contexto, la jerga, la
interfaz de experto.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.3 Zoom Earth
#strong[Utilidad:] ver el clima y los incendios en un mapa visual, sin
instalar nada.

#strong[Habilidades:]

- Satélite en vivo (GOES, Meteosat, Himawari), radar, pronóstico
  (ICON/GFS).
- Trayectorias de ciclones (NHC/JTWC/IBTrACS).
- Capa de heat spots (FIRMS), capa de incendios oficiales (NIFC, CIFFC,
  CEMS, GDACS).
- Timeline, medición, capas, idiomas, app móvil.

#strong[Límites/errores:]

- Heat spots #strong[no son en vivo]: se actualizan a diario y con horas
  de retraso.
- Pueden ser fuego, humo caliente o agricultura; las nubes tapan
  detecciones.
- Su propio aviso: #strong[“Do not use for the preservation of life or
  property”].
- No da distancia a tu casa, confianza, acción ni alerta personal.

#strong[Qué copiar:] la velocidad de carga, el timeline, la mezcla de
capas, el lenguaje visual.

#strong[Qué no copiar:] presentar una capa de calor como alerta.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.4 Global Forest Watch
#strong[Utilidad:] monitorear bosques y alertas de
deforestación/incendios por área.

#strong[Habilidades:]

- Guardar un área y recibir #strong[email] cuando hay nuevas alertas.
- Explorar tendencias de alertas de fuego: ¿estamos por encima o por
  debajo del promedio?
- Mapas y dashboards; enfoque en bosques tropicales.

#strong[Límites/errores:]

- No es una app personal de proximidad; el área es
  administrativa/geográfica.
- Enfoque forestal, no de protección de viviendas.
- No hay viento, dirección, ETA ni acción.

#strong[Qué copiar:] “guardar área” + email; #strong[tendencia vs
promedio]\; el foco en “¿es normal?”.

#strong[Qué no copiar:] el modelo de área sin radio; la interfaz de
dashboard.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.5 MyShake
#strong[Utilidad:] alerta temprana de sismos y red ciudadana.

#strong[Habilidades:]

- EEW de ShakeAlert en CA, OR y WA; pocos segundos de aviso.
- #strong[Critical Alerts] en iOS que atraviesan Focus/No Molestar.
- Homebase; hasta 3 notificaciones personalizadas; reporte de
  experiencia.
- El teléfono como sensor (Android); 6 idiomas, incluido español.
- La Homebase no se transmite al servidor.

#strong[Límites/errores:]

- EEW solo en tres estados de EE. UU.; no es global.
- No se puede configurar radio ni magnitud mínima para EEW.
- Una sola Homebase (múltiples “en el próximo release”).
- No multi-riesgo.

#strong[Qué copiar:] la alerta crítica con prueba; el lenguaje
“agachate, cubrite, esperá”; la privacidad de la ubicación; los idiomas.

#strong[Qué no copiar:] depender de una red sísmica densa; prometer EEW
global.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.6 Google Flood Hub
#strong[Utilidad:] pronóstico de inundaciones fluviales y repentinas
para personas y agencias.

#strong[Habilidades:]

- Pronóstico a #strong[7 días]\; estado de inundación; gauges reales y
  virtuales.
- Capa de cobertura; gauges de menor confianza; eventos significativos;
  historial.
- Email subscriptions; #strong[Flood Forecasting API] gratuita (CC BY
  4.0).
- Cobertura de #strong[150+ ubicaciones], incluida #strong[Costa Rica].

#strong[Límites/errores:]

- La API está limitada a #strong[pilot participants]\; la lista de
  espera puede tardar meses.
- La web dice que las condiciones son #strong[aproximadas e
  informativas]\; no es alerta oficial.
- No cubre incendios ni otros hazards.
- No es una app de acción local (evacuación, refugio).

#strong[Qué copiar:] la transparencia de cobertura y confianza; el
historial; la suscripción por email; la API gratuita (si se pudiera
acceder).

#strong[Qué no copiar:] competir de frente en inundación para Costa
Rica.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.7 FEMA
#strong[Utilidad:] preparación, alertas y recuperación para residentes
de EE. UU.

#strong[Habilidades:]

- Alertas meteorológicas y de emergencia de NWS para hasta #strong[5
  ubicaciones].
- Refugios, centros de recuperación, asistencia, preparación.
- Accesibilidad: lectores de pantalla, lenguaje simple, texto
  alternativo.
- Mensajes de texto (SHELTER, DRC, PREPARE) y app en inglés/español.

#strong[Límites/errores:]

- Solo EE. UU. (el SMS solo continental + Puerto Rico/Guam).
- No usa datos satelitales de incendios.
- No es una app global ni multi-riesgo con NASA.

#strong[Qué copiar:] accesibilidad, lenguaje simple, hasta 5 lugares,
refugios, prueba de alertas.

#strong[Qué no copiar:] el alcance geográfico y la dependencia de NWS.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.8 GDACS
#strong[Utilidad:] alertas globales multi-riesgo para coordinación
humanitaria.

#strong[Habilidades:]

- Sismos, ciclones, inundaciones, volcanes, sequías, incendios.
- Niveles de alerta (verde/naranja/rojo), mapas, imágenes satelitales.
- RSS, KML, CAP; Virtual OSOCC; enlaces a Copernicus EMS.
- Cobertura global y curada.

#strong[Límites/errores:]

- No es personal: alerta por evento/país, no por “mi casa”.
- No traduce a acción local ni a refugio.
- Algunas funciones pueden estar en mantenimiento.
- No es una app de consumo; es una plataforma de coordinación.

#strong[Qué copiar:] el catálogo multi-riesgo, los niveles de alerta,
los feeds CAP/RSS.

#strong[Qué no copiar:] la interfaz de agencia; la falta de proximidad.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.9 OVSICORI-UNA (app)
#strong[Utilidad:] alertar a la población de Costa Rica sobre sismos que
pueden sentirse.

#strong[Habilidades:]

- Alerta #strong[roja/naranja/verde] según intensidad; voz, vibración,
  sonido o silencio.
- Ventana útil de #strong[50--150 km]\; más cerca no hay tiempo, más
  lejos no hay daño.
- Reporte de experiencia; mapa y catálogo de sismos; filtros 24 h/30
  días; magnitud y profundidad; actualización.
- Gratuita; servicio de la Universidad Nacional.

#strong[Límites/errores (reseñas y descripción):]

- #strong[3,3★] y \~1,4 mil reseñas.
- Usuarios reportan alertas #strong[5--10 min después] del sismo,
  réplicas sin aviso y sonido que no suena en modo silencio.
- “Magnitudes pueden cambiar después de la revisión”; no es una alerta
  perfecta.
- Una sola amenaza (sismos).

#strong[Qué copiar:] el semáforo rojo/naranja/verde; la voz; el reporte
ciudadano; el lenguaje “agacharse, protegerse, esperar”.

#strong[Qué no copiar:] la latencia sin explicación; la falta de alerta
crítica confiable; la ausencia de réplicas.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 3.10 UNA Costa Segura
#strong[Utilidad:] notificar reportes de amenaza de tsunami de SINAMOT y
guiar a un punto seguro.

#strong[Habilidades:]

- Notificación cuando SINAMOT genera un reporte de amenaza de tsunami.
- Detalle e historial de reportes; compartir en redes/correo.
- Ruta a punto seguro dentro de la zona de inundación; planificación
  familiar/empresarial.
- Recomienda #strong[3 medios redundantes] de información.

#strong[Límites/errores:]

- 35 reseñas; usuarios reportan #strong[crash al abrir la notificación]
  y no poder entrar al historial.
- Una sola amenaza (tsunami).
- Depende de que SINAMOT genere el reporte.

#strong[Qué copiar:] la ruta a punto seguro; el historial; el compartir;
la recomendación de medios redundantes.

#strong[Qué no copiar:] un deep link frágil; una sola fuente; una sola
amenaza.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Patrones de fallo (y cómo los resolvemos)
=== 4.1 Notifican por política, no por distancia
#strong[Evidencia:] Watch Duty notifica por #strong[condado], no por
radio; no se puede excluir una ciudad. Free = 4 condados. MyShake usa
#strong[Homebase] y no permite configurar radio/magnitud para EEW. FEMA
permite 5 ubicaciones.

#strong[Problema:] recibís alertas de un incendio a 80 km y no de uno a
3 km en el condado vecino.

#strong[Nuestra solución:]

- #strong[Radio personal:] 1, 5, 10, 25 km; el usuario elige.
- #strong[Múltiples lugares:] casa, trabajo, escuela, familia.
- #strong[“Solo si está a X km y la confianza es \> Y”.]
- #strong[URL state] (`?lat=&lon=&r=`) para compartir y no guardar
  cuenta.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.2 Prometen “tiempo real” cuando el dato llega horas después
#strong[Evidencia:] Zoom Earth dice que los heat spots son
#strong[diarios y con horas de retraso]. FIRMS global NRT llega en
#strong[\<3 h]\; RT \<30 min y URT \<5 min #strong[solo EE. UU./Canadá].
La app de OVSICORI recibe reseñas de alertas #strong[5--10 min tarde].

#strong[Problema:] el usuario cree que el punto es “ahora”. Si el
satélite pasó hace 4 h, la decisión cambia.

#strong[Nuestra solución:]

- #strong[“Dato de hace 2 h 15 min”] visible, no escondido.
- #strong[Último sobrevuelo / próximo sobrevuelo].
- #strong[Estado de frescura:] fresco / aceptable / viejo / sin dato.
- #strong[Nunca decir “en tiempo real”] si es NRT global.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.3 El punto rojo parece una casa, pero es un píxel
#strong[Evidencia:] FIRMS lo dice: cada hotspot es el #strong[centro de
un píxel] de \~1 km (MODIS) o \~375 m (VIIRS); puede haber uno o varios
fuegos; no se puede saber el tamaño exacto.

#strong[Problema:] la app muestra un pin preciso y la persona cree que
el fuego está exactamente ahí. Es #strong[falsa precisión].

#strong[Nuestra solución:]

- #strong[Círculo de incertidumbre] de 375 m/1 km, no un pin.
- #strong[“Detección en un píxel, no una casa”] en el detalle.
- #strong[Agrupar detecciones] en un evento (clustering) y mostrar un
  área.
- #strong[No calcular distancia a la casa] con precisión de metros; usar
  “a \~3 km”.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.4 Falsos positivos sin contexto
#strong[Evidencia:] Watch Duty advierte que #strong[gas flares, calor
industrial y sun glint] producen falsos positivos. FIRMS documenta
artefactos por #strong[humo sobrecalentado], #strong[maniobras de
calibración] (patrones lineales) y confianza baja por sun glint. Zoom
Earth dice que un punto puede ser “humo caliente o agricultura”.

#strong[Problema:] alertar por cada detección genera pánico y
desconfianza. Watch Duty lo resuelve con humanos; nosotros no tenemos
newsroom.

#strong[Nuestra solución (sin humanos 24/7):]

+ #strong[Confianza:] MODIS 0--100; VIIRS low/nominal/high; descartar
  low por defecto.
+ #strong[FRP] (Fire Radiative Power): un flare industrial suele tener
  FRP bajo/constante; un incendio forestal, alto y variable.
+ #strong[Persistencia:] exigir detección en #strong[2+ sobrevuelos] o
  en #strong[2+ sensores] (MODIS + VIIRS NOAA-20/21).
+ #strong[Contexto de suelo:] land cover (GIBS), OSM
  `landuse=industrial`, proximidad a carreteras/pozos; etiquetar
  “posible fuente industrial”.
+ #strong[Cruce GOES:] ABI FireTemp cada 10--30 min en América; si GOES
  no ve nada y FIRMS sí, bajar confianza.
+ #strong[Patrón lineal:] descartar clusters alineados típicos de
  calibración.
+ #strong[Noche/día + sun glint:] usar el flag `daynight` y la
  geometría.
+ #strong[Nunca decir “incendio confirmado”]: “detección satelital”,
  “posible incendio”, “no confirmado”.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.5 “No hay detección” se interpreta como “no hay peligro”
#strong[Evidencia:] FIRMS explica que un fuego puede no detectarse por
nubes, humo, dosel, tamaño, temperatura, o porque empezó y terminó entre
sobrevuelos. Zoom Earth: las nubes impiden la detección.

#strong[Problema:] el usuario ve el mapa vacío y cree que está a salvo.

#strong[Nuestra solución:]

- #strong[“Sin detecciones no significa sin fuego”] visible.
- #strong[Cobertura de nubes] y #strong[próximo sobrevuelo].
- #strong[Estado “sin dato”] en vez de “sin riesgo”.
- #strong[Combinar con fuentes oficiales] (CNE, bomberos, noticias) para
  el contexto.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.6 Notificaciones frágiles
#strong[Evidencia:] Watch Duty: notificaciones solo push en iOS/Android;
#strong[no SMS, email ni web push]. Critical Alerts #strong[solo iOS],
opt-in, y no para cada emergencia. OVSICORI: reseñas de sonido que no
suena en silencio y alertas tarde. UNA Costa Segura: crash al abrir la
notificación.

#strong[Problema:] la notificación es el momento de verdad; si falla, la
app no sirve.

#strong[Nuestra solución:]

- #strong[Web Push + PWA] (Android/desktop) y #strong[link
  compartible]\; en iOS, mostrar limitación.
- #strong[Plan B:] botón “compartir por WhatsApp/SMS” con texto
  prearmado; no requiere backend.
- #strong[Prueba de notificación] desde ajustes, como Watch
  Duty/MyShake.
- #strong[Deep link robusto:] la notificación abre una tarjeta cacheada;
  si falla la red, muestra el último dato.
- #strong[Niveles:] silencio / informativo / importante / crítico; el
  crítico solo si se cumple la regla.
- #strong[No prometer] “atraviesa el modo silencio” en Android si no se
  puede.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.7 Una app por amenaza
#strong[Evidencia:] el mercado de sismos en Costa Rica está saturado:
OVSICORI, Sismo Detector, Mis Alertas de Terremotos, Terremotos Cerca de
Mí, ¡Sismo Listo!, ShakeNet, etc. Para tsunami, UNA Costa Segura. Para
inundación, Google Flood Hub. Para incendios, Watch Duty/FIRMS.

#strong[Problema:] el usuario necesita 5 apps y 5 registros.

#strong[Nuestra solución:] #strong[un hazard por MVP] (incendio), pero
una #strong[arquitectura `HazardAdapter`] para sumar los demás sin
rehacer la UI. No lanzar “multi-riesgo” en 48 h; lanzar “incendio bien
hecho” y mostrar el camino.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.8 Datos sin acción
#strong[Evidencia:] FIRMS/Worldview muestran capas, no “qué hacer”.
Watch Duty da evacuaciones y refugios; FEMA da refugios y preparación;
MyShake dice “agachate, cubrite, esperá”.

#strong[Problema:] el usuario ve el peligro y no sabe el siguiente paso.

#strong[Nuestra solución:] cada tarjeta tiene #strong[3 acciones
concretas] + #strong[link oficial] + #strong[punto de encuentro/refugio]
si existe. No dar consejo médico ni táctico; sí “alejate del humo”,
“cerrá ventanas”, “llamá al 911/CNE”, “seguí la alerta oficial”.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.9 El histórico y la “normalidad” faltan
#strong[Evidencia:] Global Forest Watch muestra tendencias vs promedio;
POWER/GIBS permiten 20+ años. La mayoría de las apps de alerta muestran
solo el ahora.

#strong[Problema:] “¿esto es normal para mi zona?” es la pregunta que
convierte un punto en una decisión.

#strong[Nuestra solución:]

- #strong[“Memoria del lugar”:] conteo de focos por mes/año en un radio,
  con GIBS 2000+.
- #strong[Percentil POWER] de lluvia/temperatura/viento.
- #strong[“Este año vs los últimos 20”].
- #strong[Antes/después] con Worldview Snapshots.

#line(length: 100%, stroke: 0.6pt + lineColor)

=== 4.10 Dependencias que se caen o se retiran
#strong[Evidencia:] #strong[Suomi NPP dejó de entregar datos el
2/11/2026]\; FIRMS pide migrar a NOAA-20/21. #strong[EO Browser fue
deprecado] y ahora es Copernicus Browser. La app de RSN enlazada desde
su sitio devolvía #strong[404] el 14/11. La API de Google Flood Hub está
en #strong[waitlist].

#strong[Problema:] si el demo depende de una fuente retirada, no hay
demo.

#strong[Nuestra solución:]

- #strong[No usar `VIIRS_SNPP_NRT`] como fuente principal; usar
  NOAA-20/21.
- #strong[Cachear y precomputar]\; el demo corre offline.
- #strong[Tener fallback] por fuente (FIRMS → GIBS; POWER →
  climatología; Worldview → sin imagen).
- #strong[Monitorear deprecaciones] en `docs/25`.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Habilidades que conviene copiar
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Patrón], [Quién lo hace bien], [Cómo lo adaptamos],),
    table.hline(),
    [#strong[Verificación humana]], [Watch Duty], [No tendremos
    newsroom; usamos #strong[confianza + persistencia + contexto] y
    decimos “no confirmado”],
    [#strong[Alerta crítica que atraviesa silencio]], [MyShake (iOS),
    Watch Duty (iOS)], [Implementar en PWA donde se pueda; #strong[no
    prometer] en Android; ofrecer SMS/WhatsApp manual],
    [#strong[Radio/área de interés]], [GFW (guardar área), FIRMS email
    alerts], [#strong[Punto + radio] y #strong[varios lugares], no
    condado],
    [#strong[Tendencias vs promedio]], [Global Forest
    Watch], [#strong[“¿Es normal?”] con POWER + GIBS],
    [#strong[Antes/después]], [Worldview Snapshots], [Tarjeta visual
    “así estaba / así está”],
    [#strong[Accesibilidad y lenguaje simple]], [FEMA], [Texto llano,
    lector de pantalla, contraste, español],
    [#strong[Prueba de notificación]], [Watch Duty, MyShake], [Botón
    “probar alerta” en ajustes],
    [#strong[Explicar la incertidumbre]], [FIRMS FAQ, Zoom
    Earth], [“Píxel, no casa”; “sin detección ≠ sin fuego”],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. El hueco: qué app no existe
#strong[No existe una app personal, en español, que responda en 5
segundos:]

#quote(block: true)[
#strong[“¿Qué peligro hay cerca de mí, qué tan confiable es, cuándo
llegaría y qué hago?”]
]

Las piezas están separadas:

- #strong[Watch Duty] lo hace, pero solo EE. UU., por condado, con
  newsroom y en inglés.
- #strong[FIRMS/Worldview] tienen el dato, pero son herramientas de
  expertos.
- #strong[Zoom Earth] muestra el dato, pero avisa que no sirve para
  salvar vidas.
- #strong[Google Flood Hub] cubre inundación en Costa Rica, pero no
  incendios y su API está en waitlist.
- #strong[OVSICORI/UNA] cubren sismo/tsunami local, pero con problemas
  de latencia/notificación y una sola amenaza.
- #strong[GDACS] es global, pero no personal.

#strong[Posicionamiento recomendado (si el hazard es incendio):]

#quote(block: true)[
#strong[“El traductor personal de los satélites de NASA: no te mostramos
un punto rojo; te decimos si está cerca, qué tan confiable es, hacia
dónde va el viento y qué hacer.”]
]

O, más corto:

#quote(block: true)[
#strong[“Watch Duty sin newsroom, para tu radio y en español.”]
]

No copiar el nombre ni la estética; copiar la #strong[claridad] y la
#strong[verificación], y resolver lo que ellos no pueden: #strong[radio
personal, multi-idioma, multi-fuente y transparencia de latencia].

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Backlog de innovación para el MVP
=== P0 --- Sin esto no hay producto
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Feature], [Por qué], [Cómo],),
    table.hline(),
    [#strong[Punto + radio]], [Resuelve el fallo de
    “condado”], [Geolocalización + búsqueda + slider 1/5/10/25 km; URL
    state],
    [#strong[Tarjeta “qué, dónde, cuándo, confianza”]], [Es la pregunta
    del usuario], [Distancia, dirección, último sobrevuelo, confianza,
    fuente, hora],
    [#strong[Círculo de incertidumbre]], [Evita falsa precisión], [375
    m/1 km según sensor; no un pin],
    [#strong[Confianza explicada]], [Evita falsos
    positivos], [`confidence` + FRP + persistencia + contexto; “posible
    fuente industrial”],
    [#strong[“Sin detección ≠ sin fuego”]], [Evita falsa calma], [Estado
    “sin dato” + nubes + próximo sobrevuelo],
    [#strong[Acción + link oficial]], [Convierte dato en decisión], [3
    acciones + CNE/bomberos; disclaimer],
    [#strong[Offline / fallback]], [El demo no puede depender de
    red], [Cache + JSON estático + `fallback: true`],
  )]
  , kind: table
  )

=== P1 --- Diferenciación
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Feature], [Por qué],),
    table.hline(),
    [#strong[“Memoria del lugar”]], [GIBS 20 años + POWER percentiles:
    “¿es normal?”],
    [#strong[Antes/después]], [Worldview Snapshots: evidencia visual],
    [#strong[Viento y dirección]], [Open-Meteo/POWER: “el humo va
    hacia…”],
    [#strong[FWI / clima de fuego]], [GFWED: contexto, no solo
    detección],
    [#strong[Niveles de notificación]], [Evitar fatiga:
    silencio/info/importante/crítico],
    [#strong[Prueba de alerta]], [Confianza en la app],
    [#strong[Modo docente/periodista]], [Explica cómo leer un hotspot;
    impacto educativo],
  )]
  , kind: table
  )

=== P2 --- Stretch
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Feature], [Por qué],),
    table.hline(),
    [#strong[Debrief con IA]], [Explicar en lenguaje simple con citas;
    precomputado, no runtime],
    [#strong[Multi-riesgo]], [`HazardAdapter` para
    sismo/inundación/tsunami],
    [#strong[Reportes ciudadanos]], [Ground truth, pero requiere
    moderación; no en 48 h],
    [#strong[SMS/WhatsApp]], [Fallback cuando no hay push; link
    prearmado],
    [#strong[API pública]], [Para docentes/periodistas; no en el MVP],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Qué NO hacer
+ #strong[Otra app de sismos.] El mercado de Costa Rica está saturado
  (OVSICORI, Sismo Detector, Mis Alertas, Terremotos Cerca de Mí,
  ShakeNet…). No hay hueco.
+ #strong[Otro Google Flood Hub.] Ya cubre Costa Rica, tiene 7 días,
  gauges y API (aunque en waitlist). Competir de frente es perder.
+ #strong[Otro Watch Duty.] Requiere 24/7 de reporteros, radios y
  newsroom; no se hace en 48 h.
+ #strong[Otro dashboard multi-riesgo.] La arquitectura puede ser
  multi-riesgo; el MVP no.
+ #strong[Mostrar el punto rojo sin contexto.] Es el error de Zoom
  Earth/FIRMS para el público.
+ #strong[Prometer “tiempo real” global.] FIRMS global es \<3 h; URT es
  solo EE. UU./Canadá.
+ #strong[Prometer alerta crítica en Android.] Watch Duty/MyShake solo
  la tienen en iOS.
+ #strong[Depender de S-NPP.] Retirado el 2/11/2026; usar NOAA-20/21.
+ #strong[Depender de una API en waitlist.] Google Flood API tarda
  meses.
+ #strong[Decir “alerta oficial”.] No lo somos; siempre link a CNE/NHC y
  disclaimer.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 9. Experimentos de validación (5)
+ #strong[Test de 5 segundos:] mostrá un hotspot de FIRMS a 3 km de una
  casa y preguntá “¿qué harías?”. Después mostrá la tarjeta con
  distancia, confianza y hora. Medí si cambia la decisión.
+ #strong[A/B de precisión:] un pin vs un círculo de 1 km. Hipótesis: el
  círculo genera menos falsa confianza.
+ #strong[Test de falso positivo:] mostrá un flare industrial y un
  incendio forestal; preguntá cuál es peligroso. Medí si la app ayuda a
  distinguirlos.
+ #strong[Test de “sin dato”:] mapa vacío con nubes vs “sin detecciones,
  cobertura nublada”. Medí si entienden la diferencia.
+ #strong[Test de notificación:] alerta a 5 km vs 20 km; ¿cuál quieren
  recibir? Ajustar el default.

#strong[Métrica norte:] tiempo hasta responder “¿hay peligro cerca de
mí?” y #strong[% de usuarios que pueden explicar la confianza y la
fuente] después de usar la app.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 10. Decisiones que habilita
- #strong[Hazard:] incendio sigue siendo la recomendación técnica; no es
  una decisión tomada.
- #strong[Región:] una sola; idealmente con 2--3 eventos históricos
  verificables.
- #strong[Reto:] \#8 si es fuego; \#2 si pesa la tendencia; \#5 si es
  inundación.
- #strong[MVP:] P0 del punto 7, sin multi-riesgo.
- #strong[Posicionamiento:] “traductor personal”, no “alerta oficial”.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 11. Fuentes
#strong[Watch Duty]

- Sitio: #link("https://www.watchduty.org/")
- Cómo funciona:
  #link("https://www.watchduty.org/how-it-works/overview")
- Blog NGFS/satélites:
  #link("https://www.watchduty.org/blog/watch-duty-strengthens-early-wildfire-detection-with-enhanced-satellite-feeds")
- Cobertura:
  #link("https://support.watchduty.org/hc/en-us/articles/15246288300813-What-states-and-counties-do-you-cover")
- Notificaciones:
  #link("https://support.watchduty.org/hc/en-us/articles/49114357393677-How-Watch-Duty-Notifications-Work")
- Critical Alerts:
  #link("https://support.watchduty.org/hc/en-us/articles/45326382026253-How-Critical-Alerts-Work-in-Watch-Duty")

#strong[NASA FIRMS / Earthdata]

- Fire Map: #link("https://firms.modaps.eosdis.nasa.gov/map/")
- Fire Alerts: #link("https://firms.modaps.eosdis.nasa.gov/alerts/")
- FAQ: #link("https://www.earthdata.nasa.gov/data/tools/firms/faq")
- FIRMS: #link("https://www.earthdata.nasa.gov/data/tools/firms")

#strong[Otras apps]

- Zoom Earth: #link("https://zoom.earth/")
- Global Forest Watch:
  #link("https://www.globalforestwatch.org/topics/fires/")
- MyShake: #link("https://myshake.berkeley.edu/") y
  #link("https://myshake.berkeley.edu/FAQ_en.html")
- Google Flood Hub: #link("https://sites.research.google/floods/") y
  #link("https://support.google.com/flood-hub/")
- FEMA:
  #link("https://www.fema.gov/about/news-multimedia/mobile-products")
- GDACS: #link("https://www.gdacs.org/")
- OVSICORI app:
  #link("https://play.google.com/store/apps/details?id=com.bbr.ovsicoriapp")
- UNA Costa Segura:
  #link("https://play.google.com/store/apps/details?id=cr.una.unacostasegura")

#strong[Documentos del repo]

- APIs verificadas: `25-api-research.md`
- Plan de app: `23-plan-app.md`
- Arquitectura:
  `24-arquitectura-app.md`
- Investigación de desastres:
  `22-investigacion-desastres.md`

#line(length: 100%, stroke: 0.6pt + lineColor)

#strong[Última actualización:] 14/11/2026. #strong[Nota:] este documento
es benchmark de producto; la fuente de verdad de APIs y estados es
`25-api-research.md`.