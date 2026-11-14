# 10 — Checklist de entrega (Submission)

> **Deadline:** domingo 15/11/2026, **23:59 hora local del evento**.
> **Regla:** solo se evalúa lo que está en la **Project page** de Space Apps + links públicos.
> **Si un link pide login, el jurado no puede verlo y el proyecto no se evalúa.**

---

## 1. Elegibilidad (antes de todo)

- [ ] El proyecto responde a **uno de los 14 challenges oficiales**.
- [ ] Todos los miembros están registrados en el **mismo Local Event** (o Universal Event).
- [ ] El equipo tiene **1–6 miembros** (Universal Event: mínimo 2).
- [ ] Nadie está en otro equipo.
- [ ] El equipo trabaja en **un solo challenge**.
- [ ] Todos aparecen en la pestaña **Members** del equipo.
- [ ] El proyecto es **original** y no usa material con copyright sin permiso.
- [ ] Se usa al menos **un dato o recurso de NASA** (obligatorio para Global Award).

---

## 2. Project page (campos obligatorios)

- [ ] **Project Name**
- [ ] **High-Level Project Summary** (inglés)
- [ ] **Link to Project Demo** (público)
- [ ] **Link to Final Project** (público)
- [ ] **Detailed Project Description** (inglés)
- [ ] **Use of Super Intelligence (SI)** (declaración)
- [ ] **NASA Data** (qué datos, de qué misión)
- [ ] **Space Agency Partner Data and Other References** (todas las fuentes)
- [ ] Checkbox de Terms & Conditions
- [ ] Checkbox de “Confirm All Work is Original”
- [ ] Botón **“Submit for Judging”** (no alcanza con guardar)

---

## 3. Demo

- [ ] Video **≤30 s** **o** deck **≤7 slides** (incluyendo título).
- [ ] Link público (YouTube, Drive, GitHub, etc.) **sin login**.
- [ ] Si el video no está en inglés: **subtítulos en inglés**.
- [ ] Los slides están **en inglés**.
- [ ] Se muestra el producto real (no solo slides).
- [ ] Se explica: challenge, solución, cómo funciona, impacto.
- [ ] Créditos de datos NASA/IRSA.
- [ ] Sin música con copyright.
- [ ] Sin imágenes de menores de 18.
- [ ] Sin logos/branding de NASA en contenido generado.

### Estructura del video (oficial)
| Tiempo | Contenido |
|---|---|
| 0:00 | Nombre + equipo |
| 0:02 | Challenge + inspiración |
| 0:05 | Nombre del proyecto + tagline |
| 0:10 | Cómo funciona + demo + datos NASA |
| 0:20–0:30 | Futuro / impacto |

Ver [07-pitch-30s.md](07-pitch-30s.md).

---

## 4. Links públicos (probar en ventana privada)

- [ ] Demo (video/deck)
- [ ] Sitio web / app
- [ ] Repositorio GitHub
- [ ] Video de respaldo
- [ ] Cualquier dataset o notebook adicional

**Prueba:** abrir cada link en una ventana de incógnito, sin cuenta, desde otro dispositivo. Si pide login, arreglarlo.

---

## 5. Datos NASA (lista para la submission)

Completar:

| Dato/recurso | Misión/archivo | URL | Uso en el proyecto |
|---|---|---|---|
| NASA Human Research Program | HRP | https://www.nasa.gov/hrp/ | Salud, hueso, sueño, visión |
| NASA NTRS | NTRS | https://ntrs.nasa.gov/ | Papers de soporte vital y combustión |
| ISS / ECLSS | NASA | https://www.nasa.gov/international-space-station/ | Atmósfera, agua, oxígeno |
| Artemis | NASA | https://www.nasa.gov/artemis/ | Contexto de misión y Luna |
| NASA Image Library | NASA | https://images.nasa.gov/ | Imágenes de apoyo |

**Regla:** al menos uno debe ser **central** para la solución, no decorativo.

---

## 6. Declaración de IA/SI

Responder:
- ¿Usaron IA? Sí/No.
- ¿Para qué? (código, texto, imágenes, traducción, tests…).
- ¿Qué herramientas? (ChatGPT, Copilot, Claude, etc.).
- ¿Qué partes del proyecto son generadas?
- ¿Hay watermarks en imágenes/videos generados?

