# 01 — Decisión del challenge

> **Estado:** propuesta. El equipo debe votar.
> **Recomendación:** **Planet X and SPHEREx**.
> **Fecha:** 2026-11-14.

---

## 1. Cómo decidimos (criterios)

Para un hackathon de 48 h no alcanza con “me gusta el tema”. Evaluamos:

1. **Elegibilidad:** ¿responde a un challenge oficial? (obligatorio para Global Judging).
2. **Datos listos:** ¿se puede acceder hoy, sin permisos especiales, con APIs públicas?
3. **Factibilidad 48 h:** ¿un equipo de 5 personas puede tener un demo funcional?
4. **Impacto:** ¿resuelve un problema real y se entiende en 30 segundos?
5. **Wow visual:** ¿el demo se ve impresionante sin explicar 10 minutos de ciencia?
6. **Encaje con el equipo:** ¿podemos aportar algo diferencial?
7. **Riesgo:** ¿qué probabilidad hay de que los datos/APIs fallen en vivo?
8. **Dato disponible (data-first):** ¿el dataset/API existe, responde hoy y está en el inventario? Si no, no es candidato. Ver [08-problemas-astrofisica.md](08-problemas-astrofisica.md), tabla 0.1.

---

## 2. Matriz de los 14 challenges

Puntajes: **F** = factibilidad 48 h, **I** = impacto, **D** = datos listos, **W** = wow visual. Escala 1–5. Total /20.
*(Evaluación inicial de Andy; el equipo puede ajustar.)*

| # | Challenge | Dificultad | Qué pide | Datos/API | F | I | D | W | Total |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Abandoned but not Forgotten** | Intermediate | Contar la historia del hardware abandonado en Luna/Marte para estudiantes | Imágenes NASA, modelos 3D, archivos históricos | 3 | 3 | 4 | 3 | 13 |
| 2 | **Be An Earth System Trend Detective!** | Advanced | Encontrar y visualizar tendencias significativas en variables de Earth science | Earthdata/GES DISC, Giovanni, NetCDF/Zarr | 2 | 5 | 3 | 3 | 13 |
| 3 | **Build a Junior Astronaut Mission Trainer** | Intermediate | Juego de gestión de un outpost lunar/marciano con trade-offs | Datos NASA de soporte vital, radiación, energía | 4 | 3 | 3 | 4 | 14 |
| 4 | **Create Health Monitoring Software for Astronauts** | Intermediate | Software que recolecta indicadores de salud y ayuda a decidir | Datos análogos/sintéticos, literatura NASA | 4 | 3 | 2 | 3 | 12 |
| 5 | **Dancing with the SARs** | Advanced | Visualizar cambios de superficie con radar NISAR | ASF DAAC, NISAR, InSAR; requiere Earthdata login | 2 | 4 | 2 | 4 | 12 |
| 6 | **Field Shift: Adapting Farms with NASA Data** | Advanced | Herramienta de rotación de cultivos con datos NASA + suelo | SMAP, MODIS, SoilGrids, datos locales | 2 | 4 | 2 | 3 | 11 |
| 7 | **Flame in Freefall (SI)** | Advanced | Dashboard con IA que resume datos de combustión en microgravedad | Papers/datos NASA de combustión | 3 | 3 | 3 | 3 | 12 |
| 8 | **Harmonization of MODIS and VIIRS Hot Spots** | Advanced | Calendario de incendios que armoniza MODIS y VIIRS | FIRMS API (CSV), shapefiles | 4 | 4 | 5 | 3 | 16 |
| 9 | **Earth Analogs for Moon/Mars Bases** | Advanced | Identificar y caracterizar análogos terrestres | Earthdata, USGS, MOLA, CTX, OpenStreetMap | 2 | 3 | 3 | 3 | 11 |
| 10 | **Interplanetary Survival Guide: Martian Map** | Intermediate | Mapa multicapa para planificar un Marswalk | USGS Mars, CTX/HiRISE, MOLA, Mars Trek | 4 | 4 | 4 | 5 | **17** |
| 11 | **Lunar Landing Site Navigator** | Advanced/Intermediate | Comparar sitios de alunizaje con posiciones Sol/Tierra | SPICE, LOLA, LRO, efemérides | 3 | 4 | 4 | 5 | **16** |
| 12 | **Planet X and SPHEREx** | Advanced | Herramienta pública para ver imágenes SPHEREx y sus cambios | SIA2, cutouts, TAP, HiPS, AWS | 4 | 5 | 5 | 5 | **19** |
| 13 | **Space Mission Design Game** | Intermediate | Juego para diseñar y simular una misión completa | Modelos físicos, datos de cohetes/presupuestos | 4 | 3 | 2 | 4 | 13 |
| 14 | **The Earth Information Jukebox** | Intermediate | Sonificar visualizaciones del Earth Information Center | EIC frames/videos, Web Audio | 4 | 3 | 4 | 5 | **16** |

