// Generado desde backups/ideas/spherex/docs/08-problemas-astrofisica.md con pandoc. No editar a mano.

#import "theme.typ": *

= 08 --- Problemas de astrofísica y ciencia (enfoque #strong[data-first])
#quote(block: true)[
#strong[Regla nueva (2026-11-14):] todo problema de este documento debe
estar atado a un #strong[dato NASA accesible hoy] por una API o un
archivo de investigación. #strong[Si no hay dato, no es un problema para
este hackathon]: es una idea para otro evento. #strong[Uso:] elegir el
problema #strong[después] de mirar el dato, no al revés.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0. Cómo leer este documento
Hay cuatro tipos de problemas:

#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Tipo], [Ejemplo], [¿Se puede resolver en 48 h?], [¿Usa
      nuestras APIs?],),
    table.hline(),
    [#strong[A. Preguntas científicas grandes]], [¿Qué es la materia
    oscura?], [No. Pero se puede hacer una herramienta que ayude a
    estudiarla.], [A veces; muchas no.],
    [#strong[B. Dolores operativos]], [Los datos están en 10 formatos y
    20 archivos distintos], [#strong[Sí.] Es el mejor terreno para un
    hackathon.], [#strong[Sí], con datos de IRSA/SPHEREx.],
    [#strong[C. Problemas de comunicación/acceso]], [El público no
    entiende o no puede acceder a los datos], [#strong[Sí.] Muy buen
    terreno para impacto.], [#strong[Sí], con HiPS/cutouts/media.],
    [#strong[D. Problemas sin datos disponibles]], [“Detectar materia
    oscura con SPHEREx”], [No], [#strong[No.] Descartar o reformular.],
  )]
  , kind: table
  )

#strong[Regla de oro para un challenge custom:] no intentes resolver la
pregunta científica; resolvé el #strong[cuello de botella] que impide
que los científicos (o el público) la respondan #strong[con los datos
que tenemos].

