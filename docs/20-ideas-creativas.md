# 20 — 14 ideas creativas (una por reto)

> **Regla:** cada idea tiene que ser **coherente con el reto** pero **no la solución obvia**. Buscamos un “twist” que haga que el jurado recuerde el proyecto, sin perder ciencia ni datos.
> **Cómo leer:** Idea → Twist → Interacción → Dato NASA → Demo 30 s → Fit con el reto → Riesgo.

---

## Resumen en una tabla

| # | Reto | Idea | Twist en una frase |
|---|---|---|---|
| 1 | Abandoned but not Forgotten | **Exit Interview** | Entrevistas de despedida al hardware abandonado |
| 2 | Earth System Trend Detective | **The Trend Court** | Un juicio con evidencia científica y veredicto |
| 3 | Junior Astronaut Mission Trainer | **Delay** | Cooperativo con 20 min de retraso Marte-Tierra |
| 4 | Health Monitoring for Astronauts | **Gravity Check** | Pronóstico del tiempo de tu salud |
| 5 | Dancing with the SARs | **The Sinking City** | Misterio resuelto con interferogramas SAR |
| 6 | Field Shift | **10 Seasons** | Simulador de 10 temporadas de decisiones |
| 7 | Flame in Freefall | **Fire Drill** | Simulación de crisis con evidencia NASA |
| 8 | MODIS/VIIRS Hot Spots | **The Fire Almanac** | Almanaque narrativo de incendios por región |
| 9 | Earth Analogs for Moon/Mars | **Match Point** | “Dating app” de sitios análogos |
| 10 | Martian Map | **Mars Commute** | Google Maps para un Marswalk |
| 11 | Lunar Landing Site Navigator | **Earthrise** | Reloj poético de salida de la Tierra |
| 12 | Planet X and SPHEREx | **The Sky's Memory** | Rewind del cielo con “fantasmas” y dossier |
| 13 | Space Mission Design Game | **The Review Board** | Sos el jurado que aprueba/rechaza misiones |
| 14 | Earth Information Jukebox | **Earth's Mixtape** | Playlists sociales hechas de datos NASA |

---

## 1. Abandoned but not Forgotten → **Exit Interview**

**Idea:** cada pieza de hardware abandonado da una “entrevista de despedida”. El usuario elige preguntas (“¿qué hiciste?”, “¿qué dejaste atrás?”, “¿qué querés que recuerden?”) y arma un **legajo** con fotos, datos de misión y una carta final.

**Twist:** no es un museo ni una línea de tiempo; es un **dispositivo narrativo en primera persona**. El hardware “habla”.

**Interacción:** elegir objeto → 5 preguntas → testimonio en tarjetas → legajo compartible.

**Dato NASA:** NASA Image and Video Library, NSSDC, páginas de misión, NASA 3D Resources.

**Demo 30 s:** “Entrevisté a la cámara de Voyager 1; esto es lo que dejó atrás.”

**Fit:** storytelling para estudiantes, hardware real, ciencia de misiones.

**Riesgo:** contenido; cada frase debe estar citada. No inventar personalidad que contradiga los datos.

**48 h:** 5 objetos, 10 preguntas, 1 legajo compartible.

---

## 2. Be An Earth System Trend Detective! → **The Trend Court**

**Idea:** el usuario es jurado de un “juicio” donde la fiscalía y la defensa presentan datos sobre una tendencia en una región. Puede pedir mapas, series temporales y tests de significancia, y luego emite un veredicto. La app explica por qué el veredicto es correcto o no.

**Twist:** dashboard → **juicio/game**. Enseña incertidumbre y significancia sin una clase.

**Interacción:** 3 casos (Ártico, Amazonia, tu ciudad) → evidencia → veredicto → explicación.

**Dato NASA:** Earthdata/GES DISC, Giovanni, POWER, MODIS; 3 casos precomputados.

**Demo 30 s:** “¿La Amazonia se está secando? La defensa dice que no; mirá la evidencia y decidí.”

**Fit:** tendencias, mapas, significancia, explicación.

**Riesgo:** autenticación Earthdata y datos grandes; precomputar 3 casos y no prometer “cualquier región”.

**48 h:** 3 casos, 6 tarjetas de evidencia, 1 veredicto.

---

## 3. Build a Junior Astronaut Mission Trainer → **Delay**

