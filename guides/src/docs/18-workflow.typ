// Generado desde docs/18-workflow.md con pandoc. No editar a mano.

#import "theme.typ": *

= 18 --- Workflow del equipo
#quote(block: true)[
#strong[Objetivo:] que cinco personas puedan trabajar en paralelo sin
pisarse, con un demo que siempre funcione. #strong[Herramientas:] GitHub
Issues/PRs, `make`, Ruff, Pytest, pre-commit, GitHub Actions, Typst.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Principios
+ #strong[`main` siempre funciona.]
+ #strong[Un issue = una rama = un PR.]
+ #strong[PRs chicos] (\<300 líneas) y con review rápido.
+ #strong[Demo primero:] si no se puede mostrar, no cuenta.
+ #strong[Datos con contrato:] sin dataset/API/campos/fallback, no
  entra.
+ #strong[Documentar es trabajar.]
+ #strong[Corte de alcance a T-12 h.]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. Flujo completo
```mermaid
flowchart LR
    A[Backlog\n documentacion.md] --> B[Issue\n plantilla Tarea]
    B --> C[Rama\n feat/fix/docs]
    C --> D[Commits chicos]
    D --> E[PR\n plantilla]
    E --> F{CI verde\n+ review}
    F -- No --> C
    F -- Sí --> G[Merge a main]
    G --> H[Deploy / demo]
    H --> I[Bitácora\n documentacion.md]
```

=== Paso a paso
+ Elegí una tarea del backlog.
+ Abrí un issue con la plantilla #strong[Tarea] (incluye contrato de
  datos).
+ Creá la rama: `feat/p0-07-endpoint-salud`.
+ Hacé commits chicos.
+ Abrí el PR con la plantilla.
+ Esperá CI verde + 1 review.
+ Mergeá.
+ Actualizá la bitácora.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Ramas y commits
=== Ramas
El equipo trabaja con #strong[4 niveles]. Nadie escribe directo en
`main`.

```text
main        producción. Solo recibe merges desde staging. Siempre funciona.
  ↑
staging     puente de integración. Junta develop + ramas en revisión y se prueba el demo completo.
  ↑
develop     desarrollo. Integración diaria del equipo.
  ↑
andy / david / samuel / jorge / leo    rama personal de cada integrante
```

#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Rama], [Quién escribe], [Sale hacia], [Regla],),
    table.hline(),
    [`main`], [nadie directo], [---], [Solo merge desde `staging` + tag
    de versión],
    [`staging`], [el que integra (Andy)], [`main`], [Demo completo
    verificado; si falla, no pasa],
    [`develop`], [merges de PRs], [`staging`], [Integración diaria;
    puede estar roja por horas, no por días],
    [`andy`, `david`, `samuel`, `jorge`, `leo`], [su
    dueño], [`develop`], [Trabajo libre; nadie más commitea acá],
  )]
  , kind: table
  )

=== Ciclo de trabajo
```bash
git checkout develop && git pull
git checkout andy            # tu rama
git merge develop            # traer lo último antes de empezar
# ... trabajás, commiteás ...
git push origin andy

# PR: andy -> develop  (review de 1 persona + CI verde)
```

Promoción:

```text
andy/david/... --PR--> develop --PR--> staging --PR--> main
```

- #strong[develop → staging:] cuando el demo funciona de punta a punta.
- #strong[staging → main:] cuando el demo corre sin internet, el video
  de respaldo existe y el pitch está listo. Ahí se tagea
  (`v0.1.0-demo`).

=== Nombres de commits y ramas
Las ramas personales pueden tener sub-ramas para algo grande:

```text
andy                    trabajo diario
andy/endpoint-salud     feature puntual (opcional, se borra al mergear)
fix/timeout-api         bug urgente (desde develop)
```

Commits:

```text
add endpoint de salud
fix timeout de API
docs workflow
data agregar catálogo de ejemplo
```

=== Regla
Si el commit necesita “y” (“agrega X y arregla Y”), son dos commits.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3.1. Si alguien se equivoca
El puente existe justamente para que un error #strong[no llegue a
producción].

#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Situación], [Qué hacer], [Comando],),
    table.hline(),
    [Error en tu rama, sin push], [Deshacer el último
    commit], [`git reset --hard HEAD~1`],
    [Error en tu rama, con push], [Revertir sin borrar
    historia], [`git revert <sha>` + push],
    [Rompiste `develop`], [Revertir el
    merge], [`git revert -m 1 <sha-del-merge>`],
    [Rompiste `staging`], [Revertir ahí; `main` sigue
    sano], [`git checkout staging && git revert <sha>`],
    [Llegó a `main` (caso raro)], [Hotfix directo y tag
    nuevo], [`fix/...` → `main` → merge back a `develop` y `staging`],
    [Perdiste trabajo], [Recuperar desde reflog], [`git reflog` y
    `git checkout -b rescate <sha>`],
    [Querés ver qué cambió], [Comparar
    ramas], [`git log --oneline develop..andy`],
  )]
  , kind: table
  )

#strong[Reglas de oro ante un error:]

