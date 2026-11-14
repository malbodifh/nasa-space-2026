# 05 — Arquitectura

> **Objetivo:** demo que funciona **sin internet**, sin login y sin build step.
> Si el jurado abre un link, tiene que poder jugar en menos de 3 segundos.

---

## 1. Vista general

```text
Navegador
  ├── HTML + CSS + JS (vanilla, sin build)
  └── fetch → FastAPI
                ├── /api/health
                ├── /api/categories
                ├── /api/quiz?n=10        (preguntas mezcladas, sin respuestas)
                ├── /api/answer           (valida y devuelve explicación + fuente)
                └── /api/questions        (banco completo, para debug)
                        │
                        └── data/questions.json   (fuente única de contenido)
```

## 2. Por qué así

| Decisión | Motivo |
|---|---|
| **FastAPI** | Ya estaba probado en el repo; cero fricción |
| **Frontend estático** | `npm` no está instalado; un build bloquea el demo |
| **JSON en disco** | 32 preguntas no necesitan base de datos |
| **Validación en servidor** | El cliente nunca recibe la respuesta correcta antes de responder |
| **Sin frameworks JS** | Menos superficie de error en 48 h |

## 3. Estructura de archivos

```text
data/questions.json              banco de preguntas (contrato en docs/04)
src/backend/app/main.py          API + montaje del frontend
src/backend/app/quiz.py          lógica: filtrar, mezclar, validar, puntuar
src/backend/static/index.html    pantalla de juego
src/backend/static/app.js        estado, fetch, render
src/backend/static/styles.css    tema visual
tests/test_quiz.py               contrato del banco + endpoints
```

## 4. Flujo de una partida

1. El cliente pide `/api/quiz?n=10` → recibe preguntas **sin** `answer` ni `explanation`.
2. Al elegir, hace `POST /api/answer {id, choice}`.
3. El servidor responde `{correct, explanation, consequence, source, resource}`.
4. El cliente actualiza recursos y racha.
5. Al terminar, el informe se calcula en el cliente; el servidor no guarda nada.

## 5. Estado (cliente)

```js
{
  questions: [],      // 10 preguntas de la partida
  index: 0,
  score: 0,
  streak: 0,
  resources: { o2: 100, energia: 100, agua: 100, moral: 100 },
  answers: []         // {id, correct, category, resource}
}
```

Sin `localStorage` obligatorio: si el usuario recarga, empieza de nuevo (decisión consciente).

## 6. Despliegue

| Opción | Costo | Nota |
|---|---|---|
| **FastAPI + StaticFiles** (elegida) | 0 | Un solo proceso, un solo link |
| Vercel (frontend) + Render (API) | 0 | Más pasos, más latencia |
| Archivo HTML autocontenido | 0 | Plan B si falla el hosting |

Plan B: si no hay deploy, se abre `index.html` local en la demo y se muestra igual.

## 7. Límites honestos

- No hay autenticación ni persistencia: no se pueden prometer rankings.
- El banco es finito (32 preguntas). No es adaptativo.
- No hay validación científica automática: la hace una persona con checklist.
