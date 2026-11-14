# 02 — Los 14 challenges oficiales 2026 (traducidos y explicados)

> Fuente: [spaceappschallenge.org/2026/challenges](https://www.spaceappschallenge.org/2026/challenges/)
> Traducción y análisis del equipo Astral Codes. **No es traducción oficial de NASA.**
> Dificultad según NASA. La columna “Enfoque” es nuestra propuesta, no la única.

---

## Estado de esta documentación

| Nivel | Qué incluye | Cobertura |
|---|---|---|
| **1. Resumen traducido** | Nombre, dificultad, qué pide | **14/14** |
| **2. Análisis de proyecto** | Enfoque, datos, prototipo 48 h, riesgo, premio | **14/14** |
| **3. Brief completo + recursos** | Texto oficial completo, Resources tab, APIs verificadas | **1/14** (SPHEREx) |
| **4. Prototipo validado** | PoC con datos reales, pipeline, limitaciones | **1/14** (SPHEREx) |

**Lectura:** los 14 están listos para *comparar y decidir*. Solo SPHEREx está listo para *construir hoy*. Si el equipo cambia de challenge, hay que subir ese challenge a nivel 3 (leer el brief completo y probar sus APIs) antes de codear.

**Pendiente:** voto del equipo, links oficiales por challenge (abajo), y recursos específicos del challenge elegido.

---

## Resumen en una tabla

| # | Challenge | Dificultad | Tema | Enfoque posible |
|---|---|---|---|---|
| 1 | Abandoned but not Forgotten | Intermediate | Storytelling Luna/Marte | Museo interactivo 3D + historias |
| 2 | Be An Earth System Trend Detective! | Advanced | Tendencias climáticas | Dashboard de tendencias + significancia |
| 3 | Build a Junior Astronaut Mission Trainer | Intermediate | Juego educativo | Simulador de outpost con recursos |
| 4 | Create Health Monitoring Software for Astronauts | Intermediate | Salud humana | Dashboard de salud + alertas |
| 5 | Dancing with the SARs | Advanced | Radar NISAR | Mapa de cambios de superficie |
| 6 | Field Shift: Adapting Farms with NASA Data | Advanced | Agricultura | Recomendador de rotaciones |
| 7 | Flame in Freefall | Advanced | Combustión en microgravedad | Dashboard con IA + literatura |
| 8 | Harmonization of MODIS and VIIRS Hot Spots | Advanced | Incendios | Calendario de fuego armonizado |
| 9 | Earth Analogs for Moon/Mars Bases | Advanced | Análogos terrestres | Mapa multicriterio |
| 10 | Interplanetary Survival Guide: Martian Map | Intermediate | Marte | Mapa multicapa para Marswalk |
| 11 | Lunar Landing Site Navigator | Advanced/Intermediate | Luna | Comparador Sol/Tierra por sitio |
| 12 | Planet X and SPHEREx | Advanced | Astrofísica | Blink comparator + 102 bandas |
| 13 | Space Mission Design Game | Intermediate | Juego | Simulador de misión |
| 14 | The Earth Information Jukebox | Intermediate | Sonificación | Traducir visual a audio |

---

## Links oficiales

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
| 12 | **Planet X and SPHEREx** | https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/ |
| 13 | Space Mission Design Game | https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/ |
| 14 | The Earth Information Jukebox | https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/ |

---

## 1. Abandoned but not Forgotten
**Traducción:** “Abandonados pero no olvidados: contar la historia del equipo descartado por NASA en la Luna y Marte”.
**Dificultad:** Intermediate.
**Qué pide:** desde los 1960, NASA dejó hardware en la Luna, Marte y el espacio profundo (rovers, instrumentos, sondas). Contar la historia de ese equipo para estudiantes, explicando qué hizo la ciencia posible.
**Enfoque:** museo interactivo con línea de tiempo, mapa 3D, fichas de hardware, “¿dónde está ahora?” y relatos cortos. Se puede usar Three.js + imágenes NASA + modelos 3D de la NASA 3D Resources.
**Datos:** NASA Image and Video Library, NASA 3D Resources, archivos de misiones, NSSDC.
**Prototipo 48 h:** mapa 3D de la Luna/Marte con pins; al hacer clic, ficha con foto, misión, estado y una historia de 100 palabras; modo “docente” con preguntas.
**Riesgo:** mucho contenido, poca ciencia; si el diseño no es excelente, se ve como una presentación.
**Premio al que apunta:** Best Storytelling, Art & Technology.

---

## 2. Be An Earth System Trend Detective!
**Traducción:** “Sé un detective de tendencias del sistema Tierra”.
**Dificultad:** Advanced.
**Qué pide:** el sistema Tierra cambia constantemente; una variable puede subir en una región y bajar en otra. Crear una herramienta que seleccione variables de misiones/modelos NASA, visualice su cambio en el tiempo y determine qué cambia, dónde, cuánto y si es estadísticamente significativo.
**Enfoque:** dashboard con catálogo de variables (temperatura, hielo, vegetación, precipitación, CO₂), series temporales por región, mapas de tendencia y test de Mann-Kendall/Theil-Sen. Explicar “significancia” en lenguaje simple.
**Datos:** NASA Earthdata (GES DISC, LP DAAC), Giovanni, POWER, MODIS, GRACE-FO.
**Prototipo 48 h:** elegir 3 variables, 1 región; mapa de tendencia + serie temporal + tarjeta “significativo / no significativo” + explicación.
**Riesgo:** autenticación Earthdata, datos grandes, limpieza; el demo puede quedar en “otro dashboard”.
**Premio:** Best Use of Science, Best Use of Data.

---

## 3. Build a Junior Astronaut Mission Trainer
**Traducción:** “Construí un entrenador de misión para astronautas junior”.
**Dificultad:** Intermediate / Beginner-Youth.
**Qué pide:** un juego o app que permita a estudiantes gestionar un outpost lunar o marciano, equilibrando soporte vital, blindaje contra radiación, energía y producción de alimentos, para que vivan los trade-offs de una misión real.
**Enfoque:** juego de recursos por turnos con eventos aleatorios (tormenta solar, falla de cultivo, fuga de oxígeno), medidores de masa/energía/agua/comida/moral y final abierto. Datos NASA para dar realismo a los valores.
**Datos:** NASA Life Support Baseline Values, radiación (LRO/CRaTER), energía solar, datos de invernaderos.
**Prototipo 48 h:** 10 turnos, 5 recursos, 8 eventos, 3 finales; una partida completa en <5 min.
**Riesgo:** que sea un juego genérico de gestión; la ciencia tiene que estar en los números y en las explicaciones.
**Premio:** Best Use of Technology, Most Inspirational, Games.

---

## 4. Create Health Monitoring Software for Astronauts
**Traducción:** “Creá software de monitoreo de salud para astronautas”.
**Dificultad:** Intermediate.
**Qué pide:** en misiones largas, la radiación, el aislamiento, la gravedad alterada y el ambiente cerrado afectan la salud (inmunidad, hueso, cardiovascular, salud mental). Construir software que recolecte indicadores y permita al astronauta evaluar y actuar.
**Enfoque:** dashboard con datos de wearables (sueño, HRV, actividad, radiación acumulada, densidad ósea), puntaje de riesgo, alertas y recomendaciones. Modo “médico en Tierra” y modo “tripulación”.
**Datos:** datos análogos de estudios NASA (HERA, bed rest), literatura, datos sintéticos claramente etiquetados.
**Prototipo 48 h:** simulación de 30 días, 5 indicadores, semáforo de riesgo, una alerta y una recomendación.
**Riesgo:** no hay datos reales de astronautas públicos; hay que ser honesto con datos sintéticos.
**Premio:** Galactic Impact, Most Inspirational.

---

## 5. Dancing with the SARs
**Traducción:** “Bailando con los SAR”.
**Dificultad:** Advanced.
**Qué pide:** la superficie de la Tierra cambia (humedales, incendios, terremotos, agricultura, glaciares). Crear una app interactiva con datos de radar de NISAR para rastrear y visualizar uno o más tipos de cambio.
**Enfoque:** mapa con capas SAR, comparación antes/después, animación temporal, explicación de qué es un SAR y por qué ve a través de nubes.
**Datos:** ASF DAAC (NISAR, Sentinel-1), Earthdata Login.
**Prototipo 48 h:** un sitio con 2 fechas, un slider antes/después y una explicación del cambio.
**Riesgo:** acceso a NISAR, tamaños enormes, procesamiento InSAR; el demo puede quedar en imágenes preprocesadas.
**Premio:** Best Use of Data, Galactic Impact.

---

## 6. Field Shift: Adapting Farms with NASA Data
**Traducción:** “Cambio de campo: adaptar fincas con datos NASA”.
**Dificultad:** Advanced.
**Qué pide:** los agricultores enfrentan temperaturas cambiantes, lluvias irregulares, sequías, eventos extremos y pérdida de suelo. Crear una herramienta de apoyo que use observaciones NASA + suelo local + cultivos + prioridades del agricultor para explorar rotaciones.
**Enfoque:** asistente que recibe ubicación, tipo de suelo, agua disponible y objetivos; propone 3 rotaciones con pros/contras, huella hídrica y resiliencia climática.
**Datos:** SMAP, MODIS, POWER, SoilGrids, datos locales.
**Prototipo 48 h:** un formulario, 3 escenarios, un mapa y una comparación.
**Riesgo:** integración de muchas fuentes y validación agronómica; sin agrónomo, las recomendaciones pueden ser superficiales.
**Premio:** Galactic Impact, Local Impact.

---

## 7. Flame in Freefall (SI)
**Traducción:** “Llama en caída libre: ideas de seguridad contra incendios en microgravedad con IA”.
**Dificultad:** Advanced.
**Qué pide:** NASA estudió durante décadas cómo se comporta el fuego en microgravedad; hay mucho material difícil de encontrar, comparar y entender. Crear un dashboard interactivo con IA que resuma, ordene e interprete esos hallazgos para seguridad contra incendios en exploración humana.
**Enfoque:** RAG sobre papers/reportes de combustión NASA, tabla comparativa de experimentos, visualizaciones, “preguntá y respondé” con citas.
**Datos:** NASA combustión (BASS, FLEX, Saffire), NTRS, papers.
**Prototipo 48 h:** 20 documentos, buscador semántico, 5 preguntas de ejemplo, respuestas con fuente.
**Riesgo:** calidad del corpus y alucinaciones; hay que citar siempre.
**Premio:** Best Use of Science, Best Use of Technology.

---

## 8. Harmonization of MODIS and VIIRS Hot Spots
**Traducción:** “Armonización de puntos calientes MODIS y VIIRS”.
**Dificultad:** Advanced.
**Qué pide:** los satélites detectan incendios desde hace más de 20 años, pero el registro está partido entre sensores que no se pueden comparar directamente. Crear una app web que armonice los registros en un calendario de actividad de quema, para respuesta temprana, científicos y gestores.
**Enfoque:** descargar FIRMS, corregir diferencias de sensores/resolución, agregar por región y semana, calendario tipo heatmap, detección de anomalías.
**Datos:** NASA FIRMS API (MODIS C6.1, VIIRS 375 m/750 m), shapefiles, límites administrativos.
**Prototipo 48 h:** un país/región, 20 años, calendario + mapa + comparación de sensores.
**Riesgo:** la armonización seria requiere un método defendible; sin eso, es solo un mapa bonito.
**Premio:** Best Use of Data, Galactic Impact.

---

## 9. Earth Analogs for Moon/Mars Bases
**Traducción:** “Identificá lugares de la Tierra análogos a bases permanentes en la Luna y Marte”.
**Dificultad:** Advanced / Intermediate / Beginner.
**Qué pide:** elegir sitios de aterrizaje/base depende de topografía, geología, ambiente y recursos. Los análogos terrestres (Atacama, Haughton, Death Valley) permiten probar equipos, pero no están bien caracterizados. Usar datos abiertos de Tierra/Luna/Marte para identificar y caracterizar nuevos análogos.
**Enfoque:** GIS multicriterio: pendiente, temperatura, radiación, mineralogía, acceso, agua; ranking de sitios; ficha comparativa con el sitio lunar/marciano.
**Datos:** Earthdata, USGS, MOLA, CTX, HiRISE, OpenStreetMap.
**Prototipo 48 h:** 10 sitios candidatos, 6 criterios, mapa + ranking + ficha.
**Riesgo:** datos y criterios; sin un experto, el ranking puede ser arbitrario.
**Premio:** Best Use of Science, Galactic Impact.

---

## 10. Interplanetary Survival Guide: Martian Map
**Traducción:** “Guía de supervivencia interplanetaria: mapa marciano”.
**Dificultad:** Intermediate.
**Qué pide:** los primeros astronautas en Marte necesitarán el mejor mapa posible: rutas, destinos, condiciones actuales y datos para completar la misión. Crear una vista multicapa de un lugar o ruta en Marte que integre datos de varias misiones NASA.
**Enfoque:** mapa web con capas (MOLA, CTX, HiRISE, CRISM, temperatura, polvo, radiación), perfil de ruta, puntos de interés, “modo astronauta” y “modo científico”.
**Datos:** USGS Mars, Mars Trek, PDS, HiRISE, MOLA, CRISM.
**Prototipo 48 h:** una ruta de 5 km, 5 capas, perfil de elevación, 5 paradas con datos.
**Riesgo:** que sea un mapa lindo sin historia; hay que contar el “por qué” de cada capa.
**Premio:** Best Mission Concept, Best Use of Data, Most Inspirational.

---

## 11. Lunar Landing Site Navigator
**Traducción:** “Navegador de sitios de aterrizaje lunar”.
**Dificultad:** Advanced / Intermediate.
**Qué pide:** las misiones al polo sur lunar enfrentan luz y comunicación extremas; planificar requiere coordinar ciencia e ingeniería. Crear una herramienta intuitiva para comparar sitios y fechas, visualizando Sol y Tierra respecto del horizonte para evaluar energía y ventanas de comunicación.
**Enfoque:** globo/terreno lunar, selector de sitio y fecha, horizonte local, trayectoria del Sol/Tierra, gráfico de energía y comms, comparador de sitios.
**Datos:** SPICE (NAIF), LOLA/LRO, LRO, efemérides.
**Prototipo 48 h:** 3 sitios, 30 días, horizonte + gráfico Sol/Tierra + semáforo de energía/comms.
**Riesgo:** geometría SPICE y terreno; hay que validar con un caso conocido.
**Premio:** Best Mission Concept, Best Use of Science.

---

## 12. Planet X and SPHEREx
**Traducción:** “Planeta X y SPHEREx”.
**Dificultad:** Advanced.
**Qué pide:** desde 2025, SPHEREx mapea todo el cielo cada seis meses en 102 bandas de infrarrojo cercano, con más de mil millones de objetos. Cometas, asteroides, estrellas, enanas marrones y planetas se revelan al cambiar de posición entre imágenes. Crear una herramienta web pública para mostrar imágenes del cielo de SPHEREx y ver fácilmente cómo cambian en el tiempo.
**Enfoque:** comparador de parpadeo (blink), modo diferencia, slider de 102 bandas, ficha de objeto, espectro, trayectoria de centroides, URL compartible.
**Datos:** SIA2, cutouts, TAP, HiPS, AWS, Data Explorer.
**Prototipo 48 h:** coordenada → 20–40 épocas → blink + diferencia + slider + ficha.
**Riesgo:** TAP intermitente, cutouts pesados, movimiento sub-píxel, objetos débiles.
**Premio:** Best Use of Data, Best Use of Science, Galactic Impact, Most Inspirational.

---

## 13. Space Mission Design Game
**Traducción:** “Juego de diseño de misiones espaciales”.
**Dificultad:** Intermediate.
**Qué pide:** diseñar una misión espacial requiere equilibrar objetivos, nave, instrumentos, cohete, presupuesto, energía, masa, comunicaciones y órbita. Crear un juego interactivo para diseñar, gestionar y simular una misión completa, tomando decisiones y viendo cómo cada elección afecta el éxito.
**Enfoque:** constructor por etapas (objetivo → órbita → nave → instrumentos → presupuesto), simulación con eventos, puntaje y explicación de trade-offs.
**Datos:** NASA Launch Services, datos de misiones, modelos simplificados.
**Prototipo 48 h:** 3 objetivos, 4 cohetes, 6 instrumentos, 5 eventos, una misión completa.
**Riesgo:** que sea un juego de números sin diversión; el diseño y el feedback son clave.
**Premio:** Best Use of Technology, Most Inspirational, Games.

---

## 14. The Earth Information Jukebox
**Traducción:** “La rockola de información de la Tierra”.
**Dificultad:** Intermediate / Beginner.
**Qué pide:** el Earth Information Center (EIC) produce visualizaciones impresionantes, pero solo visuales. Traducir la ciencia de la Tierra a sonido: una interfaz, script o app que combine frames del EIC con sonificación dinámica en tiempo real.
**Enfoque:** mapear variables (temperatura, viento, CO₂, hielo) a parámetros sonoros (tono, ritmo, textura), con visualización sincronizada y controles accesibles.
**Datos:** EIC frames/videos, NASA Earthdata, sonificación en Web Audio.
**Prototipo 48 h:** 3 escenas, 3 sonificaciones, controles y explicación de la mappings.
**Riesgo:** que el sonido sea arbitrario; la mapping debe ser intuitiva y documentada.
**Premio:** Art & Technology, Best Storytelling, Most Inspirational.

---

## Nota sobre “Create Your Own Challenge”

Históricamente NASA ofrece una categoría “Create Your Own Challenge”, pero **no es elegible para Global Judging** ni para Global Awards. En 2026 la lista oficial tiene 14 challenges y no aparece. Si el equipo quiere hacer algo distinto, la estrategia es **encajarlo dentro de un challenge oficial**.
Ver [09-custom-challenge.md](09-custom-challenge.md).