#quote(block: true)[
#strong[Aviso importante:] las misiones listadas en “Datos/misiones” de
la Parte A son #strong[contexto científico]. Para el prototipo solo
cuentan las APIs de la tabla 0.1. Si una misión no está ahí, no tenemos
sus datos en este hackathon.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0.1 Inventario: los datos que SÍ tenemos
#figure(
  align(center)[#table(
    columns: (1.0fr, 0.7fr, 2.0fr, 2.4fr, 0.9fr, 0.5fr, 1.4fr),
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,auto,auto,),
    table.header([API/dataset], [Tipo], [Qué dato
      entrega], [Endpoint], [Estado 2026-11-14], [DRL\*], [Sirve para],),
    table.hline(),
    [#strong[SPHEREx SIA2]], [Ciencia], [Metadatos de imágenes:
    `obs_id`, banda, `t_min`, `access_url`, `cloud_access`,
    `s_region`], [`https://irsa.ipac.caltech.edu/SIA`], [#text(fill: green, weight: "bold")[✓]
    (intermitente)], [5], [Series temporales, búsqueda por posición],
    [#strong[SPHEREx Cutout]], [Ciencia], [FITS recortado: `IMAGE`,
    `FLAGS`, `VARIANCE`, `ZODI`, `EPSF`,
    `WCS-WAVE`], [`<access_url>?center=RA,Dec&size=0.1`], [#text(fill: green, weight: "bold")[✓]], [5], [Píxeles,
    diferencia, espectros],
    [#strong[IRSA TAP]], [Ciencia/metadata], [Tablas ADQL:
    `spherex.plane`, `spherex.artifact`\; cruces con catálogos
    IRSA], [`https://irsa.ipac.caltech.edu/TAP/sync`], [#text(fill: orange, weight: "bold")[!]
    502], [5], [Metadata ordenada, cruces],
    [#strong[HiPS All-Sky Cube]], [Ciencia/visual], [102 capas PNG de
    512×512; propiedades y longitudes de
    onda], [`https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`], [#text(fill: green, weight: "bold")[✓]], [4], [Slider
    espectral, contexto],
    [#strong[AWS Open Data]], [Ciencia], [FITS completos (\~60 MB c/u)
    en S3 anónimo], [`s3://nasa-irsa-spherex`], [#text(fill: green, weight: "bold")[✓]
    (documentado)], [5], [Descarga masiva, fallback],
    [#strong[SPHEREx Data Explorer]], [Ciencia/GUI], [Búsqueda,
    visualización y
    descarga], [`https://irsa.ipac.caltech.edu/applications/spherex/`], [#text(fill: green, weight: "bold")[✓]], [4], [Validar
    targets a mano],
    [#strong[Spectrophotometry Tool]], [Ciencia/GUI], [Espectros de
    SPHEREx], [IRSA], [#text(fill: green, weight: "bold")[✓] (GUI)], [4], [Referencia de espectros],
    [#strong[Mosaic Tool]], [Ciencia/GUI], [Mosaicos], [IRSA], [#text(fill: green, weight: "bold")[✓]
    (GUI)], [3], [No prioritario],
    [#strong[Source Discovery Tool]], [Ciencia/código], [Paquete Python
    para extraer fuentes y espectros], [GitHub/IRSA
    tutorials], [#text(fill: green, weight: "bold")[✓]], [4], [Código para fotometría],
    [#strong[MOST]], [Ciencia], [Búsqueda de objetos del sistema solar
    en imágenes
    IRSA], [`https://irsa.ipac.caltech.edu/applications/MOST/`], [#text(fill: green, weight: "bold")[✓]
    (GUI)], [4], [Asteroides/cometas],
    [#strong[NASA Exoplanet Archive TAP]], [Ciencia/catálogo], [Catálogo
    de exoplanetas: `pl_name`, `hostname`, `disc_year`,
    `sy_dist`], [`https://exoplanetarchive.ipac.caltech.edu/TAP/sync`], [#text(fill: green, weight: "bold")[✓]], [5], [Contexto/cruces,
    no imágenes],
    [#strong[NASA Image & Video Library]], [Media], [Imágenes/videos de
    NASA], [`https://images-api.nasa.gov/search?q=...`], [#text(fill: green, weight: "bold")[✓]], [2], [Landing/pitch],
    [#strong[APOD (WP API)]], [Media], [Foto astronómica del
    día], [`https://science.nasa.gov/wp-json/wp/v2/apod-basic`], [#text(fill: green, weight: "bold")[✓]], [1], [Landing/pitch],
    [#strong[api.nasa.gov]], [Media/contexto], [APOD, NeoWs, EPIC,
    etc.], [`https://api.nasa.gov/`], [#text(fill: orange, weight: "bold")[!] DEMO\_KEY 500], [1--3], [Solo
    si sobra tiempo],
  )]
  , kind: table
  )

\* #strong[DRL = Data Readiness Level:] 5 = ciencia programable y
documentada; 4 = ciencia pero GUI/código; 3 = ciencia
indirecta/visualización; 2 = media; 1 = solo contexto.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0.2 Qué problemas se pueden atacar #strong[de verdad] con estos datos
#figure(
  align(center)[#table(
    columns: 5,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,),
    table.header([Problema], [Dato que lo habilita], [API
      exacta], [Factibilidad 48 h], [¿Recomendado?],),
    table.hline(),
    [#strong[Objetos en movimiento / asteroides / cometas]], [Series
    temporales de imágenes], [SIA2 + Cutout +
    MOST], [#strong[Alta]], [#text(fill: green, weight: "bold")[✓] #strong[Sí]],
    [#strong[Estrellas variables / curvas de luz]], [Series temporales
    de cutouts], [SIA2 + Cutout], [#strong[Alta]], [#text(fill: green, weight: "bold")[✓] #strong[Sí]],
    [#strong[Espectros / hielos / agua / CO₂]], [102 bandas +
    `WCS-WAVE`], [HiPS + Cutout + Spectrophotometry], [Media], [#text(fill: green, weight: "bold")[✓] Sí
    (bonus)],
    [#strong[Visualización pública del cielo]], [102 capas +
    cutouts], [HiPS + Cutout], [#strong[Alta]], [#text(fill: green, weight: "bold")[✓] #strong[Sí]],
    [#strong[Ciencia ciudadana / blink]], [Cutouts + diferencias], [SIA2
    \+ Cutout], [#strong[Alta]], [#text(fill: green, weight: "bold")[✓] #strong[Sí]],
    [#strong[Clustering / galaxias / inflación]], [Catálogo espectral y
    posiciones], [SIA2/TAP + AWS], [Media-baja], [#text(fill: orange, weight: "bold")[!] Solo si hay
    experto],
    [#strong[Cruces con catálogos / ficha de objeto]], [Metadata +
    catálogo de exoplanetas], [IRSA TAP + Exoplanet TAP], [Media], [#text(fill: green, weight: "bold")[✓]
    Sí (custom)],
    [#strong[Calidad de datos / flags]], [`FLAGS`,
    `VARIANCE`], [Cutout], [Media], [#text(fill: green, weight: "bold")[✓] Bonus],
    [#strong[Materia oscura / energía oscura]], [No hay dato
    directo], [---], [Baja], [#text(fill: red, weight: "bold")[×] No],
    [#strong[Atmósferas de exoplanetas]], [No hay espectros de
    exoplanetas], [Exoplanet TAP solo catálogo], [Baja], [#text(fill: red, weight: "bold")[×] No],
    [#strong[Sol / clima espacial]], [No hay datos solares en estas
    APIs], [---], [Baja], [#text(fill: red, weight: "bold")[×] No],
    [#strong[Superficie de Marte/Luna]], [No hay imágenes de
    superficie], [---], [Baja], [#text(fill: red, weight: "bold")[×] No],
    [#strong[Ondas gravitacionales / CMB]], [No hay
    datos], [---], [Baja], [#text(fill: red, weight: "bold")[×] No],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0.3 Qué #strong[NO] se puede hacer con estos datos
- #strong[No] se puede “detectar materia oscura” con SPHEREx.
- #strong[No] se puede caracterizar atmósferas de exoplanetas: el
  Exoplanet Archive es un catálogo, no espectros.
- #strong[No] se puede analizar la superficie de Marte/Luna: no tenemos
  MRO, LRO, HiRISE, MOLA.
- #strong[No] se puede hacer clima espacial: no tenemos SDO, SOHO,
  Parker.
- #strong[No] se puede usar NISAR/SAR: no está en la lista.
- #strong[No] se puede usar Rubin/LSST en vivo: no está en la lista.
- #strong[No] se puede decir “descubrimos un planeta”: no hay datos para
  eso.

Si el equipo quiere uno de estos, #strong[necesita otra API/dataset] y
debe justificarlo. No alcanza con que el tema sea “importante”.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0.4 Contrato de datos (obligatorio por feature)
Antes de codear cualquier feature, completar:

```text
Feature:
Dataset:
API/endpoint:
Campos que uso:
Acceso (auth/cuota):
Caché:
Fallback si falla:
Qué puedo afirmar:
Qué NO puedo afirmar:
```

Si no se puede completar, la feature no entra al backlog.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 0.5 Regla de oro (actualizada)
#quote(block: true)[
#strong[No elijas el problema y después busques el dato.] #strong[Mirá
el dato que tenés y elegí el problema que ese dato permite responder.]

Con las APIs de SPHEREx/IRSA, los problemas fuertes son:
#strong[movimiento, variabilidad, espectros, visualización y ciencia
ciudadana]. Los demás son contexto o requieren datos que no tenemos.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

= PARTE A --- Preguntas científicas grandes
#quote(block: true)[
#strong[Recordatorio data-first:] las misiones de esta sección son
#strong[contexto]. Lo que podemos usar está en la tabla 0.1 y en la
Parte F. Si una pregunta no aparece en #strong[F1] con #text(fill: green, weight: "bold")[✓] o #text(fill: orange, weight: "bold")[!],
#strong[no es viable con nuestros datos].
]

== A1. ¿Qué es la materia oscura?
- #strong[Qué es:] \~27% del universo. No emite luz, pero su gravedad se
  ve en curvas de rotación de galaxias, lentes gravitacionales, CMB y
  estructura a gran escala.
- #strong[Por qué es difícil:] no sabemos qué partícula es. Los
  candidatos (WIMPs, axiones, neutrinos estériles, agujeros negros
  primordiales) requieren experimentos muy distintos. La detección
  directa sigue sin señal concluyente.
- #strong[Datos/misiones:] Fermi, Chandra, Hubble, Rubin/LSST, Euclid,
  Roman (futuro), experimentos subterráneos (LZ, XENONnT).
- #strong[Oportunidad 48 h:] herramientas de visualización de lentes
  gravitacionales, simulación de halos, o un “detector de anomalías” en
  curvas de rotación. Difícil sin datos procesados.
- #strong[Nivel de factibilidad:] baja para ciencia; media para
  visualización/educación.

== A2. Energía oscura y la tensión de Hubble
- #strong[Qué es:] \~68% del universo es energía oscura. La expansión se
  acelera. Distintas mediciones de la constante de Hubble (H0)
  discrepan: CMB \~67 km/s/Mpc vs mediciones locales \~73 km/s/Mpc.
- #strong[Por qué es difícil:] puede ser un error sistemático, nueva
  física, o ambas. Los datos recientes (DESI, JWST) todavía no cierran
  el caso.
- #strong[Datos/misiones:] Planck, Hubble, JWST, DESI, Rubin, Euclid,
  Roman.
- #strong[Oportunidad 48 h:] dashboard que compare mediciones de H0 con
  sus incertidumbres y muestre la tensión; educativo y visual.
- #strong[Nivel:] baja para resolver; alta para comunicar.

== A3. Amanecer cósmico y reionización
- #strong[Qué es:] ¿cómo y cuándo se formaron las primeras estrellas y
  galaxias? ¿qué reionizó el universo?
- #strong[Por qué es difícil:] son objetos muy débiles y lejanos; hay
  que mirar en infrarrojo y radio (21 cm).
- #strong[Datos/misiones:] JWST, SPHEREx, Roman, SKA (futuro),
  experimentos de 21 cm.
- #strong[Oportunidad 48 h:] explorador visual de galaxias lejanas con
  datos JWST/SPHEREx; línea de tiempo del universo.
- #strong[Nivel:] baja para ciencia; alta para visualización.

== A4. Formación y evolución de galaxias
- #strong[Qué es:] cómo crecen las galaxias, cómo el agujero negro
  central y el gas regulan la formación estelar (feedback), cómo se
  enriquecen químicamente.
- #strong[Por qué es difícil:] escalas de tiempo enormes, física
  compleja (turbulencia, campos magnéticos, rayos cósmicos), datos
  multi-longitud de onda.
- #strong[Datos/misiones:] Hubble, JWST, SPHEREx, Euclid, Rubin, ALMA
  (no NASA), Chandra.
- #strong[Oportunidad 48 h:] herramienta para comparar poblaciones de
  galaxias en distintos redshifts; mapas de color/masa.
- #strong[Nivel:] baja/Media.

== A5. Exoplanetas y habitabilidad
- #strong[Qué es:] detectar planetas, caracterizar atmósferas, buscar
  biosignaturas, entender la diversidad de sistemas.
- #strong[Por qué es difícil:] señal diminuta; la atmósfera de un
  planeta rocoso es \~10⁻⁶ de la luz de la estrella; contaminación
  estelar; nubes/hazes.
- #strong[Datos/misiones:] Kepler, TESS, JWST, Roman, HWO (futuro), NASA
  Exoplanet Archive.
- #strong[Oportunidad 48 h:] explorador de atmósferas con espectros
  JWST; visualizador de habitabilidad; ficha de exoplaneta.
- #strong[Nivel:] media para visualización; baja para ciencia nueva.

== A6. Universo dinámico: transientes y alertas
- #strong[Qué es:] supernovas, GRBs, kilonovas, estrellas variables,
  asteroides, cometas. El cielo cambia cada noche.
- #strong[Por qué es difícil:] volumen. Rubin generará #strong[\~20
  TB/noche] y #strong[7--10 millones de alertas/noche], con latencia de
  \~60 s. Ningún humano puede revisarlas.
- #strong[Datos/misiones:] Rubin/LSST, ZTF, ATLAS, Pan-STARRS, SPHEREx,
  Swift, Fermi, IceCube, LIGO/Virgo/KAGRA.
- #strong[Oportunidad 48 h:] #strong[alert triage], clasificación,
  priorización, seguimiento, visualización de alertas. #strong[Alta.]
- #strong[Nivel:] alta para un prototipo; es el mejor terreno para un
  challenge custom.

== A7. Agujeros negros y núcleos activos de galaxias (AGN)
- #strong[Qué es:] cómo crecen los agujeros negros supermasivos, cómo
  afectan a su galaxia, cómo se fusionan.
- #strong[Por qué es difícil:] escalas de energía extremas, datos en
  rayos X/radio/IR, variabilidad rápida.
- #strong[Datos/misiones:] Chandra, NuSTAR, Swift, XMM-Newton (ESA),
  EHT, Rubin, Roman.
- #strong[Oportunidad 48 h:] visor de variabilidad de AGN; clasificador
  de curvas de luz.
- #strong[Nivel:] media.

== A8. Formación estelar, medio interestelar y hielos
- #strong[Qué es:] cómo nacen las estrellas, qué moléculas hay en las
  nubes y discos, dónde está el agua.
- #strong[Por qué es difícil:] polvo, hielos, química compleja, muchas
  líneas espectrales.
- #strong[Datos/misiones:] SPHEREx (102 bandas, hielos), JWST, SOFIA
  (retirado), ALMA, Herschel (archivo).
- #strong[Oportunidad 48 h:] explorador de espectros de hielos; mapas de
  agua/CO₂; comparador de espectros.
- #strong[Nivel:] media; muy alineado con SPHEREx.

== A9. Física solar y clima espacial
- #strong[Qué es:] erupciones solares, eyecciones de masa coronal
  (CMEs), viento solar, tormentas geomagnéticas.
- #strong[Por qué es difícil:] el Sol es un sistema no lineal; predecir
  erupciones es muy difícil; hay que combinar observaciones y modelos.
- #strong[Datos/misiones:] SDO, SOHO, Parker Solar Probe, Solar Orbiter
  (ESA), ACE, IMAP, PUNCH.
- #strong[Oportunidad 48 h:] dashboard de clima espacial; predictor
  simple de flares; visualización de CMEs.
- #strong[Nivel:] media; buen impacto en Earth science/space weather.

== A10. Ciencia planetaria
- #strong[Qué es:] entender la formación y evolución de planetas, lunas,
  asteroides y cometas; buscar habitabilidad; preparar exploración
  humana.
- #strong[Por qué es difícil:] datos de muchas misiones, formatos
  distintos, terrenos extremos, comunicación, radiación.
- #strong[Datos/misiones:] Perseverance, Curiosity, MAVEN, MRO, LRO,
  Europa Clipper, Dragonfly, Cassini (archivo).
- #strong[Oportunidad 48 h:] mapas multicapa, planificadores de ruta,
  análisis de sitios de aterrizaje, análogos terrestres.
- #strong[Nivel:] alta para herramientas; los challenges 9, 10 y 11 son
  exactamente esto.

== A11. Ondas gravitacionales y multi-mensajero
- #strong[Qué es:] detectar fusiones de agujeros negros/estrellas de
  neutrones y observarlas también en luz, neutrinos y rayos cósmicos.
- #strong[Por qué es difícil:] eventos raros, ventanas cortas,
  coordinación global, ruido.
- #strong[Datos:] LIGO/Virgo/KAGRA, LISA (futuro), Fermi, Swift,
  IceCube.
- #strong[Oportunidad 48 h:] visualizador de eventos multi-mensajero;
  línea de tiempo; mapa de localización.
- #strong[Nivel:] media/baja.

== A12. Cosmología con CMB
- #strong[Qué es:] medir el universo temprano, la inflación, la masa de
  los neutrinos, la suma de masas de neutrinos.
- #strong[Por qué es difícil:] señales microscópicas, contaminación
  galáctica, análisis estadísticos complejos.
- #strong[Datos:] Planck, ACT, SPT, CMB-S4, LiteBIRD (futuro).
- #strong[Oportunidad 48 h:] visualización de mapas CMB y espectros de
  potencia; educativo.
- #strong[Nivel:] baja/media.

#line(length: 100%, stroke: 0.6pt + lineColor)

= PARTE B --- Dolores operativos (el mejor terreno para un hackathon)
#quote(block: true)[
#strong[Recordatorio data-first:] estos dolores son válidos #strong[solo
si] se pueden atacar con los datos de la tabla 0.1. La columna
“Datos/APIs” de cada punto y la matriz #strong[F2] dicen con qué. Si no
hay API, se descarta.
]

#quote(block: true)[
Estos son los problemas que los científicos viven #strong[todos los
días]. No son “preguntas del universo”, son #strong[fricciones de
trabajo]. Un prototipo de 48 h puede aliviarlos de verdad.
]

== B1. Volumen y velocidad de los datos
- #strong[Síntoma:] los datos llegan más rápido de lo que se pueden
  procesar.
- #strong[Números:] Rubin \~20 TB/noche y 7--10 M alertas/noche; SKA y
  JWST también generan volúmenes enormes; archivos FITS de GB.
- #strong[Por qué duele:] storage, ancho de banda, costos de nube,
  tiempos de descarga, procesos que tardan horas.
- #strong[Datos/APIs:] Rubin, IRSA, MAST, AWS Open Data, Google Cloud.
- #strong[Idea 48 h:] descargador inteligente con caché, compresión y
  reanudación; “solo lo que necesito”.
- #strong[Factibilidad:] alta.

== B2. Formatos y protocolos heterogéneos
- #strong[Síntoma:] FITS, VOTable, CSV, Parquet, Zarr, HDF5, ASDF, JSON;
  cada archivo con sus unidades y convenciones.
- #strong[Por qué duele:] hay que escribir un parser distinto para cada
  misión; se pierden horas en “¿qué unidad es esto?”.
- #strong[Datos/APIs:] IVOA (SIA2, TAP, SODA, ObsCore), FITS, VOTable.
- #strong[Idea 48 h:] conversor/validador universal con vista previa y
  unidades; “subí un archivo y te digo qué es”.
- #strong[Factibilidad:] alta; impacto alto; wow medio.

== B3. Acceso, autenticación y cuotas
- #strong[Síntoma:] cada archivo pide una cuenta distinta (Earthdata
  Login, MAST, IRSA, ESA), tokens, cuotas, permisos.
- #strong[Por qué duele:] fricción enorme para nuevos usuarios y para
  automatizar.
- #strong[Datos/APIs:] NASA Earthdata, MAST, IRSA, ESA Archives, CDS.
- #strong[Idea 48 h:] “una sola puerta” que detecte el archivo, guíe el
  login y cachee; o un buscador unificado con enlaces directos.
- #strong[Factibilidad:] media; el login no se puede evitar, pero se
  puede guiar.

== B4. Cruzar catálogos (cross-matching)
- #strong[Síntoma:] el mismo objeto aparece en 10 catálogos con
  coordenadas, épocas y resoluciones distintas.
- #strong[Por qué duele:] el matching probabilístico es difícil; proper
  motion, errores, objetos extendidos.
- #strong[Datos/APIs:] Gaia, WISE, 2MASS, SDSS, SPHEREx, SIMBAD, NED,
  VizieR.
- #strong[Idea 48 h:] “ficha única de objeto” que resuelve nombre →
  coordenadas → cruza catálogos → muestra timeline.
- #strong[Factibilidad:] alta; impacto alto; wow alto. #strong[Muy buena
  idea custom.]

