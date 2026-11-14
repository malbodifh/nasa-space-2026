# 17 — Rúbrica y prioridades

> **Rúbrica oficial 2026:** Impacto 30% · Creatividad 20% · Viabilidad 20% · Prototipo & MVP 20% · Presentación 10%.
> **Objetivo:** no optimizar para “lo que nos gusta”, sino para **lo que el jurado puntúa**.

---

## 1. La rúbrica, traducida a decisiones

| Criterio | Peso | La pregunta real | Nuestra respuesta |
|---|---|---|---|
| **Impacto** | 30% | ¿A quién ayuda y cuánto? | Ciencia ciudadana, educación, investigadores; 1B+ objetos; 102 bandas |
| **Creatividad** | 20% | ¿Es nuevo o una mejora incremental? | Combinación única: blink + diferencia + 102 bandas + espectro + candidatos |
| **Viabilidad** | 20% | ¿Funciona de verdad? | Datos reales, pipeline probado, caché/fallback, límites honestos |
| **Prototipo & MVP** | 20% | ¿Qué tan avanzado está? | 5 targets, blink, diff, slider, ficha, deploy |
| **Presentación** | 10% | ¿Se entiende y emociona? | Video 30 s, storyboard, subtítulos, ensayo |

**Lectura:** el 80% del score está en Impacto + Creatividad + Viabilidad + Prototipo. La presentación es el 10%, pero **sin ella no se entiende el 90%**.

---

## 2. Autoevaluación

Escala 1–5. `Actual` = hoy; `Objetivo` = antes de la submission.

| Criterio | Peso | Actual | Objetivo | Gap / acción |
|---|---|---|---|---|
| Impacto | 30% | 4 | 5 | Test con 3 usuarios + narrativa de ciencia ciudadana |
| Creatividad | 20% | 4 | 4 | Mostrar la combinación, no una feature suelta |
| Viabilidad | 20% | 4 | 4 | Demo en vivo + fallback + límites honestos |
| Prototipo & MVP | 20% | 3 | 4 | Deploy + diff + 102 bandas + ficha |
| Presentación | 10% | 3 | 5 | Video 30 s, subtítulos, 2 ensayos |
| **Total ponderado** | 100% | **3.7 / 5 (74/100)** | **4.4 / 5 (88/100)** | — |

### Cálculo
```text
Actual:   4*.30 + 4*.20 + 4*.20 + 3*.20 + 3*.10 = 3.70 / 5 = 74/100
Objetivo: 5*.30 + 4*.20 + 4*.20 + 4*.20 + 5*.10 = 4.40 / 5 = 88/100
```

---

## 3. Prioridades por criterio

### Impacto (30%)
- [ ] 5 targets precomputados (no solo 1).
- [ ] Mensaje: “cualquiera puede ayudar a descubrir”.
- [ ] Test con 3 personas: ¿entienden qué hace en 30 s?
- [ ] Métrica: tiempo hasta el primer “cambio” encontrado.
- [ ] Créditos NASA/IRSA y límites honestos.

### Creatividad (20%)
- [ ] La demo muestra **la combinación**: blink → diferencia → 102 bandas → candidato.
- [ ] No es “otro Aladin”: es un flujo guiado.
- [ ] Una frase de posicionamiento: “el Backyard Worlds de SPHEREx”.
- [ ] Un detalle memorable: slider 102 bandas o trayectoria de centroides.

### Viabilidad (20%)
- [ ] Datos reales, no mock.
- [ ] Pipeline reproducible (`make precompute`).
- [ ] Fallback si IRSA falla (caché/CSV).
- [ ] No prometer lo que no tenemos (Rubin, Gaia, exoplanetas).
- [ ] Mostrar arquitectura simple en una slide.

### Prototipo & MVP (20%)
- [ ] Blink funcional.
- [ ] Modo diferencia.
- [ ] Slider 102 bandas.
- [ ] Ficha de objeto.
- [ ] URL compartible.
- [ ] Deploy público.
- [ ] Video de respaldo.

### Presentación (10%)
- [ ] Guion de 30 s aprobado.
- [ ] Subtítulos en inglés.
- [ ] 2 ensayos completos.
- [ ] Deck de 7 slides de respaldo.
- [ ] Links públicos probados en incógnito.

---

## 4. Cómo se reparte el pitch de 30 s según la rúbrica

| Tiempo | Contenido | Criterio que empuja |
|---|---|---|
| 0:00–0:05 | Hook + problema (1B objetos, 102 bandas, nadie puede mirar a mano) | **Impacto 30%** |
| 0:05–0:10 | Nombre + tagline + “el Backyard Worlds de SPHEREx” | **Creatividad 20%** |
| 0:10–0:20 | Demo: coordenada → blink → diferencia → 102 bandas → candidato | **Prototipo 20% + Viabilidad 20%** |
| 0:20–0:27 | Impacto: ciencia ciudadana, educación, descubrimiento | **Impacto 30%** |
| 0:27–0:30 | Cierre memorable + créditos | **Presentación 10%** |

**Regla:** 10 de los 30 segundos son demo pura. El jurado tiene que **ver** el producto.

---

## 5. Evidencia que hay que juntar (para el jurado)

- [ ] Capturas/GIF del blink, la diferencia y el slider.
- [ ] 5 targets funcionando.
- [ ] Link público del demo.
- [ ] Video de 30 s con subtítulos.
- [ ] Deck de 7 slides.
- [ ] Test con 3 usuarios (qué entendieron, cuánto tardaron).
- [ ] Métricas: targets, frames, bandas, tiempo de carga.
- [ ] Arquitectura en 1 slide.
- [ ] Referencias y créditos.
- [ ] Declaración de IA/SI.
- [ ] Límites: “no detectamos planetas; marcamos candidatos”.

---

## 6. Qué NO hacer

- ❌ Empezar el pitch con “usamos React/FastAPI”.
- ❌ Mostrar código o arquitectura antes del problema.
- ❌ Decir “descubrimos” sin validación.
- ❌ Prometer Rubin/Gaia/exoplanetas.
- ❌ Pasarse de 30 s o 7 slides.
- ❌ Depender de IRSA en vivo.
- ❌ Música con copyright.
- ❌ Leer el guion mirando el papel.

---

## 7. Checkpoint diario de rúbrica

| Día | Pregunta | Si la respuesta es “no” |
|---|---|---|
| Sábado 15:00 | ¿El blink funciona con 1 target? | Recortar features, priorizar pipeline |
| Sábado 21:00 | ¿Hay 3 targets? | Congelar UI, enfocar datos |
| Domingo 10:00 | ¿Hay 5 targets + diff? | Recortar 102 bandas a “bonus” |
| Domingo 12:00 | ¿El demo funciona sin internet? | Grabar video de respaldo ya |
| Domingo 16:00 | ¿El pitch se entiende en 30 s? | Reescribir hook, no agregar features |
| Domingo 19:00 | ¿La submission está completa? | Enviar temprano, corregir después |

---

## 8. Enlaces

- [Benchmark de herramientas parecidas](16-benchmark.md)
- [Pitch de 30 s](07-pitch-30s.md)
- [Plan de 48 h](06-plan-48h.md)
- [Checklist de submission](10-submission-checklist.md)
- [Workflow](18-workflow.md)