**Idea:** juego cooperativo de un outpost lunar/marciano con **20 minutos de retraso** en las comunicaciones. Un jugador es la tripulación; el otro es “Tierra” con el manual. Deben resolver fallas con mensajes que llegan tarde. Modo single-player: una “Tierra” con IA responde con delay.

**Twist:** de gestión de recursos → **comunicación y coordinación**. El verdadero problema de Marte no es el oxígeno; es la latencia.

**Interacción:** 10 turnos, 5 recursos, eventos; chat con delay; decisiones que no se pueden deshacer.

**Dato NASA:** Life Support Baseline Values, radiación (LRO/CRaTER), energía solar, datos de invernaderos.

**Demo 30 s:** “Tormenta solar; Tierra manda la solución, pero llega 20 minutos tarde. ¿Qué hacés?”

**Fit:** trade-offs de soporte vital, radiación, energía, comida.

**Riesgo:** multiplayer; el modo single-player con IA es el fallback.

**48 h:** 1 outpost, 10 turnos, 8 eventos, 3 finales.

---

## 4. Create Health Monitoring Software for Astronauts → **Gravity Check**

**Idea:** un chequeo diario de 60 segundos que combina autopercepción, voz, tiempo de reacción, sueño, HRV y dosis de radiación. Devuelve un **pronóstico del tiempo de tu salud**: verde, amarillo o rojo, con 3 acciones concretas.

**Twist:** dashboard médico → **pronóstico meteorológico personal**. Menos planilla, más decisión.

**Interacción:** diario de voz → 3 tests rápidos → pronóstico → acción.

**Dato NASA:** NASA Human Research Program, estudios análogos (HERA, bed rest), literatura; datos sintéticos **claramente etiquetados**.

**Demo 30 s:** “Tu pronóstico: amarillo. Deuda de sueño + radiación. Hacé 10 minutos de resistencia.”

**Fit:** indicadores de salud, evaluación y acción.

**Riesgo:** no hay datos reales de astronautas; ser honesto con datos sintéticos.

**48 h:** 5 indicadores, 3 niveles, 1 recomendación.

---

## 5. Dancing with the SARs → **The Sinking City**

**Idea:** un misterio narrativo. Una ciudad se hunde; el usuario recibe interferogramas SAR, datos GPS y “pistas” (noticias, permisos de agua). Debe decidir entre extracción de agua, falla geológica o construcción. La app revela la respuesta con InSAR.

**Twist:** dashboard GIS → **detective story**. El SAR se entiende porque hay un misterio.

**Interacción:** 3 casos → slider antes/después → tablero de evidencias → veredicto.

**Dato NASA:** ASF DAAC, NISAR/Sentinel-1; 2–3 casos preprocesados.

**Demo 30 s:** “¿Por qué se hunde Ciudad de México? Mirá el interferograma y decidí.”

**Fit:** cambio de superficie con radar, visualización.

**Riesgo:** acceso a NISAR/Earthdata y tamaño; precomputar casos.

**48 h:** 2 casos, 1 slider, 1 tablero de evidencias.

---

## 6. Field Shift: Adapting Farms with NASA Data → **10 Seasons**

**Idea:** heredás un campo. Cada temporada elegís cultivo, riego y cobertura; los datos de clima/suelo de NASA determinan los resultados. Después de 10 temporadas ves suelo, agua y resiliencia. El juego te enseña por qué una rotación funciona.

**Twist:** recomendador → **simulador por turnos**. El agricultor experimenta las consecuencias, no recibe una receta.

**Interacción:** 10 turnos, 4 decisiones, 3 medidores, puntaje final.

**Dato NASA:** SMAP, MODIS, POWER, SoilGrids; una región.

**Demo 30 s:** “Año 1: maíz. Año 3: sequía. Año 5: la cobertura salvó el suelo.”

**Fit:** rotaciones, suelo, agua, clima.

**Riesgo:** validación agronómica; simplificar y citar.

**48 h:** 1 región, 10 turnos, 3 finales.

---

## 7. Flame in Freefall → **Fire Drill**

**Idea:** una simulación de crisis de 5 minutos en un hábitat lunar. Suena la alarma; hay humo. El usuario debe decidir: ¿cerrar la compuerta? ¿ventilar? ¿usar el extintor? ¿evacuar? Cada decisión está respaldada por un hallazgo de combustión en microgravedad; la IA explica por qué con cita.

**Twist:** dashboard de papers → **juego de crisis**. La IA es “mission control”, no un chatbot genérico.

