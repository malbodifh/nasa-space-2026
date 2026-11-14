# 01 — Decisión del reto

> **Decisión:** reto **#3 Build a Junior Astronaut Mission Trainer**, implementado como
> **trivia educativa con consecuencias y fuentes NASA**.
> Fecha: 14/11/2026 · Equipo: Astral Codes.

---

## 1. El reto, en una frase

Diseñar una experiencia que enseñe **qué implica sobrevivir y trabajar en el espacio**
—soporte vital, energía, radiación, salud, comida, emergencias— a chicos que sueñan con
ser astronautas.

## 2. Nuestra interpretación

No es un curso ni un simulador físico. Es una **trivia con narrativa de misión**:

- Sos **cadete** en un puesto lunar.
- Cada respuesta correcta **mantiene un sistema vivo** (O2, energía, agua, comida).
- Cada error **tiene una consecuencia** y muestra **por qué** (con cita NASA).
- Al final recibís un **informe de misión**: rango, sistemas que fallaste y qué estudiar.

**Frase de posicionamiento:** *“La trivia donde equivocarte te enseña por qué.”*

## 3. Por qué este reto y no SPHEREx

| Criterio | SPHEREx (descartado) | Trivia Junior Astronaut |
|---|---|---|
| Demo en 30 s | Difícil: hay que explicar el dato | **Inmediato**: se juega en vivo |
| Dependencia de APIs | Alta (IRSA devolvió 502) | **Ninguna en vivo** |
| Impacto educativo | Medio (público científico) | **Alto** (escuelas, familias) |
| Riesgo técnico | Alto (FITS, alineación, WCS) | **Bajo** (web, JSON) |
| Creatividad | Media (visor más) | **Alta** (consecuencias + citas) |

El trabajo de SPHEREx quedó archivado en [`backups/ideas/spherex/`](../backups/ideas/spherex/README.md).

## 4. Alcance del MVP

**Sí entra:**
- 1 escenario: **puesto lunar Artemis**.
- 6 categorías × 4 preguntas = **24 preguntas**.
- Barra de recursos (O2, energía, agua, moral) que baja con los errores.
- Explicación + fuente NASA en **cada** respuesta.
- Informe final con rango y tarjeta compartible.
- Funciona **offline** (sin red, sin login).

**No entra:**
- Multijugador online.
- Cuentas, ranking global, base de datos.
- 3D, modelos físicos, simulación de fluidos.
- Contenido en inglés dentro del juego (sí en subtítulos del video).

## 5. Criterios de éxito

1. Un chico de 10 años entiende la primera pregunta sin ayuda.
2. El jurado completa 3 preguntas en menos de 30 s durante el demo.
3. Cada respuesta puede rastrearse a una fuente NASA.
4. El juego corre desde un archivo local, sin internet.

## 6. Decision Log relacionado

| Fecha | Decisión | Motivo |
|---|---|---|
| 14/11 | Elegir reto #3 (trivia) | Mejor demo, menor riesgo, mayor impacto |
| 14/11 | Archivar SPHEREx en `backups/ideas/` | No borrar trabajo; permite volver |
| 14/11 | Frontend estático sin build | `npm` no está disponible; demo primero |
