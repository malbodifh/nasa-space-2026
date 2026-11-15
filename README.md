# Astral Codes — NASA Space Apps Challenge 2026

**Equipo:** Andy, David, Samuel, Jorge, Leo
**Repo:** [malbodifh/nasa-space-2026](https://github.com/malbodifh/nasa-space-2026)
**Estado:** reinicio — challenge **sin elegir**

> Estamos eligiendo entre los 14 retos oficiales de 2026.
> El mapa de decisión está en [`guides/dist/06-retos.pdf`](guides/dist/06-retos.pdf).

---

## Empezar

```bash
make setup      # crea .venv e instala herramientas
make check      # ruff + pytest
make guides     # compila las guías Typst a PDF
make docs       # compila el libro de documentación + un PDF por doc
```

## Qué hay acá

| Ruta | Qué es |
|---|---|
| [`documentacion.md`](documentacion.md) | Fuente única de verdad: estado, decisiones, reglas |
| [`AGENTS.md`](AGENTS.md) | Base compartida para quien escriba código (humanos e IA) |
| [`docs/02-challenges-2026.md`](docs/02-challenges-2026.md) | Los 14 retos, matriz /20 y método de votación |
| [`guides/dist/06-retos.pdf`](guides/dist/06-retos.pdf) | El mapa de retos para mostrar al equipo |
| [`guides/dist/07-documentacion.pdf`](guides/dist/07-documentacion.pdf) | Documentación completa del proyecto, generada con Typst |
| [`docs/18-workflow.md`](docs/18-workflow.md) | Ramas, PRs, commits y recuperación |
| [`docs/19-herramientas.md`](docs/19-herramientas.md) | Comandos, CI y guías |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Cómo contribuir |

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

El proyecto anterior (Mission Trainer, reto #3) está archivado en la rama
`archive/mission-trainer` y en el tag `v1-mission-trainer`.

## Créditos

Contenido basado en material público de NASA. NASA no respalda este proyecto.