== B5. Triage de alertas y seguimiento
- #strong[Síntoma:] millones de alertas, miles de falsos positivos,
  telescopios limitados.
- #strong[Por qué duele:] hay que decidir en minutos qué observar; los
  brokers (ALeRCE, ANTARES, Fink, Lasair) ayudan, pero la coordinación
  sigue siendo manual.
- #strong[Datos/APIs:] Rubin, ZTF, ALeRCE, Fink, ANTARES, Lasair, TNS.
- #strong[Idea 48 h:] dashboard que ordene alertas por “interesante”,
  explique por qué y sugiera follow-up.
- #strong[Factibilidad:] media; impacto muy alto; wow alto. #strong[La
  mejor idea custom si hay alguien de datos.]

== B6. Visualización de datos complejos
- #strong[Síntoma:] cubos 3D, 102 bandas, series temporales, mapas
  multi-longitud de onda; las herramientas existentes son difíciles.
- #strong[Por qué duele:] los científicos no pueden “ver” patrones; el
  público no entiende.
- #strong[Datos/APIs:] SPHEREx, JWST, Chandra, Aladin, Firefly, glue.
- #strong[Idea 48 h:] visor web de cubos con slider, diferencia y
  anotaciones; o sonificación.
- #strong[Factibilidad:] alta; wow alto. #strong[Es lo que hace el
  challenge SPHEREx.]

