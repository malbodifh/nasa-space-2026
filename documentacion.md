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
| Challenge | **Propuesta: Planet X and SPHEREx** (pendiente de voto del equipo) |
| Estado | Día 1 — investigación y decisión |
| Repo | *(completar cuando se cree el repositorio)* |
| Deploy | *(completar)* |
| Entrega | Domingo 15/11/2026, **23:59 hora local del evento** |

### Enlaces rápidos
- [Reglas y organización del equipo](docs/00-equipo-y-reglas.md)
- [Decisión del challenge](docs/01-decision-challenge.md)
- [Los 14 challenges 2026 traducidos](docs/02-challenges-2026.md)
- [SPHEREx: guía técnica](docs/03-spherex-tecnico.md)
- [APIs: qué hace cada una](docs/04-apis.md)
- [Arquitectura del prototipo](docs/05-arquitectura.md)
- [Plan de 48 horas](docs/06-plan-48h.md)
- [Pitch de 30 segundos](docs/07-pitch-30s.md)
- [Problemas de astrofísica y ciencia](docs/08-problemas-astrofisica.md)
- [¿Existe un “Custom Challenge”?](docs/09-custom-challenge.md)
- [Checklist de entrega](docs/10-submission-checklist.md)
- [Fuentes y enlaces](docs/11-fuentes.md)
- [Onboarding en 30 minutos](docs/12-onboarding.md)
- [Glosario](docs/13-glosario.md)
- [Backlog de tareas](docs/14-backlog.md)
- [Validación de datos (PoC)](docs/15-validacion-datos.md)
- [Benchmark de herramientas parecidas](docs/16-benchmark.md)
- [Rúbrica y prioridades](docs/17-rubrica-y-prioridades.md)
- [Workflow del equipo](docs/18-workflow.md)
- [Herramientas del repo](docs/19-herramientas.md)
- [14 ideas creativas — una por reto](docs/20-ideas-creativas.md)
- [Bitácora del día](docs/bitacora/2026-11-14.md)

### Guías visuales (PDF/PNG)
- [Rúbrica — cómo ganar](guides/dist/01-rubrica.pdf)
- [Benchmark — qué existe y nuestro hueco](guides/dist/02-benchmark.pdf)
- [Plan 48 h — quién hace qué](guides/dist/03-plan-48h.pdf)
- [Pitch — storyboard de 30 s](guides/dist/04-pitch.pdf)

---

## 2. Regla de oro

**Un challenge. Un repositorio. Un documento. Un demo que funcione.**

No se trabaja en paralelo sobre ideas distintas. No se agregan features después del corte de alcance. No se suben datos pesados ni claves al repo. Todo cambio importante se registra en la bitácora.

---

## 3. Estructura de carpetas

```text
NASA SPACEAPPS/
├── README.md                  # entrada rápida al repo
├── CONTRIBUTING.md            # cómo contribuir
├── Makefile                   # comandos del equipo
├── pyproject.toml             # config de Ruff/Pytest
├── requirements-dev.txt
├── documentacion.md           # ESTE archivo: índice + bitácora + decisiones
├── .gitignore
├── .github/                   # CI + plantillas de issues/PR
├── guides/                    # fuentes Typst + PDF/PNG
├── tests/                     # tests del backend
├── docs/                      # documentación del equipo
│   ├── 00-equipo-y-reglas.md
│   ├── 01-decision-challenge.md
│   ├── 02-challenges-2026.md
│   ├── 03-spherex-tecnico.md
│   ├── 04-apis.md
│   ├── 05-arquitectura.md
│   ├── 06-plan-48h.md
│   ├── 07-pitch-30s.md
│   ├── 08-problemas-astrofisica.md
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
│   └── bitacora/
│       └── 2026-11-14.md
├── research/                  # notas crudas, capturas, papers, pruebas
├── src/
│   ├── backend/               # API, ingest, procesamiento FITS
│   └── frontend/              # UI: blink, slider 102 bandas, espectro
├── scripts/                   # utilidades: bajar cutouts, cachear, generar demo
├── data/
│   ├── cache/                 # NO se commitea (gitignored)
│   └── samples/               # muestras chicas sí se pueden commitear
├── assets/                    # logo, imágenes, video, slides
└── .venv/                     # entorno local (gitignored)
```

---

## 4. Decisiones tomadas (Decision Log)

