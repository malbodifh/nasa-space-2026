# Documentación — Astral Codes / NASA Space Apps Challenge 2026

> **Este archivo es la fuente única de verdad del equipo.**
> Si algo no está acá, no existe. Si cambia una decisión, se actualiza acá el mismo día.
> Última actualización: **2026-11-14**.

---

## 1. Datos del equipo

| Campo | Valor |
|---|---|
| Equipo | **Astral Codes** |
| Evento | NASA Space Apps Challenge 2026 — **14 y 15 de noviembre de 2026** |
| Integrantes | Andy, David, Samuel, Jorge, Leo |
| Challenge | **#3 Build a Junior Astronaut Mission Trainer** — formato trivia |
| Producto | **Mission Trainer** — “la trivia donde equivocarte te enseña por qué” |
| Repo | [malbodifh/nasa-space-2026](https://github.com/malbodifh/nasa-space-2026) |
| Deploy | *(pendiente)* |
| Entrega | Domingo 15/11/2026, **23:59 hora local del evento** |

### Enlaces rápidos
- [Reglas y organización del equipo](docs/00-equipo-y-reglas.md)
- [Decisión del challenge](docs/01-decision-challenge.md)
- [Los 14 challenges 2026 traducidos](docs/02-challenges-2026.md)
- [Concepto y diseño del juego](docs/03-concepto-trivia.md)
- [Datos y fuentes NASA](docs/04-datos-nasa.md)
- [Arquitectura](docs/05-arquitectura.md)
- [Plan de 48 horas](docs/06-plan-48h.md)
- [Pitch de 30 segundos](docs/07-pitch-30s.md)
- [Contenido, datos y consecuencias](docs/08-contenido-y-datos.md)
- [¿Existe un “Custom Challenge”?](docs/09-custom-challenge.md)
- [Checklist de entrega](docs/10-submission-checklist.md)
- [Fuentes y enlaces](docs/11-fuentes.md)
- [Onboarding en 30 minutos](docs/12-onboarding.md)
- [Glosario](docs/13-glosario.md)
- [Backlog de tareas](docs/14-backlog.md)
- [Validación del contenido](docs/15-validacion-datos.md)
- [Benchmark](docs/16-benchmark.md)
- [Rúbrica y prioridades](docs/17-rubrica-y-prioridades.md)
- [Workflow del equipo](docs/18-workflow.md)
- [Herramientas del repo](docs/19-herramientas.md)
- [14 ideas creativas — una por reto](docs/20-ideas-creativas.md)
- [Banco de preguntas](docs/21-banco-preguntas.md)
- [Bitácora del día](docs/bitacora/2026-11-14.md)
- [Backup de la idea descartada (SPHEREx)](backups/ideas/spherex/README.md)

### Guías visuales (PDF)
- [Rúbrica — cómo ganar](guides/dist/01-rubrica.pdf)
- [Plan 48 h — quién hace qué](guides/dist/03-plan-48h.pdf)
- [Ideas — 14 retos en una página](guides/dist/05-ideas.pdf)

---

## 2. Regla de oro

**Un challenge. Un repositorio. Un documento. Un demo que funcione.**

No se trabaja en paralelo sobre ideas distintas. No se agregan features después del corte de alcance. No se suben datos pesados ni claves al repo. Todo cambio importante se registra en la bitácora.

---

## 3. Estructura de carpetas

```text
NASA SPACEAPPS/
├── README.md                  # entrada rápida al repo
├── AGENTS.md                  # contexto para sesiones de IA
├── CONTRIBUTING.md            # cómo contribuir
├── Makefile                   # comandos del equipo
├── pyproject.toml             # config de Ruff/Pytest
├── documentacion.md           # ESTE archivo: índice + bitácora + decisiones
├── .github/                   # CI + plantillas de issues/PR
├── guides/                    # fuentes Typst + PDF
├── backups/ideas/spherex/     # idea descartada, archivada
├── docs/                      # documentación del equipo
│   ├── 00-equipo-y-reglas.md
│   ├── 01-decision-challenge.md
│   ├── 02-challenges-2026.md
│   ├── 03-concepto-trivia.md
│   ├── 04-datos-nasa.md
│   ├── 05-arquitectura.md
│   ├── 06-plan-48h.md
│   ├── 07-pitch-30s.md
│   ├── 08-contenido-y-datos.md
│   ├── 09-custom-challenge.md
│   ├── 10-submission-checklist.md
│   ├── 11-fuentes.md
│   ├── 12-onboarding.md
│   ├── 13-glosario.md
│   ├── 14-backlog.md
│   ├── 15-validacion-datos.md
│   ├── 16-benchmark.md
│   ├── 17-rubrica-y-prioridades.md
│   ├── 18-workflow.md
│   ├── 19-herramientas.md
│   ├── 20-ideas-creativas.md
│   ├── 21-banco-preguntas.md
│   └── bitacora/
├── src/backend/
│   ├── app/                   # FastAPI: main.py, quiz.py
│   └── static/                # juego: index.html, app.js, styles.css
├── data/questions.json        # banco de 24 preguntas (contrato en docs/08)
├── tests/                     # contrato del banco + endpoints
└── .venv/                     # entorno local (gitignored)
```

---

## 4. Decisiones tomadas (Decision Log)

| Fecha | Decisión | Alternativas | Dueño | Estado |
|---|---|---|---|---|
| 2026-11-14 | Recomendar **Planet X and SPHEREx** | Otros retos | Andy | **Reemplazada** |
| 2026-11-14 | No ir por “Create Your Own Challenge” si queremos Global Judging | Custom challenge local | Andy | **Aprobada** |
| 2026-11-14 | **Elegir reto #3 Junior Astronaut Trainer en formato trivia** | SPHEREx, Martian Map, Earth Jukebox | Equipo | **Aprobada** |
| 2026-11-14 | Archivar SPHEREx en `backups/ideas/` en vez de borrar | Borrar, dejar todo mezclado | Andy | **Aprobada** |
| 2026-11-14 | Frontend estático servido por FastAPI, sin `npm` | React + Vite, archivo HTML suelto | David | **Aprobada** |
| 2026-11-14 | Contenido en `data/questions.json` con fuente NASA obligatoria | Base de datos, CMS | Jorge | **Aprobada** |

---

## 5. Bitácora (resumen)

### 2026-11-14 — Día 1
- Se revisaron los 14 challenges oficiales 2026 y se descartó “Create Your Own Challenge” para Global Judging.
- Se validó el pipeline de SPHEREx (SIA2 + cutouts + alineación) y se archivó en `backups/ideas/spherex/`.
- **Decisión: reto #3 Junior Astronaut Mission Trainer, en formato trivia.**
- Se armó el banco de 24 preguntas con fuente NASA, la API y un frontend jugable sin `npm`.
- Pendiente: roles, deploy, video de 30 s y submission.

Detalle completo en [docs/bitacora/2026-11-14.md](docs/bitacora/2026-11-14.md).

---

## 6. Cómo se actualiza este documento

1. **Cada standup** (10 min): se agrega una línea a la bitácora con qué se hizo, qué sigue y qué bloquea.
2. **Cada decisión**: se agrega una fila al Decision Log con fecha, dueño y estado.
3. **Cada cambio de alcance**: se anota y se avisa en el canal del equipo.
4. **Antes de dormir**: se actualiza el estado y se deja `main` funcionando.
5. **Antes de entregar**: se completa el [checklist](docs/10-submission-checklist.md).

---

## 7. Reglas mínimas

1. **Un solo challenge** y un solo repositorio.
2. **`main` siempre funciona**; se trabaja en ramas personales (`andy`, `david`, …).
3. **Nadie mergea sin avisar**; PRs chicos y rápidos.
4. **Standup de 10 min** a las 9:00 y a las 21:00.
5. **Bloqueo de 30 min**: si no avanzás, pedí ayuda.
6. **Timebox de 2 h** para cualquier spike técnico.
7. **Datos pesados fuera del repo**: `data/cache/` y `*.fits` están gitignored.
8. **Secretos fuera del repo**: `.env` y claves nunca se commitean.
9. **Ciencia honesta**: cada respuesta cita una fuente; no se inventan cifras.
10. **IA se declara**: si se usa para código, texto o imágenes, se anota.
11. **Corte de alcance a T-12 h.**
12. **Dormir es parte del plan.**

---

## 8. Estado actual del proyecto

| Área | Estado | Nota |
|---|---|---|
| Challenge | 🟢 Decidido | #3 Junior Astronaut Trainer (trivia) |
| Docs | 🟢 Actualizadas | 21 documentos + guías visuales |
| Equipo/roles | 🟡 Parcial | Falta confirmar disponibilidad |
| Repo | 🟢 Operativo | 8 ramas, CI activo en `main` |
| Contenido | 🟢 24 preguntas | 6 categorías × 4, con fuente |
| Backend | 🟢 Funcional | `/api/quiz`, `/api/answer`, `/api/categories` |
| Frontend | 🟢 Jugable | HTML+JS estático, verificado en navegador |
| Deploy | 🔴 Pendiente | — |
| Pitch | 🟡 Guion listo | Falta grabar |
| Submission | 🔴 Pendiente | Deadline domingo 23:59 |

**Leyenda:** 🟢 listo · 🟡 en progreso · 🔴 pendiente · ⚫ bloqueado.
