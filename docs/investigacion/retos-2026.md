# Los 14 retos oficiales 2026

> **Estado:** histórico · análisis del 14/11/2026 de los 14 retos.

> **Fuente:** [spaceappschallenge.org/2026/challenges](https://www.spaceappschallenge.org/2026/challenges/)
> Traducción y análisis del equipo **Astral Codes**. No es traducción oficial de NASA.
> **Revisión:** 14/11/2026. Dificultad según NASA; el resto es lectura nuestra.

---

## 0. Estado de la decisión

> **Decisión abierta.** El equipo reabrió la elección del reto el 14/11/2026.
> Este documento no asume ningún reto ganador: sirve para comparar, discutir y votar.

**Cómo usar este documento**

1. Leer la **comparación rápida** (§1) para descartar lo que no va.
2. Mirar la **matriz de decisión** (§2): 4 criterios, 20 puntos.
3. Leer solo las **fichas** (§4) de los 5 o 6 retos que queden.
4. Votar con la **rúbrica de 20 minutos** (§5) y registrar la decisión (§6).

**Regla que no se negocia:** si no hay dato NASA accesible, el reto no se elige por lindo
que sea el demo. Sin dato, no hay problema.

> ¿La idea es alerta temprana de desastres? Antes de votar, leer
> [`22-investigacion-desastres.md`](desastres.md): qué datos existen, qué
> latencia tienen y en qué reto oficial encaja.

---

## 1. Comparación rápida

| # | Reto | Dificultad | En una frase | Dato central | Riesgo |
|---|---|---|---|---|---|
| 1 | Abandoned but not Forgotten | Intermediate | Museo interactivo del hardware que NASA dejó en la Luna y Marte | Imágenes y modelos 3D abiertos | Bajo: mucho contenido, poca ciencia |
| 2 | Earth System Trend Detective | Advanced | Detective de tendencias climáticas con significancia estadística | Earthdata (con cuenta) | Medio: datos grandes y autenticación |
| 3 | Junior Astronaut Mission Trainer | Intermediate | Juego donde estudiantes gestionan un puesto lunar | Conceptos ECLSS/HRP | Bajo: la ciencia está en las reglas |
| 4 | Health Monitoring for Astronauts | Intermediate | Panel de salud para tripulaciones de misión larga | HRP, análogos HERA | Alto: no hay datos reales públicos |
| 5 | Dancing with the SARs | Advanced | Mapa de cambios de superficie con radar NISAR | ASF / NISAR (cuenta) | Alto: volumen y procesamiento InSAR |
| 6 | Field Shift: Adapting Farms | Advanced | Recomendador de rotaciones de cultivo con datos NASA | SMAP, MODIS, POWER | Medio: validación agronómica |
| 7 | Flame in Freefall (SI) | Advanced | Dashboard con IA sobre combustión en microgravedad | NTRS, experimentos NASA | Medio: corpus y alucinaciones |
| 8 | MODIS + VIIRS Hot Spots | Advanced | Calendario armonizado de 20 años de incendios | FIRMS (clave gratis) | Medio: la armonización debe defenderse |
| 9 | Earth Analogs for Moon/Mars | Advanced | Ranking de lugares terrestres que imitan la Luna o Marte | Earthdata, USGS, MOLA | Medio: criterios arbitrarios sin experto |
| 10 | Interplanetary Survival Guide | Intermediate | Mapa multicapa de una ruta en Marte | USGS, PDS, HiRISE | Bajo/medio: mapa lindo sin historia |
| 11 | Lunar Landing Site Navigator | Advanced | Comparador Sol/Tierra por sitio y fecha en el polo sur lunar | SPICE, LOLA/LRO | Alto: geometría y validación |
| 12 | Planet X and SPHEREx | Advanced | Comparador de imágenes del cielo en 102 bandas | IRSA / SPHEREx | Alto: API intermitente (502 el 14/11) |
| 13 | Space Mission Design Game | Intermediate | Juego de diseño de misión con presupuesto y trade-offs | Datos públicos de misiones | Bajo: diversión y balance |
| 14 | Earth Information Jukebox | Intermediate | Sonificación de visualizaciones del Earth Information Center | EIC frames, Earthdata | Bajo/medio: mapping arbitrario |

---

## 2. Matriz de decisión

Escala 1–5 por criterio. **Total /20.** Es una lectura interna para ordenar la discusión,
no una medición: el equipo puede cambiar cualquier puntaje y el orden.

| # | Reto | Datos | Demo | 48 h | Diferenciación | Total |
|---|---|---|---|---|---|---|
| 1 | Abandoned but not Forgotten | 5 | 4 | 4 | 3 | **16** |
| 2 | Earth System Trend Detective | 4 | 3 | 3 | 3 | **13** |
| 3 | Junior Astronaut Mission Trainer | 5 | 3 | 5 | 4 | **17** |
| 4 | Health Monitoring | 2 | 3 | 4 | 4 | **13** |
| 5 | Dancing with the SARs | 2 | 5 | 2 | 4 | **13** |
| 6 | Field Shift: Farms | 3 | 3 | 3 | 3 | **12** |
| 7 | Flame in Freefall | 4 | 3 | 3 | 4 | **14** |
| 8 | MODIS + VIIRS Hot Spots | 4 | 4 | 3 | 3 | **14** |
| 9 | Earth Analogs | 3 | 4 | 2 | 3 | **12** |
| 10 | Martian Map | 4 | 5 | 4 | 4 | **17** |
| 11 | Lunar Landing Site Navigator | 4 | 4 | 2 | 5 | **15** |
| 12 | Planet X and SPHEREx | 2 | 5 | 2 | 5 | **14** |
| 13 | Space Mission Design Game | 5 | 3 | 5 | 4 | **17** |
| 14 | Earth Information Jukebox | 4 | 5 | 4 | 5 | **18** |

**Qué mide cada columna**

- **Datos:** ¿se consigue el dato sin fricción y alcanza para el demo?
- **Demo:** ¿se entiende y sorprende en 10 segundos de video?
- **48 h:** ¿un equipo de 5 puede tener algo jugable/usable el domingo?
- **Diferenciación:** ¿hay espacio para una idea propia o se compara con la herramienta oficial?

---

## 3. Shortlist

### A. Listos para construir (datos abiertos + demo claro)
**#14 Jukebox · #3 Junior Astronaut · #10 Martian Map · #13 Mission Design Game · #1 Abandoned**

Son los que permiten empezar hoy sin depender de una API que falle. Los tres juegos
(#3, #13, #14) además se explican en una frase, que es lo que el jurado recuerda.

### B. Viables con fricción conocida
**#2 Trend Detective · #6 Farms · #7 Flame · #8 Hot Spots · #9 Earth Analogs**

Necesitan cuenta gratis (Earthdata/FIRMS) o un corpus curado. Se pueden hacer, pero
consumen horas de la primera mitad del hackatón en plomería, no en producto.

### C. Alto riesgo técnico
**#5 SAR · #11 Lunar Navigator · #12 SPHEREx**

El demo depende de descargas pesadas, geometría orbital o una API que ya falló.
Solo elegirlos si hay alguien del equipo que ya trabajó con ese dato.

---

## 4. Fichas

### 1. Abandoned but not Forgotten
**Qué pide:** contar la historia del hardware que NASA dejó en la Luna, Marte y el espacio
profundo, para que estudiantes entiendan qué hizo posible la ciencia.

**MVP 48 h:** mapa 3D de la Luna/Marte con pins; ficha con foto, misión, estado actual
y una historia de 100 palabras; modo docente con preguntas.

**Datos:** NASA Image and Video Library, NASA 3D Resources, archivos de misión, NSSDC.

**Demo que convence:** click en un pin → el objeto “cuenta” su historia con una foto real.

**Riesgo:** mucho contenido y poca ciencia; sin un diseño excelente se ve como una
presentación con mapa.

**Por qué sí:** datos abiertos, historia emocional, encaja con *Best Storytelling*.
**Por qué no:** el jurado puede verlo como museo, no como herramienta.

---

### 2. Be An Earth System Trend Detective!
**Qué pide:** elegir variables de misiones/modelos NASA, ver cómo cambian en el tiempo y
decidir si el cambio es estadísticamente significativo.

**MVP 48 h:** 3 variables, 1 región; mapa de tendencia + serie temporal + tarjeta
“significativo / no significativo” + explicación en lenguaje simple.

**Datos:** NASA Earthdata (GES DISC, LP DAAC), Giovanni, POWER, MODIS, GRACE-FO.

**Demo que convence:** el mismo lugar sube en una variable y baja en otra; el veredicto
estadístico cambia la conclusión.

**Riesgo:** autenticación Earthdata, datos grandes y limpieza; sin cuidado es “otro dashboard”.

**Por qué sí:** ciencia real y *Best Use of Science*.
**Por qué no:** la significancia es difícil de explicar en 30 s sin simplificar de más.

---

### 3. Build a Junior Astronaut Mission Trainer
**Qué pide:** un juego o app donde estudiantes gestionan un puesto lunar o marciano,
equilibrando soporte vital, radiación, energía y alimentos.

**MVP 48 h:** 10 turnos, 5 recursos, 8 eventos (tormenta solar, fuga de O₂, falla de cultivo),
3 finales; una partida completa en menos de 5 minutos.

**Datos:** NASA Life Support Baseline Values, radiación (LRO/CRaTER), energía solar,
invernaderos; el contenido se escribe desde fuentes públicas.

**Demo que convence:** una decisión → un recurso cae → el juego explica por qué y cita NASA.

**Riesgo:** que sea un juego genérico de gestión; la ciencia tiene que estar en los números
y en el feedback, no en el título.

**Por qué sí:** el más jugable en 48 h; el feedback puede ser el diferencial.
**Por qué no:** es el reto más “obvio” y ya existe la trivia como intento previo.

---

### 4. Create Health Monitoring Software for Astronauts
**Qué pide:** software que recolecte indicadores de salud (sueño, hueso, cardiovascular,
radiación, salud mental) y ayude al astronauta a evaluar y actuar.

**MVP 48 h:** simulación de 30 días, 5 indicadores, semáforo de riesgo, una alerta y una
recomendación concreta.

**Datos:** estudios análogos de NASA (HERA, bed rest), literatura y datos sintéticos
**etiquetados como sintéticos**.

**Demo que convence:** un indicador se pone en rojo y el sistema propone tres acciones.

**Riesgo:** no hay datos reales de astronautas públicos; sin honestidad, se vuelve ficción.

**Por qué sí:** problema humano y *Galactic Impact*.
**Por qué no:** un dashboard de salud sin datos reales compite contra apps comerciales.

---

### 5. Dancing with the SARs
**Qué pide:** app interactiva con radar de NISAR para rastrear cambios de superficie
(humedales, incendios, terremotos, glaciares).

**MVP 48 h:** 2 fechas, slider antes/después, explicación de qué es un SAR y por qué ve
a través de nubes.

**Datos:** ASF DAAC (NISAR, Sentinel-1), Earthdata Login.

**Demo que convence:** el antes/después de un glaciar o una ciudad que se hunde.

**Riesgo:** acceso, tamaños enormes y procesamiento InSAR; el demo puede quedar en imágenes
preprocesadas.

**Por qué sí:** el demo visual más fuerte de los 14.
**Por qué no:** si la descarga falla en vivo, no hay plan B creíble.

---

### 6. Field Shift: Adapting Farms with NASA Data
**Qué pide:** herramienta que combine observaciones NASA, suelo local, cultivo y prioridades
del agricultor para explorar rotaciones más resilientes.

**MVP 48 h:** formulario (ubicación, suelo, agua, objetivo) → 3 rotaciones con pros/contras,
huella hídrica y resiliencia climática.

**Datos:** SMAP, MODIS, POWER, SoilGrids, datos locales.

**Demo que convence:** dos rotaciones, la misma finca, distinta agua y distinto riesgo.

**Riesgo:** integrar muchas fuentes y validar agronomía; sin agrónomo, las recomendaciones
son superficiales.

**Por qué sí:** impacto local claro y *Best Use of Data*.
**Por qué no:** el jurado puede preguntar “¿esto lo validó un agrónomo?”.

---

### 7. Flame in Freefall (SI)
**Qué pide:** dashboard con IA que resuma, ordene e interprete décadas de investigación NASA
sobre fuego en microgravedad, para seguridad contra incendios.

**MVP 48 h:** 20 documentos, buscador semántico, 5 preguntas de ejemplo, respuestas con cita.

**Datos:** NASA combustión (BASS, FLEX, Saffire), NTRS, papers.

**Demo que convence:** preguntar “¿cómo se apaga una llama esférica?” y recibir una respuesta
con la cita del experimento.

**Riesgo:** calidad del corpus y alucinaciones; cada respuesta debe citar.

**Por qué sí:** hay mucho material y nadie lo tiene ordenado.
**Por qué no:** un RAG es fácil de demo, difícil de sorprender.

---

### 8. Harmonization of MODIS and VIIRS Hot Spots
**Qué pide:** armonizar más de 20 años de detecciones de incendios de sensores distintos
en un calendario de actividad de quema.

**MVP 48 h:** una región, 20 años, calendario tipo heatmap + mapa + comparación de sensores.

**Datos:** NASA FIRMS API (MODIS C6.1, VIIRS 375 m/750 m), shapefiles, límites administrativos.

**Demo que convence:** el mismo mes, dos sensores, y la diferencia explicada.

**Riesgo:** la armonización seria necesita un método defendible; sin eso es un mapa bonito.

**Por qué sí:** problema real de datos y *Best Use of Data*.
**Por qué no:** explicar la corrección entre sensores en 30 s es cuesta arriba.

---

### 9. Earth Analogs for Moon/Mars Bases
**Qué pide:** identificar y caracterizar lugares de la Tierra análogos a bases lunares o
marcianas, con datos abiertos.

**MVP 48 h:** 10 sitios candidatos, 6 criterios (pendiente, temperatura, radiación,
mineralogía, acceso, agua), mapa + ranking + ficha comparativa.

**Datos:** Earthdata, USGS, MOLA, CTX, HiRISE, OpenStreetMap.

**Demo que convence:** un sitio terrestre y su equivalente lunar lado a lado.

**Riesgo:** sin experto, el ranking parece arbitrario.

**Por qué sí:** conecta Tierra y espacio, *Best Use of Science*.
**Por qué no:** el peso de los criterios es la parte difícil y no se ve en el demo.

---

### 10. Interplanetary Survival Guide: Martian Map
**Qué pide:** vista multicapa de un lugar o ruta en Marte con datos de varias misiones
NASA: rutas, destinos, condiciones y recursos.

**MVP 48 h:** una ruta de 5 km, 5 capas, perfil de elevación, 5 paradas con datos.

**Datos:** USGS Mars, Mars Trek, PDS, HiRISE, MOLA, CRISM.

**Demo que convence:** recorrer la ruta y ver cómo cambian radiación, polvo y pendiente.

**Riesgo:** mapa lindo sin historia; cada capa necesita un “por qué”.

**Por qué sí:** visual, datos abiertos y *Best Mission Concept*.
**Por qué no:** hay visores oficiales de Marte; hay que aportar una lectura propia.

---

### 11. Lunar Landing Site Navigator
**Qué pide:** comparar sitios y fechas del polo sur lunar visualizando Sol y Tierra respecto
del horizonte, para evaluar energía y ventanas de comunicación.

**MVP 48 h:** 3 sitios, 30 días, horizonte local + gráfico Sol/Tierra + semáforo de
energía y comms.

**Datos:** SPICE (NAIF), LOLA/LRO, efemérides.

**Demo que convence:** el mismo sitio cambia de viable a inviable según la fecha.

**Riesgo:** geometría SPICE y terreno; hay que validar con un caso conocido.

**Por qué sí:** decisión de misión real y muy visual.
**Por qué no:** un error de geometría invalida todo el producto.

---

### 12. Planet X and SPHEREx
**Qué pide:** herramienta web pública para ver imágenes del cielo de SPHEREx (102 bandas)
y detectar cambios entre épocas.

**MVP 48 h:** coordenada → 20–40 épocas → blink + diferencia + slider + ficha.

**Datos:** IRSA SIA2, cutouts, TAP, HiPS, AWS.

**Demo que convence:** parpadeo entre dos épocas y un objeto que se mueve.

**Riesgo:** TAP intermitente (502 el 14/11), cutouts pesados, movimiento sub-píxel.

**Por qué sí:** el dato más “NASA” y el demo más hipnótico.
**Por qué no:** sin caché propia, el demo depende de una API que ya falló.

---

### 13. Space Mission Design Game
**Qué pide:** juego para diseñar una misión completa equilibrando objetivos, nave,
instrumentos, cohete, presupuesto, energía, masa, comunicaciones y órbita.

**MVP 48 h:** 3 objetivos, 4 cohetes, 6 instrumentos, 5 eventos; una misión completa.

**Datos:** NASA Launch Services, datos públicos de misiones, modelos simplificados.

**Demo que convence:** dos diseños, el mismo presupuesto, y uno falla por una decisión
que el jugador tomó.

**Riesgo:** que sea un juego de números sin diversión; el feedback es todo.

**Por qué sí:** trade-offs reales y muy alineado con el reto.
**Por qué no:** el balance de juego es difícil de clavar en 48 h.

---

### 14. The Earth Information Jukebox
**Qué pide:** traducir la ciencia de la Tierra a sonido: combinar frames del Earth
Information Center con sonificación dinámica en tiempo real.

**MVP 48 h:** 3 escenas, 3 sonificaciones, controles accesibles y la explicación del mapping.

**Datos:** EIC frames/videos, NASA Earthdata; Web Audio para el sonido.

**Demo que convence:** el mismo fenómeno suena distinto al cambiar de variable.

**Riesgo:** que el sonido sea arbitrario; el mapping tiene que ser intuitivo y documentado.

**Por qué sí:** es el reto con más espacio para algo que el jurado no haya visto.
**Por qué no:** el audio no se puede “mostrar” en una captura; exige video bien grabado.

---

## 5. Cómo decidir en 20 minutos

**Ronda 1 — descartar (5 min).**
Cada persona marca los retos cuyo dato no podría conseguir hoy. Se van los que tengan
3 o más marcas.

**Ronda 2 — votar (10 min).**
Cada persona elige **3 retos** y los ordena. Puntaje: 3, 2, 1.

**Ronda 3 — prueba de la frase (5 min).**
Para el top 3, completar en voz alta:

> “Es una app que ______ para ______, usando ______ de NASA.”

Si no sale en una frase, el reto no está listo para el pitch.

**Desempate, en este orden:**
1. ¿Tenemos el dato hoy? (gana el que no necesita cuenta ni descarga grande)
2. ¿Se puede jugar/usar el domingo a las 12:00?
3. ¿Alguien del equipo ya trabajó con ese tipo de dato?
4. ¿El demo se entiende sin audio ni explicación?

---

## 6. Registro de la decisión

Completar cuando el equipo vote.

| Campo | Valor |
|---|---|
| Fecha de la votación | |
| Reto elegido | |
| Votos (3-2-1) | |
| Por qué | |
| Plan B (si falla el dato) | |
| Responsable de datos | |
| Responsable de demo | |

---

## 7. Links oficiales

| # | Challenge | URL |
|---|---|---|
| 1 | Abandoned but not Forgotten | https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/ |
| 2 | Be An Earth System Trend Detective! | https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/ |
| 3 | Build a Junior Astronaut Mission Trainer | https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/ |
| 4 | Create Health Monitoring Software for Astronauts | https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/ |
| 5 | Dancing with the SARs | https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/ |
| 6 | Field Shift: Adapting Farms with NASA Data | https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/ |
| 7 | Flame in Freefall | https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ |
| 8 | Harmonization of MODIS and VIIRS Hot Spots | https://www.spaceappschallenge.org/2026/challenges/modis-and-viirs-hot-spots/ |
| 9 | Earth Analogs for Moon/Mars Bases | https://www.spaceappschallenge.org/2026/challenges/permanent-moon-base-locations-and-mars/ |
| 10 | Interplanetary Survival Guide: Martian Map | https://www.spaceappschallenge.org/2026/challenges/interplanetary-survival-guide-martian-map/ |
| 11 | Lunar Landing Site Navigator | https://www.spaceappschallenge.org/2026/challenges/lunar-landing-site-navigator/ |
| 12 | Planet X and SPHEREx | https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/ |
| 13 | Space Mission Design Game | https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/ |
| 14 | The Earth Information Jukebox | https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/ |

---

## 8. Nota sobre “Create Your Own Challenge”

Históricamente NASA ofrece una categoría “Create Your Own Challenge”, pero **no es elegible
para Global Judging** ni para Global Awards. En 2026 la lista oficial tiene 14 retos y no
aparece. Si el equipo quiere hacer algo distinto, la estrategia es **encajarlo dentro de un
reto oficial** de la lista de este documento.
