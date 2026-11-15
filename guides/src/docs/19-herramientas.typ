// Generado desde docs/19-herramientas.md con pandoc. No editar a mano.

#import "theme.typ": *

= 19 --- Herramientas del repo
#quote(block: true)[
Lo mínimo para trabajar: comandos, CI, guías y las trampas que ya nos
costaron tiempo.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Comandos
```bash
make setup      # crea .venv e instala requirements-dev.txt
make check      # ruff + pytest — el único gate real
make guides     # compila guides/src/*.typ a guides/dist/*.pdf
make clean      # limpia cachés y PNGs (no borra los PDF)
make branches   # crea las ramas del equipo si faltan
make sync       # actualiza main/develop/staging desde origin
```

Un solo test:

```bash
.venv/bin/python -m pytest tests/test_repo.py -q
```

== 2. Setup en una máquina nueva
```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
typst --version   # hace falta Typst 0.15+
```

No hay `package.json` ni build de frontend. Si el próximo producto lo
necesita, se agrega y se avisa al equipo.

== 3. Calidad
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Herramienta], [Para qué], [Config],),
    table.hline(),
    [Ruff], [lint + format], [`pyproject.toml`],
    [Pytest], [smoke tests del repo], [`tests/`],
    [Pre-commit], [hooks locales], [`.pre-commit-config.yaml`],
    [Typst], [guías visuales], [`guides/src/`],
  )]
  , kind: table
  )

Instalar los hooks una vez:

```bash
.venv/bin/pre-commit install
```

== 4. CI
`.github/workflows/ci.yml` corre en push a `main` y en cada PR:

+ #strong[Python:] `ruff check .` + `pytest -q`.
+ #strong[Frontend:] solo si existe `src/frontend/package.json`.
+ #strong[Guías:] instala Typst y corre `make guides`.

Si el CI falla, no se mergea. Verificá localmente con `make check` antes
de decir que algo funciona.

== 5. Guías visuales
```text
guides/src/*.typ   fuentes (no se leen)
guides/dist/*.pdf  salida versionada
```

Detalle y recetas en `guides/README.md`.

== 6. Git
- Flujo: `persona → develop → staging → main`.
- `make sync` actualiza las ramas base sin tocar la tuya.
- Recuperación ante errores: `18-workflow.md` §
  3.1.
- El proyecto anterior está archivado en `archive/mission-trainer` y el
  tag `v1-mission-trainer`.

== 7. Trampas verificadas
- La ruta del repo tiene un espacio (`NASA SPACEAPPS`): citar siempre en
  shell.
- `make clean` #strong[no] debe borrar `guides/dist/`: ahí viven los PDF
  versionados.
- En `guides/src/theme.typ` el color de línea se llama `lineColor`
  porque `line` tapa la función built-in.
- `.venv` es Python 3.14 en la máquina del equipo; el CI usa 3.12. No
  usar sintaxis exclusiva de 3.14 si tiene que correr en Actions.