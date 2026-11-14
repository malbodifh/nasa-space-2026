# 03 — Concepto y diseño del juego

> **Producto:** *Mission Trainer — Trivia de Astronauta Junior*
> Una trivia con narrativa de misión, consecuencias reales y fuente NASA en cada respuesta.

---

## 1. Fantasía

Sos **cadete** en el puesto lunar **Artemis Outpost**. Durante 10 turnos tomás decisiones
que mantienen vivo el puesto. No competís contra otros: competís contra los sistemas que
se apagan si te equivocás.

## 2. Bucle de juego

```text
Pregunta → elegís opción → feedback inmediato (correcto / consecuencia)
        → se actualiza un recurso → siguiente pregunta → informe final
```

- **5 s** para leer la pregunta, sin cronómetro agresivo (es educación, no eSports).
- Feedback en **dos capas**: “qué pasó” y “por qué” (cita NASA + link).
- Nunca se pierde por una sola respuesta: se pierde el rango, no la partida.

## 3. Recursos (barra superior)

| Recurso | Qué representa | Baja cuando fallás |
|---|---|---|
| **O₂** | Soporte vital | Preguntas de atmósfera/ECLSS |
| **Energía** | Solar + baterías | Preguntas de potencia y eclipse lunar |
| **Agua** | Reciclado y reserva | Preguntas de ECLSS y reciclaje |
| **Moral** | Salud mental y sueño | Preguntas de HRP, aislamiento, ritmo circadiano |

Si un recurso llega a 0, se dispara un **evento de emergencia** (una pregunta extra), no un game over.

## 4. Categorías y rondas

| # | Ronda | Categoría | Ejemplo de pregunta |
|---|---|---|---|
| 1 | Lanzamiento | Vehículo y escape | ¿Qué hace el sistema de escape de la cápsula? |
| 2 | Tránsito | Radiación | ¿Por qué el agua es buen escudo? |
| 3 | Llegada | Atmósfera | ¿Qué mezcla se respira en la ISS? |
| 4 | Vida | Soporte vital | ¿Cuánta agua se recicla en la ISS? |
| 5 | Energía | Potencia | ¿Cuánto dura la noche lunar? |
| 6 | Cuerpo | Salud | ¿Qué le pasa al hueso en microgravedad? |
| 7 | Comida | Nutrición | ¿Por qué no hay migas? |
| 8 | Fuego | Seguridad | ¿Cómo es una llama en microgravedad? |
| 9 | Comms | Latencia | ¿Cuánto tarda una señal a Marte? |
| 10 | Regreso | Reentrada | ¿Qué protege la cápsula al volver? |

El MVP implementa **6 categorías** (3 a 8) y deja el resto como P1.

## 5. Puntaje y rangos

```text
acierto = 100 pts
acierto con racha de 3+ = 100 + 25 * racha
error = 0 pts y -10 al recurso de la categoría
```

| Rango | Aciertos | Mensaje |
|---|---|---|
| **Cadete** | 0–5 | “Todo astronauta empieza acá.” |
| **Especialista** | 6–11 | “Ya podés cuidar un sistema.” |
| **Oficial de misión** | 12–17 | “El puesto confía en vos.” |
| **Comandante** | 18–24 | “Listo para Artemis.” |

## 6. Informe de misión (final)

- Rango + puntaje + racha máxima.
- **Sistemas que fallaste** y las 2 preguntas para repasar.
- Una **tarjeta compartible** (imagen/URL con el resultado).
- Botón “jugar otra misión” con preguntas mezcladas.

## 7. Accesibilidad y edad

- Texto ≥ 16 px, contraste AA, sin dependencia de color solamente (íconos + texto).
- Lenguaje de 10–14 años; los términos técnicos se explican en la misma tarjeta.
- Navegable con teclado (1–4 y Enter) y en móvil.
- Sin registro, sin datos personales, sin publicidad.

## 8. Qué NO es

- No es un examen: no hay nota ni vergüenza pública.
- No es un juego de reflejos: el tiempo no penaliza.
- No inventa ciencia: si no hay fuente, la pregunta no entra.