**Interacción:** timer, 5 decisiones, tarjetas de evidencia, final.

**Dato NASA:** NTRS, BASS, FLEX, Saffire; 20 documentos.

**Demo 30 s:** “Humo en el laboratorio. ¿Abrís la escotilla? Esto dice la NASA.”

**Fit:** seguridad contra incendios, microgravedad, interpretación.

**Riesgo:** calidad del corpus y alucinaciones; citar siempre.

**48 h:** 1 escenario, 5 decisiones, 10 evidencias.

---

## 8. Harmonization of MODIS and VIIRS Hot Spots → **The Fire Almanac**

**Idea:** un almanaque visual de incendios para una región. Cada semana muestra actividad histórica, comparación MODIS vs VIIRS, “qué mirar” y una historia corta de un bombero, agricultor o científico. La armonización es el motor; el almanaque es la cara.

**Twist:** dashboard → **almanaque narrativo**. La gente vuelve cada semana, no una vez.

**Interacción:** elegir región → calendario heatmap → comparar años → historia.

**Dato NASA:** FIRMS MODIS/VIIRS, 20 años, una región.

**Demo 30 s:** “Semana 34 en California: 3× más puntos calientes que en 2015. Esto dicen los dos sensores.”

**Fit:** armonización, calendario, respuesta temprana.

**Riesgo:** el método de armonización debe ser defendible; mostrar incertidumbre.

**48 h:** 1 región, 20 años, 1 calendario.

---

## 9. Earth Analogs for Moon/Mars Bases → **Match Point**

**Idea:** una “dating app” de sitios análogos. Cada sitio tiene un perfil (terreno, radiación, temperatura, agua, acceso); el usuario define las necesidades de la misión y la app calcula compatibilidad y explica el match.

**Twist:** mapa/ranking → **matching app**. La comparación se vuelve intuitiva y divertida.

**Interacción:** sliders de necesidades → perfiles → match % → explicación.

**Dato NASA:** Earthdata, USGS, MOLA, CTX, OpenStreetMap.

**Demo 30 s:** “Necesito radiación, basalto y agua: el Atacama da 92%.”

**Fit:** identificar y caracterizar análogos.

**Riesgo:** pesos arbitrarios; mostrar criterios y fuentes.

**48 h:** 10 sitios, 6 criterios, 1 ranking.

---

## 10. Interplanetary Survival Guide: Martian Map → **Mars Commute**

**Idea:** un “Google Maps” para Marte. Ingresás origen y destino; la app devuelve ruta, tiempo, energía, dosis de radiación, ventanas de comunicación y paradas científicas. Como un commuting diario de astronautas.

**Twist:** mapa estático → **navegador de rutas**. La historia se cuenta caminando.

**Interacción:** elegir inicio/fin → 3 rutas → “salir a las 14:20” → alertas.

**Dato NASA:** USGS Mars, MOLA, CTX, CRISM; región de Jezero.

**Demo 30 s:** “Hábitat → delta: 4,2 km, 2 h, 0,3 mSv, ventana de comms 14:20.”

**Fit:** mapa multicapa, ruta, condiciones.

**Riesgo:** datos de terreno/ruteo; precomputar una región.

**48 h:** 1 región, 5 rutas, 5 capas.

---

## 11. Lunar Landing Site Navigator → **Earthrise**

**Idea:** un reloj visual y poético que muestra, para cualquier sitio lunar y fecha, cuándo sale y se pone la Tierra, y cómo se mueve el Sol. Incluye “hora dorada” para aterrizar y cuenta regresiva de oscuridad para sobrevivir la noche lunar.

**Twist:** dashboard de ingeniería → **experiencia visual/emocional**. La Luna se siente.

**Interacción:** globo/terreno → fecha → reloj de Earthrise → energía/comms.

**Dato NASA:** SPICE, LOLA, LRO.

**Demo 30 s:** “En Shackleton, la Tierra sale el [fecha]; tenés 14 días de luz.”

**Fit:** Sol/Tierra sobre el horizonte, energía y comunicación.

**Riesgo:** geometría SPICE; validar con un caso conocido.

**48 h:** 3 sitios, 30 días, 1 reloj.

---

## 12. Planet X and SPHEREx → **The Sky's Memory**