| Fecha | Decisión | Alternativas | Dueño | Estado |
|---|---|---|---|---|
| 2026-11-14 | Recomendar **Planet X and SPHEREx** | Lunar Landing Site Navigator, Martian Map, MODIS/VIIRS, Earth Jukebox | Andy | **Propuesta** |
| 2026-11-14 | No ir por “Create Your Own Challenge” si queremos Global Judging | Custom challenge local | Andy | **Propuesta** |
| 2026-11-14 | Arquitectura: backend Python + frontend web + caché de frames | Todo client-side, Streamlit, Next.js full-stack | Andy | **Propuesta** |
| 2026-11-14 | Demo: precomputar 5 targets y dejar “live mode” como bonus | Todo en vivo | Andy | **Propuesta** |
| 2026-11-14 | **Regla data-first:** solo problemas con dato NASA accesible (ver `docs/08`) | Ideas sin dato | Andy | **Aprobada** |

> Cuando el equipo vote, cambiar “Propuesta” por “Aprobada” y anotar quién la aprobó.

---

## 5. Bitácora (resumen)

### 2026-11-14 — Día 1
- Se revisaron los 14 challenges oficiales 2026.
- Se confirmó que **“Create Your Own Challenge” no es elegible para Global Judging**.
- Se investigaron las APIs de SPHEREx/IRSA: SIA2 funciona; TAP está intermitente (502); los cutouts traen ePSF de ~4 MB; el HiPS cube tiene 102 capas PNG.
- Se recomendó **Planet X and SPHEREx** por impacto visual, datos accesibles y encaje con las APIs ya reunidas.
- Pendiente: voto del equipo, roles, repo, stack definitivo.

Detalle completo en [docs/bitacora/2026-11-14.md](docs/bitacora/2026-11-14.md).

---

## 6. Cómo se actualiza este documento

1. **Cada standup** (10 min): se agrega una línea a la bitácora con qué se hizo, qué sigue y qué bloquea.
2. **Cada decisión**: se agrega una fila al Decision Log con fecha, dueño y estado.
3. **Cada cambio de alcance**: se anota y se avisa en el canal del equipo.
4. **Antes de dormir**: se actualiza el estado y se deja el repo en `main` funcionando.
5. **Antes de entregar**: se completa el [checklist](docs/10-submission-checklist.md).

---

## 7. Reglas mínimas para compartir con todo el equipo

1. **Un solo challenge** y un solo repositorio.
2. **`main` siempre funciona**; se trabaja en ramas `feat/...`, `fix/...`, `docs/...`.
3. **Nadie mergea sin avisar**; PRs chicos y rápidos.
4. **Standup de 10 min** a las 9:00 y a las 21:00 (o el horario que acuerden).
5. **Bloqueo de 30 min**: si no avanzás, pedí ayuda. No te entierres.
6. **Timebox de 2 h** para cualquier spike técnico. Si no funciona, se descarta.
7. **Datos pesados fuera del repo**: `data/cache/` y `*.fits` están gitignored.
8. **Secretos fuera del repo**: `.env` y claves nunca se commitean.
9. **Ciencia honesta**: un candidato es un candidato, no un descubrimiento. Mostrar incertidumbre y citar datos.
10. **SI (IA) se declara**: si usamos IA para código, texto o imágenes, se anota y se marca cuando corresponde.
11. **Corte de alcance a T-12 h**: después solo se pule, se prueba y se ensaya.
12. **Dormir es parte del plan**: turnos de descanso, nadie codea 40 h seguidas.

> Lista completa y explicada en [docs/00-equipo-y-reglas.md](docs/00-equipo-y-reglas.md).

---

## 8. Estado actual del proyecto

| Área | Estado | Nota |
|---|---|---|
| Challenge | 🟡 Propuesta | Planet X and SPHEREx |
| Docs de challenges | 🟢 14/14 resumen; 1/14 deep dive | SPHEREx a nivel 3–4; el resto a nivel 2 |
| Equipo/roles | 🔴 Sin definir | Falta confirmar habilidades |
| Repo | 🟡 Estructura creada | Falta `git init` + remote |
| Workflow/herramientas | 🟢 Listo | Makefile, CI, pre-commit, plantillas, Typst |
| Datos | 🟢 Validados | SIA2 + cutouts + HiPS + reproyección probados |
| Backend | 🟡 PoC | `scripts/poc_spherex.py` + `scripts/align_diff.py` |
| Frontend | 🔴 No iniciado | — |
| Pitch | 🟡 Borrador | Guion de 30 s en docs/07 |
| Submission | 🔴 Pendiente | Deadline domingo 23:59 |

**Leyenda:** 🟢 listo · 🟡 en progreso · 🔴 pendiente · ⚫ bloqueado.
