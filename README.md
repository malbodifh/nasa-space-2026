# Astral Codes — NASA Space Apps Challenge 2026

**Equipo:** Andy, David, Samuel, Jorge, Leo
**Evento:** 14–15 de noviembre de 2026
**Challenge propuesto:** [Planet X and SPHEREx](https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/)

> **Una herramienta pública para ver cómo cambia el cielo.**
> Elegís una coordenada, ves una película de ese parche entre épocas de SPHEREx, activás la diferencia y explorás las 102 bandas infrarrojas.

---

## Empezar acá

1. Leer [`documentacion.md`](documentacion.md) — es la fuente única de verdad.
2. Leer [`docs/00-equipo-y-reglas.md`](docs/00-equipo-y-reglas.md) — cómo trabajamos.
3. Leer [`docs/01-decision-challenge.md`](docs/01-decision-challenge.md) — por qué SPHEREx.
4. Revisar [`docs/06-plan-48h.md`](docs/06-plan-48h.md) — qué hacemos y cuándo.
5. Leer [`CONTRIBUTING.md`](CONTRIBUTING.md) — cómo contribuir.
6. Ver [`docs/20-ideas-creativas.md`](docs/20-ideas-creativas.md) — 14 ideas, una por reto.

## Comandos

```bash
make help        # ver todos los comandos
make setup       # crear .venv e instalar dependencias
make backend     # API en http://localhost:8000
make test        # tests
make check       # lint + tests
make guides      # compilar guías Typst
make precompute  # datos de WISE 0855 + Barnard
```

## Estructura

```text
docs/       documentación y bitácora
guides/     guías visuales en Typst (PDF/PNG)
.github/    CI + plantillas de issues/PR
src/        backend y frontend
scripts/    utilidades de datos y demo
tests/      tests del backend
data/       caché local (no se commitea)
assets/     logo, imágenes, video, slides
```

## Estado

- [x] Lista de challenges 2026 revisada
- [x] APIs de SPHEREx/IRSA investigadas
- [x] Reglas de equipo y pitch documentados
- [ ] Challenge votado por el equipo
- [ ] Repo creado y ramas configuradas
- [ ] PoC: SIA2 → cutout → PNG
- [ ] Backend + frontend
- [ ] Demo de 30 s
- [ ] Entrega

## Licencia y créditos

- Datos: NASA/SPHEREx, Caltech/IPAC-IRSA. Ver [`docs/11-fuentes.md`](docs/11-fuentes.md).
- El equipo debe citar todas las librerías, imágenes y recursos externos en la submission.
- NASA no respalda este proyecto.
