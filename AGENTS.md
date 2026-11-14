# AGENTS.md — base para escribir código

> **Punto de partida para cualquier persona o IA que vaya a tocar el repo.**
> Esto no es la documentación del producto: la verdad está en
> [`documentacion.md`](documentacion.md) y [`docs/`](docs/). Si algo de acá contradice un
> documento, gana el documento.
>
> Se mantiene en `develop` para todo el equipo y se propaga con el flujo normal
> (`develop → staging → main`). Si lo cambiás, va por PR como cualquier otra cosa.

---

## 1. Antes de la primera línea

1. Leé [`documentacion.md`](documentacion.md): estado, Decision Log y reglas del equipo.
2. El challenge **todavía no está elegido**: mirá [`docs/02-challenges-2026.md`](docs/02-challenges-2026.md).
3. Flujo de ramas y PRs: [`docs/18-workflow.md`](docs/18-workflow.md).
4. Comandos y CI: [`docs/19-herramientas.md`](docs/19-herramientas.md).

Si no sabés qué construir, no inventes producto: preguntá al equipo.

---

## 2. Estado real del repo

- **No hay producto.** No existe `src/`, `data/` ni `package.json`. Lo único ejecutable son
  los smoke tests y las guías Typst.
- El proyecto anterior (**Mission Trainer**, reto #3, trivia) está archivado en la rama
  `archive/mission-trainer` y el tag `v1-mission-trainer`. **No lo revivas** ni lo "arregles"
  sin aprobación del equipo; para consultarlo, cambiá de rama.
- `main`, `staging`, `develop` y las ramas personales (`andy`, `david`, `samuel`, `jorge`,
  `leo`) están todas en el mismo commit limpio.

---

## 3. Setup y comandos

```bash
make setup      # crea .venv e instala requirements-dev.txt
make check      # ruff + pytest — el único gate real
make guides     # compila guides/src/*.typ a guides/dist/*.pdf
make clean      # cachés + PNGs; NO borra los PDF versionados
make branches   # crea las ramas del equipo si faltan
make sync       # actualiza main/develop/staging desde origin
```

- Un solo test: `.venv/bin/python -m pytest tests/test_repo.py -q`
- El `.venv` local es Python 3.14; GitHub Actions usa 3.12. No uses sintaxis exclusiva de 3.14.
- La ruta del repo tiene un espacio (`NASA SPACEAPPS`): citá siempre en shell.

---

## 4. Mapa del repo

| Ruta | Qué es | ¿Se toca? |
|---|---|---|
| `documentacion.md` | Índice, estado y Decision Log | Sí, es la fuente de verdad |
| `docs/` | Documentación del equipo | Sí |
| `guides/src/` | Fuentes Typst (maquetación) | Solo si cambia un PDF |
| `guides/dist/` | PDFs versionados | Nunca a mano |
| `tests/` | Smoke tests del esqueleto | Sí |
| `scripts/` | Automatizaciones (`setup_branches.sh`) | Sí |
| `backups/ideas/spherex/` | Idea descartada | No borrar |
| `assets/`, `research/` | Recursos y notas crudas | Sí, con criterio |

---

## 5. Reglas de código

- **Una tarea = una rama = un PR.** Nombres: `feat/`, `fix/`, `docs/`.
- Documentación y commits en **español**; la submission oficial en **inglés**.
- Commits chicos y en imperativo (`add endpoint de salud`, no `added stuff`).
- Si agregás una dependencia, anotala en el README del módulo y avisá al equipo.
- **Definition of Done:** funciona, está documentado en una línea y `make check` está verde.
- No agregues frameworks ni build steps "por si acaso": el repo hoy es deliberadamente mínimo.

---

## 6. Datos y ciencia

- **Sin dato NASA accesible, no hay reto**: no inventar cifras ni prometer APIs.
- Toda feature declara su **contrato de datos**: dataset, API/endpoint, campos, caché y fallback.
- Decir "candidato" o "según NASA", nunca "descubrimiento".
- Declarar el uso de IA y los créditos de NASA en la UI y en la submission.
- No commitear `.env`, `data/cache/`, `*.fits`, videos ni PNG de las guías.

---

## 7. Gotchas verificados

- `make clean` **no** borra `guides/dist/`: ahí viven los PDF versionados. Si ves un target
  con `rm -rf guides/dist`, está mal.
- `guides/src/theme.typ`: el color de línea se llama `lineColor` porque `line` tapa la función
  built-in; `section(titulo, color: c)` exige el argumento con nombre.
- En Typst, `#` dentro de texto se escapa: `[\#]`.
- Los commits deben salir como `Trizzoth <304232853+Trizzoth@users.noreply.github.com>`.

---

## 8. Git y GitHub

- Remoto: `malbodifh/nasa-space-2026`. Flujo: `persona → develop → staging → main`.
- **Nunca** commitear directo en `main`, `staging` ni `develop`, ni forzar push.
  Para integrar: rama + PR (o merge fast-forward acordado).
- Recuperación ante errores: [`docs/18-workflow.md`](docs/18-workflow.md) § 3.1.
- `gh` está autenticado como `Trizzoth` con `push` pero **sin `admin`**: no se puede cambiar
  el default branch ni crear protecciones.
- GitHub Actions corre en push a `main` y en PRs (ruff + pytest + Typst).

---

## 9. Cuando se elija el reto

1. Registrar la decisión en `documentacion.md` §5 y en `docs/02` §6.
2. Escribir un documento de producto nuevo en `docs/` (concepto, MVP, contrato de datos).
3. Actualizar este archivo: stack, comandos y mapa del repo.
4. Recién después: código, deploy, video y submission.
