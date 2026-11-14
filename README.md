# Mission Trainer — Astral Codes

**Trivia educativa de astronauta junior para NASA Space Apps Challenge 2026.**

**Equipo:** Andy, David, Samuel, Jorge, Leo
**Challenge:** [Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/build-a-junior-astronaut-mission-trainer/)
**Repo:** [malbodifh/nasa-space-2026](https://github.com/malbodifh/nasa-space-2026)

> Sos cadete en un puesto lunar. Cada error apaga un sistema y la NASA te explica por qué.
> Al final, tu informe de misión.

---

## Jugarlo

```bash
make backend      # http://localhost:8000
```

No necesita `npm`, ni base de datos, ni internet.

## Qué hace

- **24 preguntas** en 6 categorías: atmósfera, soporte vital, energía, salud, fuego y comunicaciones.
- **4 recursos** (O₂, energía, agua, moral) que bajan con cada error.
- **Explicación + consecuencia + fuente NASA** en cada respuesta.
- **Informe final** con rango (Cadete → Comandante) y sistemas para repasar.
- Funciona **offline** y sin registro.

## Comandos

```bash
make backend     # servidor + juego
make check       # ruff + pytest (lo mismo que CI)
make guides      # compila las guías Typst a PDF
make branches    # crea las ramas del equipo si faltan
make sync        # actualiza main/develop/staging
```

## Estructura

```text
data/questions.json      banco de preguntas (fuente NASA obligatoria)
src/backend/app/         API FastAPI (quiz, answer, categories)
src/backend/static/      juego: HTML + CSS + JS sin build
docs/                    especificación, datos, plan y bitácora
guides/                  guías visuales en Typst
backups/ideas/spherex/   idea anterior, archivada
```

## Ramas

```text
main        producción (solo merge desde staging)
  ↑
staging     puente de integración / pre-producción
  ↑
develop     desarrollo diario
  ↑
andy · david · samuel · jorge · leo    rama personal
```

Detalle y recuperación ante errores en [`docs/18-workflow.md`](docs/18-workflow.md).

## Empezar a leer

1. [`documentacion.md`](documentacion.md) — índice y fuente única de verdad.
2. [`docs/01-decision-challenge.md`](docs/01-decision-challenge.md) — por qué este reto.
3. [`docs/03-concepto-trivia.md`](docs/03-concepto-trivia.md) — cómo se juega.
4. [`docs/05-arquitectura.md`](docs/05-arquitectura.md) — cómo está hecho.
5. [`CONTRIBUTING.md`](CONTRIBUTING.md) — cómo contribuir.

## Créditos

Datos y referencias: NASA (HRP, NTRS, ECLSS, Artemis). NASA no respalda este proyecto.
