# 16 — Benchmark: herramientas parecidas y nuestro hueco

> **Para qué sirve:** la rúbrica premia Creatividad (20%) e Impacto (30%). Para no ser “otro Aladin”, hay que saber qué existe, qué copiar y qué hacer distinto.
> **Fecha:** 2026-11-14.

---

## 1. La frase que tenemos que ganar

> **“SkyBlink es el Backyard Worlds de SPHEREx: elegís una coordenada, ves el cielo cambiar en 102 bandas y encontrás candidatos, sin instalar nada.”**

Si el jurado entiende eso en 10 segundos, la Creatividad y el Impacto quedan cubiertos.

---

## 2. Mapa de competidores

| Herramienta | Qué hace | Fortaleza | Debilidad | Qué copiamos | Cómo nos diferenciamos |
|---|---|---|---|---|---|
| **Backyard Worlds: Planet 9** (Zooniverse/NASA) | Flipbooks de imágenes WISE para encontrar objetos en movimiento (enanas marrones, Planet 9) | Tutorial de 15 min; 3.800+ enanas marrones descubiertas; 40+ voluntarios coautores; “Think you've got one” | Solo WISE; sin 102 bandas; sin espectros; sin diferencia/centroides; no es una API | Tutorial, flipbook, formulario de candidato, lenguaje ciudadano | SPHEREx, 102 bandas, diferencia, espectros y ranking de candidatos |
| **The Daily Minor Planet** (Zooniverse) | Voluntarios clasifican candidatos a asteroides de Catalina/Bok | Pipeline de detección de movimiento; tarea simple sí/no; candidatos priorizados | Sin espectros; sin 102 bandas; no es SPHEREx | Tarjetas de candidato, flujo de clasificación, “¿es real o artefacto?” | Movimiento + contexto espectral + ficha de objeto |
| **Hubble Asteroid Hunter** (Zooniverse) | Busca asteroides en imágenes de Hubble | Detección de trazas/streaks; ciencia ciudadana | Hubble, no SPHEREx; no es tiempo real | Cómo mostrar trazas y artefactos | Series temporales SPHEREx + diferencia |
| **ESASky** (ESA) | Portal web multi-misión: imágenes, catálogos, espectros, SSO | Multi-misión, búsqueda de objetos del sistema solar, HiPS, overlays | Complejo; centrado en ESA; no tiene SPHEREx; no es citizen-first | Selector de misión, búsqueda SSO, overlays, panel de metadata | Experiencia simple y guiada, SPHEREx-first |
| **Aladin Lite** (CDS) | Visor HiPS web; capas, catálogos, cubos HiPS | Estándar de facto; HiPS cube; embebible; usado por ESASky/ESO/ALMA | Genérico; no tiene flujo de descubrimiento; no tiene serie temporal SPHEREx | Slider de cubo HiPS, control de capas, URL state | Workflow opinionado: blink → diferencia → candidato |
| **SAOImage DS9** | Visor FITS de escritorio; blink, animación, regiones | Blink rápido; estándar profesional; FITS | Instalación; UI experta; no es web | Controles de blink, animación, etiquetas de fecha | Cero instalación; público; narrativa |
| **AstroImageJ** | Análisis time-series, fotometría, diferencia, blink | Potente para fotometría y curvas de luz | Escritorio; curva de aprendizaje; no es público | Diferencia, fotometría de apertura, curva de luz | Web, simple, con explicación |
| **Firefly / IRSA Viewer** | Visor web de FITS, HiPS, tablas y espectros de IRSA | Integración IRSA; metadata; espectros | Profesional; muchas paneles; no es consumer | Panel de metadata/espectro, integración IRSA | Flujo guiado para “ver cambios” |
| **SPHEREx Data Explorer** (IRSA) | GUI oficial para buscar/visualizar/descargar SPHEREx | Autoridad; acceso a datos; visualización | No es un comparador público de épocas; no tiene blink/102 bandas juntos | Créditos y enlaces oficiales | Capa pública de descubrimiento encima de los datos |
| **WorldWide Telescope / NASA Eyes** | Visualización y tours | Storytelling; 3D | No es análisis de datos | Tours, narrativa visual | Datos reales + interacción |
| **ALeRCE / Fink / ANTARES / Lasair** | Brokers de alertas para Rubin/ZTF | Triage a escala; clasificación | No son SPHEREx; no están en nuestras APIs; expertos | Idea de ranking de candidatos | Candidatos SPHEREx con datos que sí tenemos |
| **MOST / SSOIS / SkyBot** | Búsqueda de objetos del sistema solar / efemérides | Precovery; órbitas; posiciones | Expertos; GUI; no es público | Overlay de objetos conocidos | Integrado en el blink público |

---

## 3. Gap analysis: qué no existe

Hoy no existe una herramienta pública, web y cero-instalación que combine:

1. **Series temporales de SPHEREx** por coordenada.
2. **Blink + diferencia** de imágenes.
3. **Slider de 102 bandas** (HiPS cube).
4. **Espectro quick-look** con `WCS-WAVE`.
5. **Ranking de candidatos** a movimiento/variabilidad.
6. **URL compartible** y créditos NASA/IRSA.

