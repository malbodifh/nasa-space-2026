# AGENTS.md

Repo de hackathon (NASA Space Apps 2026, 48 h). Documentación, commits y nombres en español;
la submission oficial va en inglés. **No hay producto todavía**: el challenge está sin elegir.

## Estado real

- El proyecto anterior (**Mission Trainer**, reto #3, trivia) está archivado. No lo "arregles"
  ni lo revivas sin que el equipo lo pida: vive en la rama `archive/mission-trainer` y el tag
  `v1-mission-trainer`.
- En `main`/`staging`/`develop` solo hay esqueleto: docs, guías, CI y smoke tests. No hay
  `src/`, `data/` ni `package.json`.
- La decisión del reto se toma con [`docs/02-challenges-2026.md`](docs/02-challenges-2026.md)
  y [`guides/dist/06-retos.pdf`](guides/dist/06-retos.pdf). **No declares un reto ganador**:
  está abierto hasta que el equipo vote.

## Fuentes de verdad

- `documentacion.md` = índice, estado y Decision Log. `docs/*.md` = la documentación.
- `guides/src/*.typ` = maquetación Typst (no se lee). `guides/dist/*.pdf` = salida versionada;
  los PNG están gitignored. Si un PDF contradice un `.md`, gana el `.md`.
- No borres `backups/ideas/spherex/` ni los artefactos de archivo.

## Comandos

```bash
make check      # ruff + pytest — el único gate real
make guides     # compila guides/src/*.typ a guides/dist/*.pdf
make setup      # crea .venv e instala requirements-dev.txt
make clean      # cachés + PNGs; NO borra los PDF versionados
```

- Un test: `.venv/bin/python -m pytest tests/test_repo.py -q` (verifica enlaces de docs y que
  cada `.typ` tenga su PDF).
- El `.venv` local es Python 3.14; GitHub Actions usa 3.12. No uses sintaxis exclusiva de 3.14.
- Hay espacio en la ruta (`NASA SPACEAPPS`): citá siempre en shell.

## Gotchas verificados

- `make clean` **no** debe borrar `guides/dist/` (los PDF están versionados). Si ves el target
  viejo con `rm -rf guides/dist`, es un error.
- En `guides/src/theme.typ` el color de línea se llama `lineColor` porque `line` tapa la función
  built-in; y `section(titulo, color: c)` exige el argumento con nombre.
- En Typst, `#` dentro de texto hay que escaparlo (`[\#]`).
- Los commits deben salir como `Trizzoth <304232853+Trizzoth@users.noreply.github.com>`.

## Git y GitHub

- Remoto: `malbodifh/nasa-space-2026`. Flujo: `persona → develop → staging → main`.
- Ramas personales: `andy`, `david`, `samuel`, `jorge`, `leo`. `make branches` las recrea;
  `make sync` actualiza `main`/`develop`/`staging`.
- **Nunca** commitear directo en `main`, `staging` ni `develop`, ni forzar push. Para integrar,
  rama + PR (o merge fast-forward acordado). Recuperación: `docs/18-workflow.md` § 3.1.
- `gh` está autenticado como `Trizzoth` con `push` pero **sin `admin`**: no se puede cambiar el
  default branch ni crear protecciones.
- GitHub Actions corre en push a `main` y en PRs (ruff + pytest + Typst). Verificá con
  `make check` antes de decir que algo funciona.

## Reglas de datos y ciencia

- **Sin dato NASA accesible, no hay reto**: no inventar cifras ni prometer APIs.
- Decir "candidato" o "según NASA", nunca "descubrimiento". Declarar el uso de IA y los
  créditos de NASA. No commitear `.env`, `data/cache/`, `*.fits` ni videos.
