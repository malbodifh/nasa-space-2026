# AGENTS.md

Repo de hackathon (NASA Space Apps 2026, 48 h). Producto: **Mission Trainer**, una trivia
educativa de astronauta junior. Documentación y commits en español; la submission oficial
va en inglés. No hay framework de frontend ni build step.

## Forma real del repo

- **Juego**: `src/backend/static/` (HTML + CSS + JS vanilla). No hay `package.json` ni `npm`; `make frontend` solo imprime instrucciones.
- **API**: `src/backend/app/main.py` (rutas) y `src/backend/app/quiz.py` (reglas, validación del banco).
- **Contenido**: `data/questions.json` — 32 preguntas; `data/support.json` — 7 partes de misión ("Apoyo de Tierra"); el contrato está en `docs/08-contenido-y-datos.md` y `docs/21-banco-preguntas.md`.
- **Docs**: `documentacion.md` es el índice y la fuente de verdad; `docs/18-workflow.md` define ramas y recuperación.
- **Idea descartada**: `backups/ideas/spherex/` (SPHEREx). No está en uso; no la borres.
- `guides/src/` son las fuentes Typst (maquetación, no documentación); los **PDF de `guides/dist/` están versionados** (los PNG no). La verdad está en `documentacion.md` y `docs/*.md`.

## Comandos

```bash
make backend   # http://localhost:8000 (sirve API + juego)
make check     # ruff + pytest — el único gate real
make guides    # compila Typst a PDF/PNG
```

- Usar el venv existente: `.venv/bin/python` (Python 3.14). No recrearlo sin motivo:
  `make setup` compila `reproject`/`astroalign` y tarda varios minutos.
- Un solo test: `.venv/bin/python -m pytest tests/test_quiz.py::test_bank_has_no_contract_errors -q`
- Ruff: `known-first-party = ["app"]`; pytest usa `pythonpath = ["src/backend"]`, por eso los
  tests importan `from app.main import app`.

## Contenido: reglas duras

- Cada pregunta necesita `source.url` con `nasa.gov` y una explicación ≤ 240 caracteres.
- `make check` valida el contrato (4 opciones, `answer` 0–3, categoría y recurso válidos).
- No inventar cifras: si no hay número publicado, la pregunta es conceptual.
- Si tocás el banco, actualizá `docs/21-banco-preguntas.md` si cambia la cobertura.

## Gotchas verificados

- **`make clean` borra `guides/dist/`**, que contiene PDFs versionados → deja borrados en
  `git status`. Para limpiar PNGs: `rm -f guides/dist/*.png`, o volver a correr `make guides`.
- Las rutas se resuelven desde `quiz.BASE_DIR` (raíz del repo), no desde el CWD; no cambies
  eso por `Path("data/...")` o el backend se rompe según dónde se ejecute.
- En `guides/theme.typ` el color de línea se llama `lineColor` porque `line` tapa la función
  built-in; y `section(titulo, color: c)` exige el argumento con nombre.
- La ruta del repo tiene un espacio (`NASA SPACEAPPS`): citar siempre en shell.
- Los commits deben salir como `Trizzoth <304232853+Trizzoth@users.noreply.github.com>`.
  Un email genérico tipo `astralcodes@users.noreply.github.com` atribuye los commits a otro usuario.

## Git y GitHub

- Remoto: `malbodifh/nasa-space-2026` (público). Flujo: `persona → develop → staging → main`.
- Ramas personales: `andy`, `david`, `samuel`, `jorge`, `leo`. `make branches` las recrea;
  `make sync` actualiza `main`/`develop`/`staging`.
- **Nunca** commitear directo en `main`, `staging` ni `develop`, ni forzar push en ellas.
  Si algo se rompió, revertir (`docs/18-workflow.md` § 3.1); no reescribir historia.
- `gh` está autenticado como `Trizzoth` con `push` pero **sin `admin`**: no se puede cambiar
  el default branch ni crear protecciones.
- **GitHub Actions está habilitado** y corre en push a `main` (`ruff` + `pytest` + Typst).
  Igual verificá con `make check` antes de decir que algo funciona.

## Reglas de datos

- “Sin dato NASA accesible, no hay problema”: nunca inventar datos ni prometer APIs.
- El juego no depende de red: el contenido vive en el JSON.
- Decir “candidato”/“según NASA”, nunca “descubrimiento”. Declarar IA y créditos NASA.
- No commitear `.env`, `data/cache/`, `*.fits` ni videos.
