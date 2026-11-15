# 07 — Pitch de 30 segundos (y cómo hacerlo bien)

> **Regla oficial:** el demo es un video de **≤30 segundos** **o** un deck de **≤7 slides** (incluyendo título).
> **Idioma:** la submission y los slides en inglés. El video puede ser en español **con subtítulos en inglés**.
> **Criterio de jurado:** Impact, Creativity, Validity, Relevance, Presentation (escala 1–5).

---

## 1. Lo que dice la guía oficial (traducido)

El video debe seguir esta estructura:

| Tiempo | Qué decir |
|---|---|
| **0:00** | **Presentate:** tu nombre y el nombre del equipo. |
| **0:02** | **Entrá en tema:** ¿qué challenge abordás? ¿qué te inspiró? |
| **0:05** | **Nombrá el proyecto:** título y tagline que capturen la atención. |
| **0:10** | **Describí la idea:** ¿cómo funciona? Mostrá imágenes o el prototipo, describí la experiencia del usuario y cómo usaron datos abiertos de NASA. |
| **0:20–0:30** | **Mirá al futuro:** ¿qué podría lograr? ¿qué impacto tiene para las personas, el mundo y más allá? |

**Límites:** si te pasás de 30 s o de 7 slides, **no sos elegible para Global Judging**.

---

## 2. Cómo se puntúa (y cómo sacar 5)

| Criterio | Qué busca el jurado | Cómo lo logramos |
|---|---|---|
| **Impact** | Problema importante, audiencia amplia, cambio real | “Cualquiera puede ayudar a descubrir objetos”; ciencia ciudadana; educación |
| **Creativity** | Idea original o mejora significativa | Blink + diferencia + 102 bandas + trayectoria sub-píxel en una sola UI |
| **Validity** | Base científica, factible, usable | Datos reales de SPHEREx/IRSA; pipeline reproducible; demo funcionando |
| **Relevance** | Responde al challenge y usa NASA data de forma central | Es literalmente el challenge; SIA2/cutouts/HiPS son el core |
| **Presentation** | Storytelling claro, estructura, delivery | Guion de 30 s, visuals fuertes, ensayo, subtítulos |

---

## 3. Guion del video (30 s) — versión español

**Nombre de trabajo:** SkyBlink (se puede cambiar).
**Tagline:** “El cielo cambia. Ahora lo podés ver.”

| Tiempo | Audio (español) | Visual |
|---|---|---|
| **0:00** | “Hola, soy Andy, de Astral Codes.” | Plano del equipo / logo |
| **0:02** | “Elegimos Planet X and SPHEREx: cada seis meses, SPHEREx fotografía todo el cielo en 102 bandas infrarrojas.” | Render de SPHEREx / animación all-sky |
| **0:05** | “Nadie puede revisar mil millones de objetos a mano. Por eso creamos **SkyBlink**.” | Logo + tagline |
| **0:09** | “Escribís una coordenada y ves una película de ese parche del cielo entre épocas.” | Grabación: input + blink |
| **0:13** | “Activás la diferencia, movés el slider de 102 bandas y la herramienta marca candidatos a movimiento.” | Toggle diff + slider + marcadores |
| **0:20** | “Así, cualquiera puede ayudar a encontrar asteroides, enanas marrones y estrellas variables.” | Iconos / arte / galería |
| **0:25** | “NASA abrió los datos. Nosotros abrimos la puerta para mirarlos.” | Créditos NASA/IRSA |
| **0:29** | “Astral Codes. Gracias.” | Equipo + URL |

**Duración objetivo:** 29–30 s. **Palabras:** ~75.

---

## 4. Guion del video (30 s) — versión inglés (para subtítulos)

| Time | Audio (English) |
|---|---|
| **0:00** | “Hi, I'm Andy from Astral Codes.” |
| **0:02** | “We chose Planet X and SPHEREx: every six months, SPHEREx maps the entire sky in 102 infrared bands.” |
| **0:05** | “No one can inspect a billion objects by hand. So we built **SkyBlink**.” |
| **0:09** | “Enter a coordinate and watch a movie of that patch across epochs.” |
| **0:13** | “Turn on difference mode, slide through 102 bands, and SkyBlink flags moving candidates.” |
| **0:20** | “Now anyone can help find asteroids, brown dwarfs, and variable stars.” |
| **0:25** | “NASA opened the data; we open the door to look at it.” |
| **0:29** | “Astral Codes. Thank you.” |

**Subtítulos:** obligatorios si el audio no está en inglés. Podés usar CapCut, DaVinci Resolve o YouTube Studio.

---

## 5. Storyboard / shot list

1. **0:00 — Hook humano:** cara de Andy, buena luz, audio claro.
2. **0:02 — Contexto:** render de SPHEREx o animación del cielo; texto “102 bands · every 6 months”.
3. **0:05 — Nombre:** logo + tagline; fondo oscuro, tipografía grande.
4. **0:09 — Demo:** pantalla real; cursor entra coordenada; blink se reproduce.
5. **0:13 — Diferenciador:** toggle “Difference”, slider “102 bands”, marcadores de candidatos.
6. **0:20 — Impacto:** imágenes de asteroides/enanas marrones/estrellas variables; texto “Citizen science”.
7. **0:25 — Créditos:** “Data: NASA/SPHEREx · IRSA/Caltech”.
8. **0:29 — Cierre:** equipo + URL + QR.