**Regla:** la IA no puede “inventar la idea”; se usa como herramienta. La submission no se muestra a los jueces, pero los indicadores en el proyecto sí.

---

## 7. Referencias y créditos

Listar **todo**:
- Código de terceros (Astropy, NumPy, Pillow, React, etc.).
- Datos (NASA HRP, NTRS, ECLSS, Artemis).
- Imágenes (NASA Images, capturas propias).
- Papers o documentación.
- Herramientas de IA.
- Música (si hay, libre de derechos).

**Formato sugerido:**
```text
- NASA Human Research Program. https://www.nasa.gov/hrp/
- NASA Technical Reports Server (NTRS). https://ntrs.nasa.gov/
- NASA — International Space Station / ECLSS. https://www.nasa.gov/international-space-station/
- FastAPI. https://fastapi.tiangolo.com/
- Imagen de portada: NASA (dominio público).
```

---

## 8. Textos listos para copiar/pegar

### High-Level Summary (borrador)
> Mission Trainer is a short, playable trivia that teaches what it takes to keep a lunar outpost alive. Players act as a junior astronaut: every wrong answer shuts down a system (oxygen, power, water, morale) and NASA-sourced explanations show why. In under two minutes, students learn the real constraints of living in space, and leave with a mission report and the systems they should review.

### Detailed Description (borrador)
> Space education is usually reading or watching. Missions are decided by trade-offs, so we built a game where decisions have consequences. Mission Trainer presents 24 questions across six systems — atmosphere, life support, power, health, fire and communications — written from NASA Human Research Program, NTRS, ISS/ECLSS and Artemis material. Each question includes an explanation, the operational consequence of getting it wrong, and a link to the NASA source. Four resources react to the player's answers, and a final mission report assigns a rank and lists the systems to study. The game is a static web client served by FastAPI, with the question bank stored as a validated JSON file, so it runs offline in classrooms with no accounts, no tracking and no build step.

### Use of SI (borrador)
> We used SI tools for code scaffolding, documentation drafting, and translation. All scientific results, data processing, and final decisions were reviewed by the team. SI-generated images (if any) are watermarked. No SI tool was used to generate scientific data or to replace the team's analysis.

> **Ajustar a la verdad.** No declarar herramientas que no se usaron.

---

## 9. Timeline del domingo

| Hora | Acción |
|---|---|
| 12:00 | **Corte de alcance** |
| 13:00 | Congelar código y datos |
| 15:00 | Grabar video / armar deck |
| 17:00 | Ensayo 1 |
| 18:00 | Ensayo 2 + feedback |
| 19:00 | Completar Project page |
| 20:00 | Probar links en incógnito |
| 21:00 | **Submit for Judging** (primera vez) |
| 21:30 | Corregir lo que falte |
| 22:30 | **Submit final** |
| 23:00 | Verificar confirmación |
| 23:59 | Deadline |

**Regla:** enviar temprano. La submission se puede editar y reenviar; lo que cuenta es la última.

---

## 10. Después de enviar

- [ ] Captura de pantalla de la confirmación.
- [ ] Guardar el link de la submission.
- [ ] Verificar que el certificado aparezca en el perfil.
- [ ] Tag `v1.0` en GitHub.
- [ ] Backup del video y los datos.
- [ ] Mensaje de agradecimiento al equipo.
- [ ] Dormir.

---

## 11. Errores que descalifican o restan puntos

- ❌ Pasarse de 30 s o de 7 slides.
- ❌ Link con login/permiso.
- ❌ Submission en español (debe ser inglés; el video puede ser español con subtítulos).
- ❌ No usar datos NASA.
- ❌ No declarar IA.
- ❌ Usar música/imágenes con copyright.
- ❌ Incluir imágenes de menores.
- ❌ No hacer click en “Submit for Judging”.
- ❌ Equipo no registrado en el mismo evento.
- ❌ Más de 6 miembros.
- ❌ Presentar un challenge custom como si fuera oficial.

---

## 12. Checklist final de 10 puntos

1. [ ] Challenge oficial correcto.
2. [ ] Equipo elegible.
3. [ ] Demo ≤30 s / ≤7 slides.
4. [ ] Links públicos.
5. [ ] NASA data central.
6. [ ] SI declarado.
7. [ ] Referencias completas.
8. [ ] Inglés en la submission.
9. [ ] “Submit for Judging” hecho.
10. [ ] Confirmación guardada.