Las piezas existen por separado:
- **Backyard Worlds** hace 1 y 2 (con WISE), pero no 3, 4, 5 ni 6.
- **Aladin/ESASky** hacen 3 y 6, pero no 1, 2, 5.
- **DS9/AstroImageJ** hacen 2 y 4, pero no 1, 3, 5, 6 y son de escritorio.
- **SPHEREx Data Explorer** hace 1 y 3, pero no 2, 4, 5, 6.

**Nuestro hueco es la combinación.** No competimos con Aladin; competimos con “no tener una forma fácil de mirar SPHEREx”.

---

## 4. Qué copiar (y qué no)

### Copiar
- **Tutorial de 15 min** y “Get Started” de Backyard Worlds.
- **Flipbook** con fechas visibles y control de velocidad.
- **“Think you've got one”**: botón para marcar un candidato y dejarlo registrado.
- **Tarjetas de candidato** y clasificación simple de Daily Minor Planet.
- **Selector de capa/misión** de ESASky.
- **Slider de cubo HiPS** de Aladin Lite.
- **Panel de metadata/espectro** de Firefly.
- **URL state** de Aladin (`?ra=&dec=&fov=`).

### No copiar
- Instalación de escritorio (DS9/AIJ).
- Login obligatorio.
- 20 paneles y jerga desde el minuto 1.
- 100 configuraciones antes de ver la primera imagen.
- Prometer “descubrimientos” sin validación.
- Mezclar misiones que no tenemos (Gaia/ZTF/Rubin) como si estuvieran integradas.

---

## 5. Rúbrica → producto

| Criterio | Peso | Cómo lo cubrimos | Evidencia para el jurado |
|---|---|---|---|
| **Impacto** | 30% | Público (estudiantes, docentes, citizen scientists, investigadores); 1B+ objetos; 102 bandas; candidates + educación | Test con 3 usuarios, tiempo hasta el primer hallazgo, 5 targets, datos reales, citas |
| **Creatividad** | 20% | Combinación única: blink + diferencia + 102 bandas + espectro + candidatos + URL | Demo de 30 s mostrando la combinación, no una sola feature |
| **Viabilidad** | 20% | Datos reales, pipeline probado, caché/fallback, límites honestos | PoC, manifiesto, arquitectura, manejo de errores |
| **Prototipo & MVP** | 20% | 5 targets, blink, diff, slider, ficha, deploy | Demo en vivo + video de respaldo |
| **Presentación** | 10% | Guion de 30 s, storyboard, subtítulos, ensayo | Video, deck de 7 slides, link público |

---

## 6. Prioridades por impacto/esfuerzo

| Prioridad | Feature | Criterio que mejora | Esfuerzo |
|---|---|---|---|
| **P0** | 5 targets precomputados | Impacto, Prototipo | Medio |
| **P0** | Blink player | Prototipo | Medio |
| **P0** | Modo diferencia | Creatividad, Prototipo | Medio |
| **P0** | Slider 102 bandas (HiPS) | Creatividad, Impacto | Bajo |
| **P0** | Ficha de objeto | Viabilidad, Impacto | Bajo |
| **P0** | URL compartible | Impacto | Bajo |
| **P1** | Tutorial de 15 min | Impacto | Medio |
| **P1** | Ranking de candidatos | Creatividad, Impacto | Medio |
| **P1** | Espectro quick-look | Creatividad, Viabilidad | Alto |
| **P1** | Trayectoria de centroides | Viabilidad | Alto |
| **P2** | Overlay WISE | Creatividad | Medio |
| **P2** | Live mode | Impacto | Alto |
| **P2** | ML/clasificador | Creatividad | Alto |

---

## 7. Frases de posicionamiento (para el pitch)

- “Backyard Worlds hizo esto con WISE. Nosotros lo hacemos con SPHEREx, en 102 bandas y en el navegador.”
- “No es otro visor del cielo: es un buscador de cambios.”
- “Elegís una coordenada; el cielo te muestra qué se movió.”
- “Datos de NASA, cero instalación, ciencia ciudadana.”

---

## 8. Fuentes

- Backyard Worlds: NASA Science — https://science.nasa.gov/citizen-science/backyard-worlds-planet-9
- Backyard Worlds: Zooniverse — https://www.zooniverse.org/projects/marckuchner/backyard-worlds-planet-9
- The Daily Minor Planet — https://www.zooniverse.org/projects/fulsdavid/the-daily-minor-planet
- Hubble Asteroid Hunter — https://www.zooniverse.org/projects/sandorkruk/hubble-asteroid-hunter
- ESASky — https://sky.esa.int · interfaz: https://cosmos.esa.int/web/esdc/esasky-interface
- Aladin Lite — https://aladin.cds.unistra.fr/AladinLite/
- SAOImage DS9 — https://sites.google.com/cfa.harvard.edu/saoimageds9
- AstroImageJ — https://astroimagej.com
- Firefly — https://caltech-ipac.github.io/firefly_client/
- SPHEREx Data Explorer — https://irsa.ipac.caltech.edu/applications/spherex/
- 2025 Global Winners — https://www.spaceappschallenge.org/2025/awards/global-winners/