== B7. Reproducibilidad y procedencia
- #strong[Síntoma:] “en mi máquina funciona”; notebooks sin entorno;
  datos que cambian; resultados que no se pueden repetir.
- #strong[Por qué duele:] la ciencia pierde credibilidad y tiempo; los
  revisores no pueden verificar.
- #strong[Datos/APIs:] Binder, Code Ocean, Zenodo, DVC, RO-Crate, W3C
  PROV.
- #strong[Idea 48 h:] “receta” de un click que corre un análisis,
  registra versiones y genera un informe reproducible.
- #strong[Factibilidad:] alta; impacto alto; wow bajo/medio.

== B8. IA/ML: etiquetas, sesgo e interpretabilidad
- #strong[Síntoma:] los modelos clasifican galaxias/transientes, pero no
  se sabe por qué; hay pocos datos etiquetados; el dominio cambia.
- #strong[Por qué duele:] sin incertidumbre y explicabilidad, los
  científicos no confían.
- #strong[Datos/APIs:] Galaxy Zoo, Rubin, ZTF, JWST, catálogos
  etiquetados.
- #strong[Idea 48 h:] clasificador con “explicación” visual (saliency),
  incertidumbre y revisión humana.
- #strong[Factibilidad:] media; impacto alto; wow medio.

== B9. Software legado y sostenibilidad
- #strong[Síntoma:] código FORTRAN/IDL/IRAF de los 80, dependencias
  rotas, nadie lo mantiene.