+ #strong[Avisar en el canal antes de arreglar.] Nadie más debe mergear
  mientras tanto.
+ #strong[Nunca `push --force` sobre `develop`, `staging` ni `main`.]
  Solo en tu rama personal y avisando.
+ #strong[Revertir, no reescribir.] En ramas compartidas la historia se
  agrega, no se borra.
+ #strong[Si `main` está roto:] arreglar primero, preguntar después.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Issues y etiquetas
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Etiqueta], [Significado],),
    table.hline(),
    [`P0`], [Imprescindible para el demo],
    [`P1`], [Diferenciador],
    [`P2`], [Bonus],
    [`blocked`], [Esperando algo/alguién],
    [`data`], [Pipeline/datos],
    [`backend`], [API],
    [`frontend`], [UI],
    [`science`], [Validación/QA],
    [`pitch`], [Video/slides],
    [`docs`], [Documentación],
    [`decision`], [ADR/decisión],
  )]
  , kind: table
  )

#strong[Regla:] un issue tiene #strong[una] prioridad y #strong[un]
dueño.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Pull Requests
- Título claro: `feat: endpoint de salud con estado del servicio`.
- Descripción con: qué, por qué, cómo probarlo, evidencia.
- Checklist de la plantilla completo.
- Si toca datos: contrato de datos.
- Si toca UI: captura/GIF.
- Si toca API: comando + salida.

#strong[Review SLA:] 15 min durante el hackathon. Si nadie revisa en 15
min, avisar en el canal.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. Datos
=== Pipeline
```text
fuente NASA → script reproducible → caché local → JSON/API → UI
```

=== Reglas
- `data/cache/` #strong[no] se commitea.
- `data/samples/` sí (CSV/JSON chicos).
- Cada dataset tiene `manifest.json` con fuente, fecha y versión.
- Cada script es reproducible con un comando.
- Si la API falla: usar caché o un sample local (fallback declarado).
- Documentar el #strong[contrato de datos] de cada feature.

=== Comandos
```bash
make check          # ruff + pytest
make guides         # PDF de las guías
```

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Demo y freeze
=== Antes del freeze
- Precomputar los datos del demo.
- Verificar que el demo funcione #strong[sin internet].
- Grabar un video de respaldo.

=== Freeze (domingo 12:00)
- No se agregan features.
- Solo bugs, pulido, pitch y submission.
- `main` queda en estado demo.

=== Ensayos
- 16:00 --- ensayo 1.
- 18:00 --- ensayo 2.
- 20:00 --- submission.
- 22:00 --- buffer.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Rutina diaria
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Hora], [Qué],),
    table.hline(),
    [09:00], [Standup (10 min): qué hice, qué sigue, qué me bloquea],
    [09:15], [Cada uno toma un issue P0],
    [11:00], [Checkpoint rápido en el canal],
    [13:00], [Almuerzo],
    [15:00], [Checkpoint + review de PRs],
    [18:00], [Integración: ¿el demo funciona?],
    [21:00], [Standup + actualizar bitácora],
    [23:00], [Dormir (turnos)],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 9. CI/CD
=== CI (GitHub Actions)
- #strong[Python:] Ruff + Pytest.
- #strong[Frontend:] build si existe `package.json`.
- #strong[Guías:] compila Typst y sube artifact.

=== Local
```bash
make check   # lint + tests
make guides  # PDF/PNG
```

=== Deploy (cuando exista)
- Frontend: Vercel.
- Backend: Render/Fly.io.
- O todo en FastAPI con `StaticFiles`.
- Link público, sin login.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 10. Herramientas
#figure(
  align(center)[#table(
    columns: 3,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,),
    table.header([Herramienta], [Para qué], [Comando],),
    table.hline(),
    [`make`], [Tareas], [`make help`],
    [Ruff], [Lint/format], [`make lint`, `make format`],
    [Pytest], [Tests], [`make test`],
    [pre-commit], [Hooks], [`pre-commit install`],
    [Typst], [Guías visuales], [`make guides`],
    [GitHub Actions], [CI], [push/PR],
  )]
  , kind: table
  )

Detalle en #link("19-herramientas.md").

#line(length: 100%, stroke: 0.6pt + lineColor)

== 11. Decisiones (ADR corto)
Toda decisión importante se registra en:

+ Un issue con etiqueta `decision`.
+ Una fila en el #strong[Decision Log] de `documentacion.md`.

Formato:

```text
Contexto → Opciones → Decisión → Consecuencias
```

#line(length: 100%, stroke: 0.6pt + lineColor)

== 12. Qué NO hacer
- #text(fill: red, weight: "bold")[×] Trabajar en `main`.
- #text(fill: red, weight: "bold")[×] Mergear sin review.
- #text(fill: red, weight: "bold")[×] Commitear `.env`, `data/cache/`, `*.fits`.
- #text(fill: red, weight: "bold")[×] Agregar features después del freeze.
- #text(fill: red, weight: "bold")[×] Prometer datos que no tenemos.
- #text(fill: red, weight: "bold")[×] Decir “descubrimos” sin validación.
- #text(fill: red, weight: "bold")[×] Dormir 0 horas.