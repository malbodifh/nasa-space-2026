# Astral Codes — NASA Space Apps Challenge 2026

**Equipo:** Andy, David, Samuel, Jorge, Leo
**Repo:** [malbodifh/nasa-space-2026](https://github.com/malbodifh/nasa-space-2026)
**Estado:** MVP en revisión — reto de trabajo **Dancing with the SARs** (NISAR)

> Gamma Alert combina alertas de desastres para Costa Rica con estudios de superficie NISAR.
> Estado y decisiones vigentes en [`docs/estado.md`](docs/estado.md).
> Inicio del frontend: [`web/README.md`](web/README.md).

---

## Empezar

```bash
make setup      # crea .venv e instala herramientas
make check      # ruff + pytest
make guides     # compila las guías Typst a PDF
```

## Qué hay acá

| Ruta | Qué es |
|---|---|
| [`docs/estado.md`](docs/estado.md) | Fuente única de verdad: estado, decisiones, reglas |
| [`AGENTS.md`](AGENTS.md) | Base compartida para quien escriba código (humanos e IA) |
| [`docs/investigacion/retos-2026.md`](docs/investigacion/retos-2026.md) | Los 14 retos, matriz /20 y método de votación |
| [`guides/dist/06-retos.pdf`](guides/dist/06-retos.pdf) | El mapa de retos para mostrar al equipo |
| [`docs/equipo/workflow.md`](docs/equipo/workflow.md) | Ramas, PRs, commits y recuperación |
| [`docs/tecnico/herramientas.md`](docs/tecnico/herramientas.md) | Comandos, CI y guías |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Cómo contribuir |

## Ramas

```text
main        producción (solo mediante PR revisado)
  ↑
develop     desarrollo diario
  ↑
andy · david · samuel · jorge · leo    rama personal
```

El proyecto anterior (Mission Trainer, reto #3) está archivado en la rama
`archive/mission-trainer` y en el tag `v1-mission-trainer`.

## Créditos

Contenido basado en material público de NASA. NASA no respalda este proyecto.