- #strong[Por qué duele:] bloquea análisis y reproducibilidad.
- #strong[Datos/APIs:] IRAF, IDL, Astropy, CASA.
- #strong[Idea 48 h:] “traductor” o wrapper moderno para una tarea
  común; documentación automática.
- #strong[Factibilidad:] media; impacto medio; poco wow.

== B10. Planificación de observaciones y propuestas
- #strong[Síntoma:] pedir tiempo de telescopio es complejo; hay que
  justificar ciencia, visibilidad, condiciones, instrumentos.
- #strong[Por qué duele:] mucho tiempo perdido; los novatos no saben por
  dónde empezar.
- #strong[Datos/APIs:] NASA/ESA observatorios, efemérides, weather, TAC.
- #strong[Idea 48 h:] asistente que, dada una pregunta científica,
  sugiere archivos/instrumentos y estima factibilidad.
- #strong[Factibilidad:] media; impacto medio; wow medio.

== B11. Metadata, documentación y descubrimiento
- #strong[Síntoma:] el dato existe, pero no se encuentra; la
  documentación está dispersa; las unidades no están claras.
- #strong[Por qué duele:] se duplican esfuerzos y se usan datos mal.
- #strong[Datos/APIs:] IVOA, NASA ADS, Zenodo, datacenters.
- #strong[Idea 48 h:] buscador semántico sobre documentación de
  archivos; “preguntá en lenguaje natural qué datos hay para X”.
- #strong[Factibilidad:] alta; impacto alto; wow medio. #strong[Buena
  idea custom.]

== B12. Ciencia ciudadana
- #strong[Síntoma:] millones de imágenes, pocos voluntarios; onboarding
  difícil; validación y crédito.
- #strong[Por qué duele:] sin voluntarios, no se escala; sin validación,
  no se confía.
- #strong[Datos/APIs:] Zooniverse, Backyard Worlds, Galaxy Zoo, Planet
  Hunters.
- #strong[Idea 48 h:] experiencia guiada de descubrimiento con tutorial,
  scoring y validación cruzada.
- #strong[Factibilidad:] alta; impacto alto; wow alto.

== B13. Comunicación pública y confianza
- #strong[Síntoma:] la ciencia es compleja; el público desconfía; el
  acceso es desigual.
- #strong[Por qué duele:] afecta financiamiento, políticas y vocaciones.
- #strong[Datos/APIs:] NASA Images, APOD, EIC, redes.
- #strong[Idea 48 h:] storytelling visual, sonificación, accesibilidad,
  traducción.
- #strong[Factibilidad:] alta; impacto alto; wow alto.

== B14. Colaboración, crédito y datos compartidos
- #strong[Síntoma:] colaboraciones enormes, authorship complejo, datos
  con derechos.
- #strong[Por qué duele:] fricción social y legal.
- #strong[Idea 48 h:] herramienta de crédito/procedencia para equipos;
  poco “wow”.
- #strong[Factibilidad:] media; impacto medio.

== B15. Financiamiento y carrera
- #strong[Síntoma:] pocos fondos, mucha competencia, precariedad.
- #strong[Por qué duele:] afecta qué ciencia se hace.
- #strong[Idea 48 h:] no es un problema de hackathon; evitar.

#line(length: 100%, stroke: 0.6pt + lineColor)

= PARTE C --- Otros dominios (Space Apps no es solo astrofísica)
== C1. Earth science
- #strong[Problemas:] armonizar sensores (MODIS/VIIRS), nubes,
  calibración, datos near-real-time, relevancia local, acceso (Earthdata
  Login), modelos vs observaciones.
- #strong[Datos/APIs:] FIRMS, Earthdata, GES DISC, Giovanni, SMAP,
  GRACE-FO, Landsat, Sentinel.
- #strong[Idea 48 h:] calendario de incendios armonizado; detective de
  tendencias; mapa de resiliencia local.

== C2. Ciencia planetaria
- #strong[Problemas:] fusionar datos de misiones, terreno, radiación,
  comunicaciones, sitios de aterrizaje, análogos.
- #strong[Datos/APIs:] USGS, PDS, Mars Trek, LRO, MRO, HiRISE, MOLA.
- #strong[Idea 48 h:] mapa multicapa para Marswalk; navegador de sitios
  lunares; análogos terrestres.

== C3. Heliofísica / clima espacial
- #strong[Problemas:] predecir flares/CMEs, validar modelos, datos
  dispersos, latencia.
- #strong[Datos/APIs:] SDO, SOHO, Parker, Solar Orbiter, ACE, IMAP,
  PUNCH, DONKI.
- #strong[Idea 48 h:] dashboard de clima espacial; predictor simple;
  visualización de CMEs.

== C4. Exploración humana
- #strong[Problemas:] salud, soporte vital, radiación, alimentación,
  aislamiento, confiabilidad.
- #strong[Datos/APIs:] NASA HRP, literatura, datos análogos.
- #strong[Idea 48 h:] monitoreo de salud; simulador de outpost;
  planificador de recursos.

== C5. Educación y comunicación
- #strong[Problemas:] STEM abstracto, falta de acceso, desinformación,
  idioma.
- #strong[Datos/APIs:] NASA Images, APOD, EIC, recursos educativos.
- #strong[Idea 48 h:] juego, museo interactivo, sonificación,
  storytelling.

#line(length: 100%, stroke: 0.6pt + lineColor)

= PARTE D --- Menú de ideas para un “Custom Challenge”
#quote(block: true)[
Si el equipo decide hacer un custom (sabiendo que #strong[no es elegible
para Global Judging]), estas son las mejores apuestas. Puntaje: F =
factibilidad 48 h, I = impacto, W = wow, D = datos listos. Total /20.
]

