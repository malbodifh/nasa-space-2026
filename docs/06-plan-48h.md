# 06 — Plan de 48 horas

> **Evento:** sábado 14 y domingo 15 de noviembre de 2026.
> **Entrega:** domingo 15/11 a las **23:59 hora local**.
> **Regla:** el demo corre **sin internet**, sin login y sin `npm`.

---

## 1. Objetivo del fin de semana

Tener una **trivia jugable de astronauta junior** con:

- 32 preguntas en 7 categorías, cada una con fuente NASA.
- 4 recursos que reaccionan a los errores.
- Feedback con explicación, consecuencia y link a la fuente.
- Informe de misión con rango y sistema para repasar.
- Deploy público y video de 30 s.

**No objetivo:** multijugador, cuentas, ranking global, 3D, adaptatividad.

---

## 2. Hitos

| Hito | Qué significa | Criterio de éxito | Hora límite |
|---|---|---|---|
| **M0** | Decisión + repo + ramas | Reto elegido, repo operativo | Sábado 12:00 |
| **M1** | Banco de preguntas | 32 preguntas validadas por `make check` | Sábado 15:00 |
| **M2** | Juego jugable | 10 preguntas, recursos y feedback en el navegador | Sábado 20:00 |
| **M3** | Informe + pulido | Rango, repaso y móvil | Domingo 10:00 |
| **M4** | Deploy + video | Link público + video de 30 s | Domingo 14:00 |
| **M5** | Freeze + submission | Sin features nuevas; submission enviada | Domingo 20:00 |

---

## 3. Cronograma

| Franja | Foco | Entregable |
|---|---|---|
| Sáb 09–12 | Fundación | Reto, roles, ramas, banco inicial |
| Sáb 12–18 | Contenido + API | `questions.json`, `/api/quiz`, `/api/answer` |
| Sáb 18–23 | Juego | Pantalla de juego, recursos, feedback |
| Dom 08–12 | Informe y pulido | Rango, accesibilidad, móvil |
| Dom 12–16 | Freeze | Deploy, bugs, video de 30 s |
| Dom 16–20 | Ensayo + entrega | 2 ensayos, submission en inglés |
| Dom 20–23:59 | Buffer | Solo corregir, no agregar |

---

## 4. Roles

| Persona | Foco |
|---|---|
| **Andy** | Lead, integración, submission, pitch |
| **David** | Backend, API, deploy, CI |
| **Samuel** | Frontend: juego, feedback, móvil |
| **Jorge** | Ciencia: preguntas, fuentes, validación |
| **Leo** | Diseño, video, subtítulos, deck |

---

## 5. Flujo del demo (30 s)

```text
Inicio → "Iniciar misión" → pregunta → respuesta incorrecta
      → baja un recurso → explicación + fuente NASA
      → informe con rango → URL
```

---

## 6. Checkpoints que no se negocian

| Cuándo | Pregunta | Si la respuesta es “no” |
|---|---|---|
| Sáb 15:00 | ¿Hay 32 preguntas validadas? | Recortar a 12 y seguir |
| Sáb 21:00 | ¿Se puede jugar una partida completa? | Congelar contenido, arreglar flujo |
| Dom 12:00 | ¿Funciona sin internet y en móvil? | Grabar video de respaldo ya |
| Dom 16:00 | ¿El pitch se entiende en 30 s? | Reescribir guion, no agregar features |
| Dom 19:00 | ¿La submission está completa? | Enviar temprano, corregir después |

---

## 7. Camino crítico

```text
questions.json → API → pantalla de juego → informe → deploy → video
```

Si algo se atrasa, se recorta el bonus (más categorías, animaciones, ranking),
nunca el camino crítico.