**Idea:** un “rewind” cinematográfico del cielo. El usuario mueve una línea de tiempo; los objetos que se mueven dejan un **fantasma**; al tocar un fantasma, se abre un **dossier de candidato** con espectro, 102 bandas y metadata. La metáfora: el cielo tiene memoria.

**Twist:** blink comparator → **memoria/fantasmas + dossier**. Más narrativo y público.

**Interacción:** scrub/play → ver fantasmas → tocar → dossier → compartir.

**Dato NASA:** SIA2 + Cutout + HiPS (SPHEREx).

**Demo 30 s:** “Retrocedé 6 meses; un fantasma se mueve; tocalo y mirá su espectro.”

**Fit:** mostrar cambios en el tiempo, 102 bandas, ciencia ciudadana.

**Riesgo:** objetos débiles/movimiento sub-píxel; stacking y honestidad.

**48 h:** 5 targets, blink, diff, slider, dossier.

---

## 13. Space Mission Design Game → **The Review Board**

**Idea:** sos parte del board que aprueba o rechaza misiones. Llegan propuestas con presupuesto, masa, energía, riesgo y ciencia; tenés que decidir y asignar fondos. Cada decisión tiene consecuencias y explica los trade-offs.

**Twist:** constructor → **review board**. Se aprende diseño de misiones **evaluando**, no armando.

**Interacción:** 5 propuestas, presupuesto limitado, votación, consecuencias.

**Dato NASA:** datos de misiones, costos de lanzamiento, modelos simplificados.

**Demo 30 s:** “¿Aprobás el orbitador de $500M o el rover lunar de $300M?”

**Fit:** trade-offs de misión, presupuesto, masa, energía.

**Riesgo:** balance del juego; simplificar sin perder rigor.

**48 h:** 5 propuestas, 3 rondas, 1 final.

---

## 14. The Earth Information Jukebox → **Earth's Mixtape**

**Idea:** una app social donde cada “canción” es un dataset de NASA. El usuario elige datos (hielo marino, CO₂, huracanes), los mapea a instrumentos y crea un **mixtape** de 30 s con una historia. Puede compartirlo y escuchar los de otros.

**Twist:** sonificación única → **playlist social**. La datos se vuelven cultura.

**Interacción:** elegir dataset → mapear a sonido → grabar 30 s → compartir.

**Dato NASA:** EIC frames, Earthdata, Web Audio.

**Demo 30 s:** “Hice un mixtape con hielo marino, CO₂ y huracanes; escuchá el estribillo.”

**Fit:** sonificación, accesibilidad, storytelling.

**Riesgo:** que el mapping sea arbitrario; documentar la correspondencia.

**48 h:** 3 datasets, 3 tracks, 1 share.

---

## Top 5 por creatividad + factibilidad

| Puesto | Idea | Creatividad | Factibilidad | Por qué |
|---|---|---|---|---|
| 1 | **The Sky's Memory** (SPHEREx) | 5/5 | 4/5 | Narrativa fuerte, datos ya validados, demo visual |
| 2 | **Delay** (Junior Astronaut) | 5/5 | 4/5 | Cooperativo con latencia; enseña el problema real de Marte |
| 3 | **Fire Drill** (Flame) | 5/5 | 3.5/5 | Crisis + evidencia NASA; muy memorable |
| 4 | **Mars Commute** (Martian Map) | 4/5 | 4/5 | “Google Maps de Marte”; visual y útil |
| 5 | **The Trend Court** (Earth System) | 4/5 | 3/5 | Juicio con datos; enseña significancia |

**Menciones:** **Earth's Mixtape** (artístico), **Match Point** (divertido), **The Sinking City** (narrativo).

---

## Cómo elegir sin equivocarse

1. **¿El twist aclara el reto o lo esconde?** Si el jurado no entiende el vínculo en 10 s, no sirve.
2. **¿Se puede mostrar en 30 s?** Si necesitás 2 minutos de contexto, es una charla, no un demo.
3. **¿El dato existe y está en nuestras APIs?** Si depende de Rubin/Gaia/NISAR y no lo tenemos, es riesgo.
4. **¿5 personas lo pueden hacer en 48 h?** Si necesita 3 modelos de IA y un backend distribuido, no.
5. **¿Mejora un criterio de la rúbrica?** Impacto, Creatividad, Viabilidad, Prototipo o Presentación. Si no, es un adorno.
6. **¿Tiene un momento “wow”?** Una imagen, un sonido, una decisión, un veredicto. Si no hay momento, no se recuerda.

---

