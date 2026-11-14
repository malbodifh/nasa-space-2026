# 08 — Contenido, datos y consecuencias

> **Regla del equipo:** *si no está documentado, no existe; si no tiene fuente, no entra al juego.*

---

## 1. Contrato de datos del contenido

Cada pregunta de `data/questions.json` debe cumplir:

| Campo | Tipo | Regla |
|---|---|---|
| `id` | string | `categoria-NN`, único |
| `category` | string | una de las 6 del MVP |
| `difficulty` | `facil \| media \| dificil` | 60 / 30 / 10 % del banco |
| `prompt` | string | ≤ 140 caracteres, sin doble negación |
| `options` | string[4] | una correcta, distractores plausibles |
| `answer` | int | 0–3 |
| `explanation` | string | ≤ 240 caracteres, explica el **por qué** |
| `consequence` | string | qué pasa en la misión si fallás |
| `scenario` | string | situación concreta, ≤ 160 caracteres |
| `hook` | string | dato ancla memorable, ≤ 90 caracteres |
| `resource` | `o2 \| energia \| agua \| moral` | recurso que baja |
| `source` | `{title, url}` | NASA/HRP/NTRS obligatorio |
| `tags` | string[] | para filtrar y para el informe |

## 2. Reglas editoriales

1. **Lenguaje de 10–14 años.** Si una palabra técnica aparece, se explica en la misma tarjeta.
2. **Distractores creíbles.** Nada de “la Luna es de queso”.
3. **Sin cifras inventadas.** Si no hay número publicado, la pregunta es conceptual.
4. **Sin política ni opinión.** Solo ciencia y operaciones.
5. **Sin imágenes con copyright.** NASA Image Library o assets propios.

## 3. Mapeo pregunta → recurso

| Categoría | Recurso | Por qué |
|---|---|---|
| Atmósfera | O₂ | Presión y mezcla respirable |
| Soporte vital | Agua | Reciclado y reservas |
| Energía | Energía | Solar, baterías, eclipse |
| Salud | Moral | Sueño, aislamiento, carga física |
| Fuego | O₂ | Consumo y riesgo |
| Comms | Moral | Aislamiento y retraso |
| Entrenamiento | Moral | Confianza y preparación |

## 4. Contrato de la API

| Endpoint | Devuelve | Nunca devuelve |
|---|---|---|
| `GET /api/categories` | lista con nombre y cantidad | — |
| `GET /api/quiz?n=10` | preguntas sin `answer`/`explanation` | la respuesta |
| `POST /api/answer` | `correct`, `scenario`, `explanation`, `consequence`, `hook`, `source` | datos de otros jugadores |
| `GET /api/support` | los 7 partes de misión | — |
| `GET /api/support/{category}` | un parte de misión | — |
| `POST /api/hint` | dos índices incorrectos para descartar | la opción correcta |
| `GET /api/questions` | banco completo (debug) | — |

**Qué puedo afirmar:** el juego enseña conceptos publicados por NASA y cita cada uno.
**Qué NO puedo afirmar:** que el juego reemplace entrenamiento real o que mida aprendizaje
sin un estudio con usuarios.

## 5. Validación de una pregunta (checklist)

- [ ] La afirmación central aparece en la fuente citada.
- [ ] La URL abre sin login.
- [ ] La respuesta correcta no es la más larga ni la única con números.
- [ ] El distractor más elegido enseña algo al explicarse.
- [ ] Un chico de 12 años la entiende (test con 1 persona).
- [ ] El campo `resource` corresponde a la categoría.

## 6. Qué pasa si una fuente se cae

El juego no depende de red: el contenido vive en el JSON. Si una URL muere, se reemplaza
por el PDF de NTRS o por la página de HRP, y se anota en el commit.