**Regla:** el 70% del video debe ser **demo real**, no slides.

---

## 6. Deck de respaldo (7 slides)

Si el video falla o si el evento pide slides:

1. **Título:** Astral Codes · SkyBlink · Planet X and SPHEREx.
2. **Problema:** mil millones de objetos, 102 bandas, datos que cambian cada 6 meses; nadie puede mirarlos a mano.
3. **Solución:** buscador de cambios del cielo: blink + diferencia + 102 bandas + candidatos.
4. **Demo:** 2–3 capturas/GIF del blink y la diferencia.
5. **Cómo funciona:** SIA2 → cutouts → caché → UI; datos NASA/IRSA; URL compartible.
6. **Impacto:** ciencia ciudadana, educación, descubrimiento de asteroides/enanas marrones/variables.
7. **Equipo + links + créditos + uso de IA.**

**Regla:** ≤7 slides, texto grande, una idea por slide.

---

## 7. Guion de “cómo trabajamos” (30 s)

Para presentar al equipo (no es el demo oficial; sirve para el kickoff o para jueces locales):

| Tiempo | Audio |
|---|---|
| **0:00** | “Somos Astral Codes: cinco personas, dos días, un objetivo.” |
| **0:03** | “Un solo documento fuente de verdad, tareas en GitHub y standups de diez minutos.” |
| **0:08** | “Cada feature entra con demo, datos cacheados y una decisión registrada.” |
| **0:14** | “A las doce horas congelamos alcance: solo pulimos, probamos y ensayamos.” |
| **0:20** | “Ciencia honesta: etiquetamos candidatos, mostramos incertidumbre y citamos cada dato.” |
| **0:26** | “Astral Codes: rápido, reproducible y en equipo.” |

---

## 8. Cómo hacer un buen pitch (investigación y práctica)

### 8.1 La estructura que funciona
1. **Hook:** una pregunta, un dato o una imagen que sorprenda.
2. **Problema:** ¿por qué es difícil? ¿a quién le importa?
3. **Solución:** una frase clara, sin jerga.
4. **Prueba:** demo real, números, datos NASA.
5. **Impacto:** ¿qué cambia para el usuario?
6. **Cierre:** una frase memorable + pedido.

### 8.2 Reglas de oro
- **Una sola idea.** Si el jurado recuerda una cosa, ¿cuál es?
- **Un número.** “Mil millones de objetos” o “102 bandas” pega más que “muchos datos”.
- **Mostrar, no contar.** 10 s de demo valen más que 20 s de explicación.
- **Cero jerga.** Si decís “SIA2”, explicá en 3 palabras: “el buscador de imágenes de NASA”.
- **Empezá por el problema, no por la tecnología.**
- **Terminá con una frase que se repita.**
- **Ensayá 10 veces.** Grabá, mirá, corregí.
- **Cronometrá.** 30 s son ~75 palabras.
- **Audio > video.** Un buen audio con imagen simple gana a un video lindo con audio malo.
- **Subtítulos siempre.** Ayudan a accesibilidad y a jueces no nativos.

### 8.3 Errores comunes
- Decir “somos un equipo de 5 y usamos React” antes de decir qué problema resuelven.
- Explicar la arquitectura en el video.
- Mostrar una slide de código.
- Prometer “descubrir planetas” sin evidencia.
- Usar música con copyright.
- Pasarse de 30 s.
- No mostrar el producto.
- Leer el guion mirando el papel.

### 8.4 Checklist de grabación
- [ ] Guion final aprobado.
- [ ] Storyboard con timestamps.
- [ ] Demo grabada en pantalla (1080p, 30 fps).
- [ ] Audio grabado con micrófono (no el del laptop).
- [ ] Subtítulos en inglés.
- [ ] Música libre o sin música.
- [ ] Créditos NASA/IRSA.
- [ ] Logo del equipo.
- [ ] Duración ≤30 s.
- [ ] Export 16:9, MP4/H.264.
- [ ] Subido a YouTube/Drive con link público.
- [ ] Probado en ventana privada.

---

## 9. Cómo hablar de la ciencia sin exagerar

| En vez de… | Decí… |
|---|---|
| “Descubrimos un planeta.” | “Marcamos candidatos para que la comunidad los revise.” |
| “Detectamos movimiento.” | “Medimos un desplazamiento de menos de un píxel.” |
| “Es preciso.” | “Tiene una incertidumbre de X arcsec.” |
| “Funciona con cualquier coordenada.” | “Funciona con 5 targets precomputados y modo live experimental.” |
| “IA” | “Usamos IA para [tarea concreta], declarada en la submission.” |

---

## 10. Ensayo y feedback

- **Ensayo 1 (domingo 16:00):** guion + demo, sin cámara.
- **Ensayo 2 (domingo 18:00):** grabación completa.
- **Feedback:** pedir a alguien fuera del equipo que diga qué entendió en 30 s.
- **Ajuste:** si no entendió el problema, reescribir el hook.
- **Final:** grabar 3 tomas y elegir la mejor.

---

## 11. Frases de cierre posibles

- “NASA abrió los datos; nosotros abrimos la puerta para mirarlos.”
- “El cielo cambia. Ahora lo podés ver.”
- “Mil millones de objetos. Una herramienta para encontrarlos.”
- “No hace falta ser astrónomo para descubrir algo nuevo.”

Elegir **una** y repetirla en el video, el deck y la submission.
