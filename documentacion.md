# Documentación — Astral Codes / NASA Space Apps Challenge 2026

> **Este archivo es la fuente única de verdad del equipo.**
> Si algo no está acá, no existe. Si cambia una decisión, se actualiza acá el mismo día.
> Última actualización: **2026-11-14** (reinicio del proyecto).

---

## 1. Datos del equipo

| Campo | Valor |
|---|---|
| Equipo | **Astral Codes** |
| Evento | NASA Space Apps Challenge 2026 — **14 y 15 de noviembre de 2026** |
| Integrantes | Andy, David, Samuel, Jorge, Leo |
| Challenge | **Sin elegir** — decisión abierta |
| Producto | **Sin definir** — depende del reto |
| Repo | [malbodifh/nasa-space-2026](https://github.com/malbodifh/nasa-space-2026) |
| Deploy | *(pendiente)* |
| Entrega | Domingo 15/11/2026, **23:59 hora local del evento** |

### Enlaces rápidos

- [Base para escribir código (AGENTS.md)](AGENTS.md)
- [Reglas y organización del equipo](docs/00-equipo-y-reglas.md)
- [Los 14 retos: comparación, fichas y votación](docs/02-challenges-2026.md)
- [Investigación: alerta temprana de desastres con datos NASA](docs/22-investigacion-desastres.md)
- [Plan de la app web (Next.js + TypeScript + Tailwind)](docs/23-plan-app.md)
- [Arquitectura de la app (capas, contratos y deploy)](docs/24-arquitectura-app.md)
- [APIs verificadas y core NASA (endpoints, límites y fallbacks)](docs/25-api-research.md)
- [Spike de datos: cómo conectar la idea base](docs/26-spike-datos.md)
- [Workflow del equipo](docs/18-workflow.md)
- [Herramientas del repo](docs/19-herramientas.md)
- [Bitácora del reinicio](docs/bitacora/2026-11-14.md)
- [Guía visual de retos (PDF)](guides/dist/06-retos.pdf)
- [Archivo del proyecto anterior](https://github.com/malbodifh/nasa-space-2026/tree/archive/mission-trainer)

---

## 2. Estado del reinicio

El 14/11/2026 el equipo descartó el producto anterior (**Mission Trainer**, reto #3, formato
trivia) y reabrió la elección del challenge.

- Todo el trabajo anterior quedó archivado en la rama `archive/mission-trainer` y en el
  tag `v1-mission-trainer`. Nada se borró del historial.
- En `main`, `staging` y `develop` queda solo el esqueleto: reglas, workflow, herramientas,
  mapa de retos y las guías visuales.
- La documentación vieja está **solo** en la rama de archivo, para revisar qué se reutiliza.

```bash
git switch archive/mission-trainer    # ver todo lo anterior
git switch develop                    # volver al inicio limpio
```

---

## 3. Regla de oro

**Un challenge. Un repositorio. Un documento. Un demo que funcione.**

No se trabaja en paralelo sobre ideas distintas. No se agregan features después del corte
de alcance. No se suben datos pesados ni claves al repo. Todo cambio importante se registra
en la bitácora.

**Regla de datos:** si el dato NASA no está accesible hoy, el reto no se elige.

---

## 4. Estructura

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

---

## 5. Decision Log

| Fecha | Decisión | Alternativas | Dueño | Estado |
|---|---|---|---|---|
| 2026-11-14 | Archivar Mission Trainer y reiniciar el producto | Seguir con trivia | Equipo | **Aprobada** |
| 2026-11-14 | Elegir el reto con votación 3-2-1 (ver `docs/02`) | Decidir por intuición | Equipo | **Abierta** |
| 2026-11-14 | La documentación vive en `.md`; `guides/` solo maqueta | Documentar en PDF | Equipo | **Aprobada** |
| 2026-11-14 | Explorar alerta temprana de desastres con datos NASA | Otras ideas | Equipo | **En investigación** |
| 2026-11-14 | Stack de la app: Next.js + TypeScript + Tailwind + MapLibre | Vanilla JS, React+Vite | Equipo | **Aprobada** |
| 2026-11-14 | Arquitectura: monolito Next con Route Handlers, sin base de datos | Backend aparte, Postgres | Equipo | **Aprobada** |

---

## 6. Próximos pasos

1. Abrir `guides/dist/06-retos.pdf` y votar con el método de `docs/02` §5.
2. Registrar el reto elegido en este archivo (§5) y en `docs/02` §6.
3. Definir el producto mínimo y escribirlo en un documento nuevo.
4. Recién después: deploy, video de 30 s y submission en inglés.

---

## 7. Reglas mínimas

1. **Un solo challenge** y un solo repositorio.
2. **`main` siempre funciona**; se trabaja en ramas (`feat/`, `fix/`, `docs/`).
3. **Nadie mergea sin avisar**; PRs chicos y rápidos.
4. **Standup de 10 min** a las 9:00 y a las 21:00.
5. **Bloqueo de 30 min**: si no avanzás, pedí ayuda.
6. **Timebox de 2 h** para cualquier spike técnico.
7. **Datos pesados fuera del repo**: `data/cache/`, `*.fits` y videos no se commitean.
8. **Secretos fuera del repo**: `.env` y claves nunca se commitean.
9. **Ciencia honesta**: cada dato cita una fuente; no se inventan cifras.
10. **IA se declara**: si se usa para código, texto o imágenes, se anota.
11. **Corte de alcance a T-12 h.**
12. **Dormir es parte del plan.**

---

## 8. Cómo se actualiza este documento

1. **Cada standup**: una línea en `docs/bitacora/`.
2. **Cada decisión**: una fila en el Decision Log (§5).
3. **Cada cambio de alcance**: se anota y se avisa al equipo.
4. **Antes de dormir**: se actualiza el estado y se deja `main` funcionando.