## Lo que NO hacer

- ❌ Poner un twist que no tenga nada que ver con el reto.
- ❌ Convertir todo en un juego sin ciencia.
- ❌ Usar datos que no tenemos y decirlo recién en la demo.
- ❌ Prometer “descubrimientos”.
- ❌ Hacer una metáfora tan fuerte que tape el dato.
- ❌ Copiar Backyard Worlds/Aladin sin agregar nada.

---

## Si eligen SPHEREx

La idea recomendada es **The Sky's Memory**:
- **Hook:** “El cielo tiene memoria.”
- **Demo:** rewind → fantasma → dossier → espectro → 102 bandas.
- **Diferencia:** no es un visor; es una experiencia de descubrimiento.
- **Ciencia:** SPHEREx, SIA2, cutouts, HiPS.
- **Pitch:** “Backyard Worlds hizo esto con WISE. Nosotros lo hacemos con SPHEREx, en 102 bandas y en el navegador.”

Ver [16-benchmark.md](16-benchmark.md) y [17-rubrica-y-prioridades.md](17-rubrica-y-prioridades.md).

---

## Verificación de datos — 14/11/2026

> Regla del equipo: **sin dato NASA accesible, no hay problema**. Probé cada fuente sin claves (o con `DEMO_KEY`) antes de proponer la idea.

| # | Idea | Fuente principal | Estado | Nota / fallback |
|---|---|---|---|---|
| 1 | Exit Interview | NASA Image & Video Library + NTRS | ✅ 200 | `images-api.nasa.gov/search`, `ntrs.nasa.gov/api/citations/search` |
| 2 | The Trend Court | NASA POWER + CMR | ✅ 200 | POWER sin key; CMR para descubrir datasets |
| 3 | Delay | NTRS + literatura HRP | ✅ 200 | Sin API de “soporte vital” en vivo → modelos propios citados |
| 4 | Gravity Check | NTRS / HRP | ✅ 200 | No hay datos médicos de astronautas → sintéticos etiquetados |
| 5 | The Sinking City | ASF DAAC (Sentinel-1/NISAR) | ⚠️ requiere Earthdata | Precomputar 2 interferogramas y servirlos cacheados |
| 6 | 10 Seasons | POWER + SMAP (CMR) | ✅ 200 / ⚠️ | SMAP necesita Earthdata; POWER alcanza para clima |
| 7 | Fire Drill | NTRS | ✅ 200 | Corpus de ~20 papers; citar cada afirmación |
| 8 | The Fire Almanac | FIRMS | ⚠️ clave gratuita | `DEMO_KEY` devuelve 400: pedir `MAP_KEY` (gratis) |
| 9 | Match Point | CMR + USGS/Trek | ✅ 200 | Trek responde 206 por rangos; usar tiles |
| 10 | Mars Commute | Trek/USGS + SPICE | ✅ 200 | `de440s.bsp` accesible desde NAIF |
| 11 | Earthrise | SPICE (NAIF) + LOLA | ✅ 200 | Calcular geometría local con `spiceypy` |
| 12 | The Sky's Memory | IRSA SIA2 + cutouts | ❌ 502 al momento de la prueba | **Fallback obligatorio**: CSV + frames ya cacheados en `data/cache/` |
| 13 | The Review Board | NTRS + NASA fact sheets | ✅ 200 | Costos: fuentes públicas, no API |
| 14 | Earth's Mixtape | GIBS (WMS) + EONET | ✅ 200 | GIBS sirve capas listas para sonificar |

### Lo que esto implica

- **7 de 14** ideas dependen de datos que responden sin fricción hoy.
- **4** necesitan una clave gratuita o login Earthdata: pedirla **antes** de elegir la idea.
- **1** (SPHEREx) está intermitente: si la eligen, el demo **debe** correr desde `data/cache/` y el modo live es bonus.
- **2** (salud, soporte vital) no tienen dataset público de astronautas: la idea es válida solo si se declara que los datos son sintéticos o basados en literatura.

### Claves a pedir (5 minutos, gratis)

| Servicio | Dónde | Para qué |
|---|---|---|
| NASA API key | `api.nasa.gov` | Evitar 429 de `DEMO_KEY` |
| FIRMS `MAP_KEY` | `firms.modaps.eosdis.nasa.gov/api/` | Idea 8 |
| Earthdata Login | `urs.earthdata.nasa.gov` | Ideas 5, 6 |

