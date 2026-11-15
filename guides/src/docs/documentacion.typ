// Generado desde documentacion.md con pandoc. No editar a mano.

#import "theme.typ": *

= Documentación --- Astral Codes / NASA Space Apps Challenge 2026
#quote(block: true)[
#strong[Este archivo es la fuente única de verdad del equipo.] Si algo
no está acá, no existe. Si cambia una decisión, se actualiza acá el
mismo día. Última actualización: #strong[2026-11-14] (reinicio del
proyecto).
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Datos del equipo
#figure(
  align(center)[#table(
    columns: 2,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,),
    table.header([Campo], [Valor],),
    table.hline(),
    [Equipo], [#strong[Astral Codes]],
    [Evento], [NASA Space Apps Challenge 2026 --- #strong[14 y 15 de
    noviembre de 2026]],
    [Integrantes], [Andy, David, Samuel, Jorge, Leo],
    [Challenge], [#strong[Sin elegir] --- decisión abierta],
    [Producto], [#strong[Sin definir] --- depende del reto],
    [Repo], [#link("https://github.com/malbodifh/nasa-space-2026")[malbodifh/nasa-space-2026]],
    [Deploy], [#emph[\(pendiente)]],
    [Entrega], [Domingo 15/11/2026, #strong[23:59 hora local del
    evento]],
  )]
  , kind: table
  )

=== Enlaces rápidos
- Base para escribir código (AGENTS.md)
- Reglas y organización del equipo
- Los 14 retos: comparación, fichas y votación
- Investigación: alerta temprana de desastres con datos NASA
- Plan de la app web (Next.js + TypeScript + Tailwind)
- Arquitectura de la app (capas, contratos y deploy)
- APIs verificadas y core NASA (endpoints, límites y fallbacks)
- Spike de datos: cómo conectar la idea base
- Workflow del equipo
- Herramientas del repo
- Bitácora del reinicio
- Guía visual de retos (PDF)
- #link("https://github.com/malbodifh/nasa-space-2026/tree/archive/mission-trainer")[Archivo del proyecto anterior]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. Estado del reinicio
El 14/11/2026 el equipo descartó el producto anterior (#strong[Mission
Trainer], reto \#3, formato trivia) y reabrió la elección del challenge.

- Todo el trabajo anterior quedó archivado en la rama
  `archive/mission-trainer` y en el tag `v1-mission-trainer`. Nada se
  borró del historial.
- En `main`, `staging` y `develop` queda solo el esqueleto: reglas,
  workflow, herramientas, mapa de retos y las guías visuales.
- La documentación vieja está #strong[solo] en la rama de archivo, para
  revisar qué se reutiliza.

```bash
git switch archive/mission-trainer    # ver todo lo anterior
git switch develop                    # volver al inicio limpio
```

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Regla de oro
#strong[Un challenge. Un repositorio. Un documento. Un demo que
funcione.]

No se trabaja en paralelo sobre ideas distintas. No se agregan features
después del corte de alcance. No se suben datos pesados ni claves al
repo. Todo cambio importante se registra en la bitácora.

#strong[Regla de datos:] si el dato NASA no está accesible hoy, el reto
no se elige.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Estructura
```text
NASA SPACEAPPS/
├── README.md                  # entrada rápida
├── AGENTS.md                  # contexto para sesiones de IA
├── CONTRIBUTING.md            # cómo contribuir
├── Makefile                   # comandos del equipo
├── pyproject.toml             # config de Ruff/Pytest
├── documentacion.md           # ESTE archivo: índice + decisiones
├── .github/                   # CI + plantillas
├── docs/
│   ├── 00-equipo-y-reglas.md
│   ├── 02-challenges-2026.md  # los 14 retos y cómo votar
│   ├── 18-workflow.md
│   ├── 19-herramientas.md
│   └── bitacora/
├── guides/
│   ├── src/                   # fuentes Typst (maquetación)
│   └── dist/                  # PDFs versionados
├── backups/ideas/spherex/     # idea descartada, archivada
├── assets/                    # imágenes y recursos
├── research/                  # notas de investigación
├── scripts/                   # automatizaciones
└── tests/                     # smoke tests del repo
```

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Decision Log
#figure(
  align(center)[#table(
    columns: 5,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,auto,),
    table.header([Fecha], [Decisión], [Alternativas], [Dueño], [Estado],),
    table.hline(),
    [2026-11-14], [Archivar Mission Trainer y reiniciar el
    producto], [Seguir con trivia], [Equipo], [#strong[Aprobada]],
    [2026-11-14], [Elegir el reto con votación 3-2-1 (ver
    `docs/02`)], [Decidir por intuición], [Equipo], [#strong[Abierta]],
    [2026-11-14], [La documentación vive en `.md`\; `guides/` solo
    maqueta], [Documentar en PDF], [Equipo], [#strong[Aprobada]],
    [2026-11-14], [Explorar alerta temprana de desastres con datos
    NASA], [Otras ideas], [Equipo], [#strong[En investigación]],
    [2026-11-14], [Stack de la app: Next.js + TypeScript + Tailwind +
    MapLibre], [Vanilla JS, React+Vite], [Equipo], [#strong[Aprobada]],
    [2026-11-14], [Arquitectura: monolito Next con Route Handlers, sin
    base de datos], [Backend aparte,
    Postgres], [Equipo], [#strong[Aprobada]],
  )]
  , kind: table
  )

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. Próximos pasos
+ Abrir `guides/dist/06-retos.pdf` y votar con el método de `docs/02`
  §5.
+ Registrar el reto elegido en este archivo (§5) y en `docs/02` §6.
+ Definir el producto mínimo y escribirlo en un documento nuevo.
+ Recién después: deploy, video de 30 s y submission en inglés.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Reglas mínimas
+ #strong[Un solo challenge] y un solo repositorio.
+ #strong[`main` siempre funciona]\; se trabaja en ramas (`feat/`,
  `fix/`, `docs/`).
+ #strong[Nadie mergea sin avisar]\; PRs chicos y rápidos.
+ #strong[Standup de 10 min] a las 9:00 y a las 21:00.
+ #strong[Bloqueo de 30 min]: si no avanzás, pedí ayuda.
+ #strong[Timebox de 2 h] para cualquier spike técnico.
+ #strong[Datos pesados fuera del repo]: `data/cache/`, `*.fits` y
  videos no se commitean.
+ #strong[Secretos fuera del repo]: `.env` y claves nunca se commitean.
+ #strong[Ciencia honesta]: cada dato cita una fuente; no se inventan
  cifras.
+ #strong[IA se declara]: si se usa para código, texto o imágenes, se
  anota.
+ #strong[Corte de alcance a T-12 h.]
+ #strong[Dormir es parte del plan.]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Cómo se actualiza este documento
+ #strong[Cada standup]: una línea en `docs/bitacora/`.
+ #strong[Cada decisión]: una fila en el Decision Log (§5).
+ #strong[Cada cambio de alcance]: se anota y se avisa al equipo.
+ #strong[Antes de dormir]: se actualiza el estado y se deja `main`
  funcionando.