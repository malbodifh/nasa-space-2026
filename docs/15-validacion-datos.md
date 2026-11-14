# 15 — Validación del contenido

> Acá no validamos imágenes del cielo: validamos **preguntas**.
> Una pregunta sin fuente verificada no entra al juego.

---

## 1. Proceso (6 pasos, ~5 min por pregunta)

1. **Elegir un hecho** de una fuente NASA (HRP, NTRS, ECLSS, Artemis).
2. **Escribir la pregunta** con lenguaje de 10–14 años.
3. **Escribir 3 distractores** plausibles, no absurdos.
4. **Citar la fuente exacta** (título + URL) y abrirla para confirmar.
5. **Probar con una persona** que no sea del equipo: ¿entiende qué se pregunta?
6. **Validar el JSON** con el script (`make check` lo hace por vos).

## 2. Automatización

`tests/test_quiz.py` verifica:

- todos los `id` son únicos;
- `options` tiene exactamente 4 y `answer` está en rango;
- `category` y `resource` pertenecen al conjunto permitido;
- `source.url` empieza con `https://` y contiene `nasa.gov`, `nasa.gov`/NTRS o `hrp`;
- `explanation` ≤ 240 caracteres y `prompt` ≤ 140.

Lo que **no** automatizamos: si la ciencia es correcta. Eso lo firma una persona.

## 3. Evidencia para el jurado

- `data/questions.json` con 24 preguntas y su fuente.
- Tabla de cobertura por categoría (6 × 4).
- Captura del test con 1 usuario externo.
- Registro de preguntas descartadas y por qué (en el commit).

## 4. Estado actual

| Categoría | Preguntas | Fuente principal | Estado |
|---|---|---|---|
| Atmósfera | 4 | ISS ECLSS / NASA | ✅ |
| Soporte vital | 4 | BVAD / ECLSS | ✅ |
| Energía | 4 | NASA Moon / Artemis | ✅ |
| Salud | 4 | NASA HRP | ✅ |
| Fuego | 4 | NTRS (combustión en µg) | ✅ |
| Comms | 4 | NASA/JPL | ✅ |

**Total: 24.** Cada una con `explanation`, `consequence` y `source`.

## 5. Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| Cifra desactualizada | Se cita el documento, no “la NASA dice” |
| Fuente caída | Fallback a PDF de NTRS o página de HRP |
| Pregunta ambigua | Test con 1 persona externa antes de mergear |
| Sesgo cultural | Ejemplos neutros, sin unidades imperiales |