#figure(
  align(center)[#table(
    columns: (0.5fr, 1.8fr, 2.2fr, 2.2fr, 0.5fr, 0.5fr, 0.5fr, 0.5fr, 0.6fr),
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,auto,auto,auto,auto,),
    table.header([\#], [Idea], [Qué
      resuelve], [Datos/APIs], [F], [I], [W], [D], [Total],),
    table.hline(),
    [1], [#strong[Ficha única de objeto]], [Cruzar catálogos y misiones
    en una sola vista], [SIMBAD/NED, IRSA, MAST, Exoplanet
    Archive], [4], [5], [4], [5], [#strong[18]],
    [2], [#strong[Triage de alertas]], [Priorizar millones de alertas y
    sugerir follow-up], [Rubin/ZTF, ALeRCE/Fink,
    TNS], [3], [5], [4], [3], [#strong[15]],
    [3], [#strong[Copiloto de archivos NASA]], [Lenguaje natural →
    consulta TAP/SIA → notebook reproducible], [IRSA TAP, MAST,
    Exoplanet Archive], [4], [5], [4], [4], [#strong[17]],
    [4], [#strong[Traductor de formatos]], [FITS/VOTable/Parquet/Zarr
    con validación y unidades], [Astropy,
    IVOA], [5], [4], [2], [5], [#strong[16]],
    [5], [#strong[Timeline multi-misión]], [Ver la misma posición a lo
    largo del tiempo en varias misiones], [SPHEREx, WISE, ZTF,
    Gaia], [4], [4], [5], [4], [#strong[17]],
    [6], [#strong[Onboarding de ciencia ciudadana]], [Guiar a
    voluntarios a descubrir y validar], [Zooniverse, Backyard
    Worlds], [4], [4], [4], [4], [#strong[16]],
    [7], [#strong[Planificador de observaciones]], [Dada una pregunta,
    sugerir archivos/instrumentos/ventanas], [Efemérides,
    archivos], [3], [4], [3], [3], [#strong[13]],
    [8], [#strong[Dashboard de calidad]], [Ver flags, calibración y
    problemas de datos], [IRSA/MAST], [4], [3], [2], [4], [#strong[13]],
    [9], [#strong[Asistente de propuestas]], [De pregunta científica a
    propuesta factible], [Literatura,
    archivos], [3], [4], [3], [3], [#strong[13]],
    [10], [#strong[Sonificación accesible]], [Convertir luz curvas/cubos
    en sonido], [EIC, NASA data], [4], [4], [5], [4], [#strong[17]],
  )]
  , kind: table
  )

=== Mi recomendación si van por custom
+ #strong[Ficha única de objeto] (18/20): visual, útil, se entiende en
  30 s, y se puede conectar con SPHEREx.
+ #strong[Copiloto de archivos NASA] (17/20): muy potente, pero el
  riesgo de alucinación hay que controlarlo con plantillas.
+ #strong[Timeline multi-misión] (17/20): es casi el challenge SPHEREx
  con más misiones; muy buen demo.

#line(length: 100%, stroke: 0.6pt + lineColor)

= PARTE E --- Cómo elegir y cómo encajarlo en un challenge oficial
== 5.1 Preguntas para filtrar
+ ¿Se puede explicar en una frase?
+ ¿Se puede mostrar en 30 segundos?
+ ¿Los datos están disponibles #strong[hoy]?
+ ¿Un equipo de 5 puede tener algo funcional en 48 h?
+ ¿Qué criterio del jurado mejora? (Impact, Creativity, Validity,
  Relevance, Presentation)
+ ¿Qué hacemos si la API falla?
+ ¿Esto ya existe? Si existe, ¿qué mejora?

== 5.2 Cómo convertir un custom en un challenge oficial
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Idea custom], [Challenge oficial donde encaja],),
    table.hline(),
    [Ficha única de objeto], [#strong[Planet X and SPHEREx] (ficha +
    timeline)],
    [Triage de alertas], [#strong[Planet X and SPHEREx] (candidatos) o
    #strong[MODIS/VIIRS] (alertas de fuego)],
    [Copiloto de archivos], [#strong[Be An Earth System Trend Detective]
    o #strong[SPHEREx]],
    [Traductor de formatos], [#strong[Earth System Trend Detective]
    (datos)],
    [Timeline multi-misión], [#strong[Planet X and SPHEREx]],
    [Onboarding ciudadano], [#strong[Planet X and SPHEREx] o
    #strong[Earth Jukebox]],
    [Planificador de observaciones], [#strong[Lunar Landing Site
    Navigator] o #strong[Martian Map]],
    [Sonificación], [#strong[The Earth Information Jukebox]],
  )]
  , kind: table
  )

#strong[Conclusión:] casi cualquier idea custom se puede
#strong[encajar] en un challenge oficial. Así conservás la elegibilidad
global y hacés algo diferente.

#line(length: 100%, stroke: 0.6pt + lineColor)

= PARTE F --- Matriz problema → dato NASA → API → prototipo
#quote(block: true)[
Esta es la parte que manda. Si un problema no aparece acá con un dato
concreto, #strong[no entra al proyecto].
]

== F1. Preguntas grandes: ¿tenemos el dato?
#figure(
  align(center)[#table(
    columns: 5,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,),
    table.header([Pregunta], [¿Dato en nuestras APIs?], [API/dato
      disponible], [Qué se puede hacer en 48 h], [Veredicto],),
    table.hline(),
    [#strong[A1. Materia oscura]], [#text(fill: red, weight: "bold")[×] No directo], [Solo
    catálogo/estructura a gran escala de SPHEREx], [Visualizador de
    estructura a gran escala; no mide materia oscura], [#text(fill: red, weight: "bold")[×] No],
    [#strong[A2. Energía oscura / H0]], [#text(fill: red, weight: "bold")[×] No], [No hay mediciones de
    H0 en las APIs], [Nada honesto], [#text(fill: red, weight: "bold")[×] No],
    [#strong[A3. Amanecer cósmico]], [#text(fill: red, weight: "bold")[×] No], [SPHEREx no es JWST; no
    hay datos de alto z en la lista], [Nada directo], [#text(fill: red, weight: "bold")[×] No],
    [#strong[A4. Formación de galaxias]], [#text(fill: orange, weight: "bold")[!] Parcial], [Catálogo
    espectral/posiciones SPHEREx (SIA2/TAP/AWS)], [Clasificador
    color/espectro de galaxias; requiere catálogo], [#text(fill: orange, weight: "bold")[!] Solo con
    experto],
    [#strong[A5. Exoplanetas]], [#text(fill: orange, weight: "bold")[!] Solo catálogo], [NASA Exoplanet
    Archive TAP (`ps`)], [Explorador de exoplanetas; #strong[no]
    atmósferas], [#text(fill: green, weight: "bold")[✓] Solo catálogo/contexto],
    [#strong[A6. Transientes / movimiento]], [#text(fill: green, weight: "bold")[✓] Sí], [SIA2 + Cutout +
    MOST], [Blink, diferencia, candidatos, asteroides/cometas], [#text(fill: green, weight: "bold")[✓]
    #strong[Recomendado]],
    [#strong[A7. Agujeros negros / AGN]], [#text(fill: orange, weight: "bold")[!] Parcial], [SPHEREx colores
    \+ cruce WISE vía IRSA], [Buscador de fuentes rojas/AGN; no rayos
    X], [#text(fill: orange, weight: "bold")[!] Bonus],
    [#strong[A8. Formación estelar / hielos]], [#text(fill: green, weight: "bold")[✓] Sí], [102 bandas +
    `WCS-WAVE` + Spectrophotometry], [Espectros quick-look; mapas de
    agua/CO₂], [#text(fill: green, weight: "bold")[✓] #strong[Recomendado]],
    [#strong[A9. Sol / clima espacial]], [#text(fill: red, weight: "bold")[×] No], [No hay
    SDO/SOHO/Parker en la lista], [Nada], [#text(fill: red, weight: "bold")[×] No],
    [#strong[A10. Ciencia planetaria]], [#text(fill: orange, weight: "bold")[!] Parcial], [MOST + SPHEREx
    (asteroides/cometas)], [Buscar objetos del sistema solar;
    #strong[no] superficies], [#text(fill: orange, weight: "bold")[!] Solo objetos],
    [#strong[A11. Ondas gravitacionales]], [#text(fill: red, weight: "bold")[×] No], [No hay
    LIGO/Virgo], [Nada], [#text(fill: red, weight: "bold")[×] No],
    [#strong[A12. CMB]], [#text(fill: red, weight: "bold")[×] No], [No hay Planck/ACT/SPT], [Nada], [#text(fill: red, weight: "bold")[×]
    No],
  )]
  , kind: table
  )

== F2. Dolores operativos: ¿qué dato los alivia?
#figure(
  align(center)[#table(
    columns: 5,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,),
    table.header([Dolor], [Dato/API disponible], [Prototipo 48
      h], [Factibilidad], [Veredicto],),
    table.hline(),
    [#strong[B1. Volumen de datos]], [SIA2 + AWS + Cutout], [Descargador
    inteligente con caché y reanudación], [Alta], [#text(fill: green, weight: "bold")[✓]],
    [#strong[B2. Formatos]], [FITS/VOTable/CSV de
    IRSA], [Conversor/validador con vista previa y
    unidades], [Alta], [#text(fill: green, weight: "bold")[✓]],
    [#strong[B3. Acceso/cuotas]], [IRSA y Exoplanet Archive sin
    auth], [Buscador unificado con enlaces directos], [Media], [#text(fill: green, weight: "bold")[✓]],
    [#strong[B4. Cross-matching]], [IRSA TAP + Exoplanet TAP +
    SIMBAD/NED], [Ficha única de objeto], [Alta], [#text(fill: green, weight: "bold")[✓] #strong[Top
    custom]],
    [#strong[B5. Triage de alertas]], [SIA2/Cutout (series SPHEREx) +
    MOST], [Ranking de candidatos con explicación], [Media], [#text(fill: orange, weight: "bold")[!] Sin
    Rubin],
    [#strong[B6. Visualización]], [HiPS + Cutout], [Blink + slider 102
    bandas + diferencia], [Alta], [#text(fill: green, weight: "bold")[✓] #strong[Core]],
    [#strong[B7. Reproducibilidad]], [SIA2/TAP + manifest], [“Receta”
    que corre y registra versiones], [Alta], [#text(fill: green, weight: "bold")[✓]],
    [#strong[B8. IA/ML]], [Cutouts/catálogos SPHEREx], [Clasificador con
    incertidumbre], [Media], [#text(fill: orange, weight: "bold")[!] Faltan etiquetas],
    [#strong[B9. Software legado]], [No hay
    dato], [Wrapper/documentación], [Baja], [#text(fill: red, weight: "bold")[×]],
    [#strong[B10. Planificación de observaciones]], [No hay datos de
    scheduling], [Nada], [Baja], [#text(fill: red, weight: "bold")[×]],
    [#strong[B11. Metadata/descubrimiento]], [IRSA TAP + Exoplanet
    TAP], [Buscador semántico sobre metadata], [Media], [#text(fill: green, weight: "bold")[✓]],
    [#strong[B12. Ciencia ciudadana]], [Cutouts + HiPS], [Onboarding
    guiado + validación], [Alta], [#text(fill: green, weight: "bold")[✓] #strong[Top]],
    [#strong[B13. Comunicación]], [NASA Images + APOD +
    HiPS], [Storytelling visual/sonificación], [Alta], [#text(fill: green, weight: "bold")[✓]],
    [#strong[B14. Crédito/colaboración]], [No hay
    dato], [Nada], [Baja], [#text(fill: red, weight: "bold")[×]],
    [#strong[B15. Financiamiento]], [No hay dato], [Nada], [Baja], [#text(fill: red, weight: "bold")[×]],
  )]
  , kind: table
  )

== F3. Flujo de selección data-first
```text
[1] Mirar el inventario (0.1)
        ↓
[2] Elegir UN dataset que ya funciona
        ↓
[3] Preguntar: ¿qué problema permite responder?
        ↓
[4] Definir el demo de 30 s con ese dato
        ↓
[5] Definir el fallback si la API falla
        ↓
[6] Completar el contrato de datos (0.4)
        ↓
[7] Recién ahí: codear
```

== F4. Custom ideas con dato exacto
#figure(
  align(center)[#table(
    columns: 5,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,),
    table.header([Idea], [Dato/API exacta], [Qué se
      muestra], [Factibilidad], [¿Vale la pena?],),
    table.hline(),
    [#strong[Ficha única de objeto]], [IRSA TAP
    (`spherex.plane/artifact`) + Exoplanet TAP (`ps`) +
    SIMBAD/NED], [Nombre → coordenadas → imágenes → catálogo →
    timeline], [Alta], [#text(fill: green, weight: "bold")[✓] #strong[Sí]],
    [#strong[Timeline multi-misión]], [SIA2 con colecciones IRSA
    (SPHEREx, WISE, 2MASS) + Cutout], [Misma posición en varias
    misiones], [Alta], [#text(fill: green, weight: "bold")[✓] #strong[Sí]],
    [#strong[Copiloto de archivos]], [IRSA TAP + Exoplanet TAP
    (plantillas de consulta)], [Lenguaje natural → query →
    tabla/notebook], [Alta], [#text(fill: green, weight: "bold")[✓] Sí],
    [#strong[Triage de candidatos SPHEREx]], [SIA2 + Cutout +
    MOST], [Ranking de objetos que cambian], [Media], [#text(fill: orange, weight: "bold")[!] Sin Rubin],
    [#strong[Sonificación]], [HiPS (102 capas) + NASA Images], [Datos →
    sonido], [Alta], [#text(fill: green, weight: "bold")[✓] Sí],
    [#strong[Traductor de formatos]], [FITS/VOTable/CSV de
    IRSA], [Subir/pegar URL → vista previa], [Alta], [#text(fill: green, weight: "bold")[✓] Sí],
  )]
  , kind: table
  )

== F5. Ejemplo de contrato de datos (para el feature “blink”)
```text
Feature: Blink comparator
Dataset: SPHEREx DR1 Level 2
API/endpoint: SIA2 + Cutout Service
Campos: obs_id, t_min, energy_bandpassname, access_url, IMAGE, FLAGS
Acceso: público, sin auth
Caché: data/cache/<slug>/ + manifest.json
Fallback: CSV de SIA2 + FITS cacheados
Qué puedo afirmar: “mostramos cómo cambia un parche entre épocas”
Qué NO puedo afirmar: “descubrimos un objeto nuevo”
```

== F6. Problemas específicos de los datos SPHEREx (y cómo los atacamos)
#figure(
  align(center)[#table(
    columns: (1.0fr, 1.8fr, 1.6fr, 1.8fr, 1.8fr, 1.8fr),
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,auto,),
    table.header([\#], [Problema del dato], [Por qué
      duele], [Dato/API], [Solución en el prototipo], [Estado],),
    table.hline(),
    [1], [#strong[La imagen es espectral, no broadband]], [Una fuente
    aparece dispersada; no es una foto simple], [`IMAGE` +
    `WCS-WAVE`], [Mostrar el cutout tal cual + “colapsar” bandas; slider
    HiPS], [#text(fill: green, weight: "bold")[✓] MVP],
    [2], [#strong[Rotación/traslación entre exposiciones]], [No se puede
    restar/blinkear sin alinear], [WCS del `IMAGE` +
    `reproject`], [Reproyectar a grilla norte-arriba], [#text(fill: green, weight: "bold")[✓] Validado],
    [3], [#strong[ePSF de \~4 MB por cutout]], [Descargas lentas y
    pesadas], [`EPSF`], [Ignorarlo; cachear; bajar pocas épocas], [#text(fill: green, weight: "bold")[✓]
    Mitigado],
    [4], [#strong[Objetos débiles (WISE 0855)]], [No se ven en una
    exposición], [`IMAGE` + stacking], [Mediana de N épocas], [#text(fill: orange, weight: "bold")[●]
    Pendiente],
    [5], [#strong[Movimiento sub-píxel]], [Barnard se mueve \~1.3 px en
    9 meses], [`IMAGE` + centroides], [Diferencia + ajuste de centroide
    \+ trayectoria], [#text(fill: orange, weight: "bold")[●] Pendiente],
    [6], [#strong[102 bandas difíciles de explorar]], [El usuario no
    sabe qué mirar], [HiPS (102 PNG)], [Slider espectral + longitud de
    onda], [#text(fill: green, weight: "bold")[✓] Validado],
    [7], [#strong[Metadata/cobertura variable]], [No todas las
    posiciones tienen todas las bandas], [SIA2 + TAP], [`manifest.json`
    con detector/fecha/banda], [#text(fill: green, weight: "bold")[✓] Validado],
    [8], [#strong[Flags de contaminación]], [Rayos cósmicos/satélites
    arruinan la diferencia], [`FLAGS`], [Overlay de flags +
    máscara], [#text(fill: orange, weight: "bold")[●] Pendiente],
    [9], [#strong[Cambian los data releases]], [DR1/QR3, versiones y
    fechas], [SIA2 `COLLECTION` + config], [Configurar colecciones y
    cachear por release], [#text(fill: green, weight: "bold")[✓] Diseñado],
    [10], [#strong[No hay catálogo de objetos en movimiento]], [Hay que
    detectarlos], [MOST + diferencia], [Lista de candidatos con
    score], [#text(fill: orange, weight: "bold")[●] Pendiente],
    [11], [#strong[IRSA a veces falla (502)]], [El demo en vivo se
    rompe], [CSV/S3/caché], [Precomputar + fallback offline], [#text(fill: green, weight: "bold")[✓]
    Validado],
    [12], [#strong[Resolución de 6″/px]], [No se ve movimiento
    fino], [---], [Management de expectativas: “medimos”, no
    “vemos”], [#text(fill: green, weight: "bold")[✓] Documentado],
  )]
  , kind: table
  )

== F7. Del brief del challenge a nuestra arquitectura
#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Lo que pide el brief], [Problema del
      dato], [Feature], [Dato/API],),
    table.hline(),
    [Mostrar imágenes y cambios], [Rotación/tiempo], [Blink +
    diferencia], [SIA2 + Cutout],
    [102 bandas], [Exploración espectral], [Slider de capas], [HiPS],
    [Sumar/restar épocas], [Alineación], [Modo diferencia], [Cutout +
    `reproject`],
    [Elegir FOV], [Descarga], [Selector 0.05--0.2°], [Cutout `size`],
    [Overlay Gaia/WISE], [Datos externos], [Overlay WISE (si la
    colección IRSA responde)], [IRSA SIA2 (verificar)],
    [URL con coordenadas], [Compartir], [`?ra=&dec=`], [Frontend],
    [Metadata/flags], [Calidad], [Ficha + overlay], [`FLAGS`, SIA2],
    [Espectros on the fly], [`WCS-WAVE`], [Espectro quick-look], [Cutout
    \+ WCS-WAVE],
    [Actualizarse con nuevos releases], [Versiones], [Config de
    colecciones], [SIA2/TAP],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

= PARTE G --- Fuentes y lecturas
- #strong[Astro2020 Decadal Survey] --- prioridades de la astrofísica
  2020s:
  #link("https://www.nationalacademies.org/our-work/decadal-survey-on-astronomy-and-astrophysics-2020-astro2020")
- #strong[NASA Astrophysics] --- temas y misiones:
  #link("https://science.nasa.gov/astrophysics/")
- #strong[Rubin Observatory --- Key Numbers] (20 TB/noche, 7--10 M
  alertas/noche):
  #link("https://rubinobservatory.org/for-scientists/rubin-101/key-numbers")
- #strong[Rubin data deluge]:
  #link("https://rubinobservatory.org/news/rubin-data-deluge")
- #strong[SPHEREx]: #link("https://science.nasa.gov/mission/spherex/")
- #strong[SPHEREx Archive at IRSA]:
  #link("https://irsa.ipac.caltech.edu/spherex-archive-documentation/")
- #strong[NASA Exoplanet Archive]:
  #link("https://exoplanetarchive.ipac.caltech.edu/")
- #strong[IVOA standards] (SIA2, TAP, ObsCore):
  #link("https://ivoa.net/")
- #strong[NASA Earthdata]: #link("https://www.earthdata.nasa.gov/")
- #strong[NASA FIRMS]: #link("https://firms.modaps.eosdis.nasa.gov/")
- #strong[NASA Space Apps 2026 Challenges]:
  #link("https://www.spaceappschallenge.org/2026/challenges/")

#quote(block: true)[
#strong[Nota:] las cifras y estados de misión cambian. Verificar antes
de citar en la submission.
]