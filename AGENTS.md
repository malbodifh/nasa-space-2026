# AGENTS.md

Repo de hackathon (NASA Space Apps 2026, 48 h). Producto: **SkyBlink**, un explorador de cambios del cielo con SPHEREx. La documentación y los commits van en español; la submission oficial va en inglés. No hay tests de UI ni frontend todavía.

## Forma real del repo

- **Solo existe backend**: `src/backend/app/main.py` (FastAPI). `src/frontend/` es únicamente un README; no hay `package.json` ni `npm` instalado, así que `make frontend` falla a propósito.
- `docs/` es la especificación del producto; `documentacion.md` es el índice y la fuente única de verdad. `docs/18-workflow.md` define ramas y recuperación ante errores; `docs/20-ideas-creativas.md` tiene ideas por reto y el estado verificado de cada API.
- `guides/` son fuentes Typst; los **PDF de `guides/dist/` están versionados** (los PNG no).
- `data/cache/` está gitignoreado pero es la fuente del demo (`data/samples/` tiene los CSV chicos que sí se commitean).

## Comandos

```bash
make check    # ruff + pytest — es el único gate real
make backend  # uvicorn en :8000
make guides   # compila Typst a PDF/PNG en guides/dist
```

- Usar el venv ya creado: `.venv/bin/python` (Python 3.14). No reinstalar ni tocar el Python del sistema.
- Un solo test: `.venv/bin/python -m pytest tests/test_health.py::test_health -q`
- `make setup` tarda varios minutos en Python 3.14 (compila `reproject`/`astroalign` desde fuente). El `.venv` ya existe: no recrearlo sin motivo.
- Ruff: `known-first-party = ["app"]` en `pyproject.toml`; pytest usa `pythonpath = ["src/backend"]`, por eso los tests importan `from app.main import app`.

## Gotchas verificados

- **`make clean` borra `guides/dist/`**, que contiene PDFs versionados → deja borrados en `git status`. Para limpiar PNGs usar `rm -f guides/dist/*.png`, o volver a correr `make guides`.
- El backend debe correr **desde la raíz del repo**: `CACHE_DIR = Path("data/cache")` es relativo al CWD y `StaticFiles` se monta al importar. Desde otro directorio, `/api/targets` devuelve vacío y `/cache` no existe, sin error.
- En `guides/theme.typ` el color de línea se llama `lineColor` porque `line` tapa la función built-in; y `section(titulo, color: c)` exige el argumento con nombre.
- La ruta del repo tiene un espacio (`NASA SPACEAPPS`): citar siempre en shell.
- Los commits deben salir como `Trizzoth <304232853+Trizzoth@users.noreply.github.com>` (ya configurado). Un email genérico tipo `astralcodes@users.noreply.github.com` atribuye los commits al usuario real `AstralCodes`.

## Git y GitHub

- Remoto: `malbodifh/nasa-space-2026` (público). Flujo: `persona → develop → staging → main`.
- Ramas personales: `andy`, `david`, `samuel`, `jorge`, `leo`. `make branches` las recrea; `make sync` actualiza `main`/`develop`/`staging`.
- **Nunca** commitear directo en `main`, `staging` ni `develop`, ni forzar push en ellas. Si algo se rompió, revertir (`docs/18-workflow.md` § 3.1); no reescribir historia.
- `gh` está autenticado como `Trizzoth` con `push` pero **sin `admin`**: no se puede cambiar el default branch, ni habilitar Actions, ni crear protecciones.
- **GitHub Actions está deshabilitado en el repo**, así que el CI nunca corre: verificar siempre con `make check` antes de decir que algo funciona.

## Reglas de datos (del equipo, no negociables)

- "Sin dato NASA accesible, no hay problema": nunca inventar datos ni prometer APIs no verificadas.
- El demo debe funcionar desde caché/CSV; el modo live de IRSA es bonus (devuelve 502 con frecuencia).
- Decir "candidato", nunca "descubrimiento". Declarar datos sintéticos, IA y créditos NASA/IRSA.
- No commitear `data/cache/`, `*.fits`, videos, `.env` ni secretos.