---

## 3. Recomendación: Planet X and SPHEREx

### Por qué gana
1. **Datos públicos y probados:** SIA2 responde, los cutouts se descargan, el HiPS cube tiene 102 capas PNG. No dependemos de permisos.
2. **El demo se explica solo:** “elegís una coordenada y ves el cielo cambiar” se entiende en 5 segundos.
3. **Ciencia real y ciudadana:** proper motion, variables, asteroides, enanas marrones. Es el corazón del challenge.
4. **Encaja con lo que ya investigamos:** las 14 APIs que juntó el equipo son casi todas de este ecosistema.
5. **Margen de diferenciación:** blink + diferencia + slider de 102 bandas + espectro + astrometría sub-píxel.
6. **Premios a los que apunta:** Best Use of Data, Best Use of Science, Galactic Impact, Most Inspirational.

### Riesgos y mitigación
| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| IRSA/TAP intermitente (502) | Alta | Usar SIA2 + cutouts; cachear; fallback a datos precomputados |
| Cutouts pesados (~4 MB por ePSF) | Alta | Bajar pocas épocas; cachear; ignorar ePSF |
| Objetos débiles (WISE 0855) | Media | Stacking de épocas; usar Barnard/RW Aur para el wow |
| Movimiento sub-píxel (6.15″/px) | Alta | Diferencia de imágenes + centroides + gráfico de trayectoria |
| Imágenes espectrales (no broadband) | Media | Mostrar el cutout tal cual + “colapsar longitudes de onda” simple |
| Falla el deploy en vivo | Media | Demo precomputada + video de respaldo |

### MVP propuesto (48 h)
1. **Blink player:** coordenada → lista de épocas → play/pause/slider.
2. **Modo diferencia:** época A − época B, con realce.
3. **Slider 102 bandas:** HiPS cube por capas PNG (contexto espectral).
4. **Ficha de objeto:** nombre, RA/Dec, época, banda, flags, fuente.
5. **Bonus:** espectro del objeto y trayectoria de centroides.
6. **Bonus:** URL compartible con coordenadas.

### Lo que NO haremos en 48 h
- Pipeline científico completo de cubos espectrales.
- Astrometría de precisión publicable.
- Búsqueda de planetas.
- Integración con Rubin/LSST en vivo.
- Login, base de datos de usuarios, mobile app nativa.

---

## 4. Alternativas si el equipo no quiere SPHEREx

### A. Interplanetary Survival Guide: Martian Map (17/20)
**Por qué:** mapas, capas, visión 3D, datos USGS/NASA accesibles, demo muy visual.
**Riesgo:** integrar muchas fuentes y que el mapa se vea genérico.
**Si el equipo es fuerte en frontend/geo:** es la mejor alternativa.

### B. Lunar Landing Site Navigator (16/20)
**Por qué:** Sol/Tierra sobre el horizonte lunar es un problema concreto y visual; SPICE da datos.
**Riesgo:** SPICE y geometría; requiere cuidado científico.
**Si hay alguien fuerte en Python/SPICE:** muy buen proyecto.

### C. Harmonization of MODIS and VIIRS Hot Spots (16/20)
**Por qué:** FIRMS API es fácil, el calendario de incendios es visual y útil.
**Riesgo:** menos “wow” y más “dashboard”; la armonización requiere justificar bien el método.
**Si el equipo es fuerte en datos/estadística:** opción sólida.

### D. The Earth Information Jukebox (16/20)
**Por qué:** creativo, multisensorial, bueno para Art & Technology / Best Storytelling.
**Riesgo:** depende de diseño/audio; la ciencia puede quedar superficial.
**Si Leo/Samuel son fuertes en arte/audio:** considerar.

---

## 5. ¿Y un “Custom Challenge”?

**No lo recomiendo si quieren Global Judging.**
- NASA permite “Create Your Own Challenge”, pero **no es elegible para Global Judging** y no compite por Global Awards.
- Algunos eventos locales dan premios locales a esa categoría.
- En 2026 la lista oficial tiene **14 challenges** y no aparece “Custom”.

**Estrategia híbrida:** si les gusta una idea propia (por ejemplo, un asistente de datos para científicos), **encajenla dentro de un challenge oficial**. Así conservan elegibilidad global y hacen algo diferente.
Ver [docs/09-custom-challenge.md](09-custom-challenge.md).

---

## 6. Voto del equipo

| Persona | ¿SPHEREx? | Alternativa preferida | Comentario |
|---|---|---|---|
| Andy | ✅ | Martian Map | — |
| David | ⬜ | | |
| Samuel | ⬜ | | |
| Jorge | ⬜ | | |
| Leo | ⬜ | | |

**Regla:** si hay empate, decide Andy y se registra en `documentacion.md`.
