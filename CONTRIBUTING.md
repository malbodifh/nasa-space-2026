# Contribuir — Astral Codes

> **Regla:** si no está documentado, no existe. Si no se puede probar, no entra.
> Guía completa: [`docs/18-workflow.md`](docs/18-workflow.md).

---

## 1. Quick start

```bash
git clone <URL>
cd "NASA SPACEAPPS"

make setup          # crea .venv e instala dependencias
source .venv/bin/activate

make backend        # API en http://localhost:8000
make test           # tests
make guides         # compila las guías Typst
```

Si no tenés `make`, mirá los comandos equivalentes en `docs/19-herramientas.md`.

---

## 2. Ramas

El repo usa **4 niveles**:

```text
main        producción (solo merge desde staging)
  ↑
staging     puente de integración / pre-producción
  ↑
develop     desarrollo diario
  ↑
andy · david · samuel · jorge · leo    rama personal
```

| Rama | Quién escribe | Hacia dónde |
|---|---|---|
| `main` | nadie directo | — |
| `staging` | quien integra | `main` |
| `develop` | merges de PR | `staging` |
| `andy` / `david` / `samuel` / `jorge` / `leo` | su dueño | `develop` |

Sub-ramas opcionales para algo grande: `andy/blink-player`, `fix/cutout-timeout`.

**Nunca** trabajar directo en `main`, `develop` ni `staging`. Si te equivocaste, mirá
[`docs/18-workflow.md`](docs/18-workflow.md) § 3.1: se revierte, no se reescribe.

```bash
make branches     # crea las ramas si faltan
make sync         # actualiza main/develop/staging desde origin
```

---

## 3. Commits

Formato corto, en imperativo:

```text
add SIA2 query
fix cutout parser
docs workflow
data precompute wise0855
```

Un commit = un cambio lógico. Si el mensaje necesita “y”, probablemente son dos commits.

---

## 4. Pull Requests

1. Abrí el issue (plantilla **Tarea**).
2. Creá la rama.
3. Hacé el cambio más chico que funcione.
4. `make check` (lint + tests).
5. Abrí el PR con la plantilla.
6. Pedí review a 1 persona.
7. Mergeá cuando esté aprobado y CI verde.

**Tamaño ideal:** <300 líneas. Si es más, partilo.

**SLA de review:** 15 minutos durante el hackathon.

---

## 5. Contrato de datos (obligatorio)

Si la feature usa datos, el issue y el PR deben declarar:

```text
Dataset:
API/endpoint:
Campos:
Acceso:
Caché:
Fallback:
Qué puedo afirmar:
Qué NO puedo afirmar:
```

Sin esto, no se mergea. Ver [`docs/08-contenido-y-datos.md`](docs/08-contenido-y-datos.md), sección 0.4.

---

## 6. Definition of Done

- [ ] Funciona en la demo (no solo en mi máquina).
- [ ] `make check` pasa.
- [ ] Está documentado en una línea.
- [ ] No rompe `main`.
- [ ] Tiene contrato de datos (si aplica).
- [ ] No agregué secretos ni datos pesados.
- [ ] Si usé IA/SI, está declarado.

---

## 7. Secretos y datos

- **Nunca** commitear `.env`, claves, tokens.
- **Nunca** commitear `data/cache/`, `*.fits`, videos pesados.
- Usar `.env.example` como plantilla.
- Si se filtró una clave, avisar y rotarla.

---

## 8. IA / SI

NASA 2026 permite IA, pero exige declararla.

- **Sí:** código, tests, docs, traducción, ideas, imágenes de apoyo.
- **No:** inventar resultados científicos, datos falsos, suplantar el trabajo del equipo.
- **Declarar** herramienta, uso y partes generadas.
- **Marcar** imágenes/videos generados.
- **Revisar** todo: alucinaciones, licencias, errores.

---

## 9. Documentación y guías

- La fuente única de verdad es [`documentacion.md`](documentacion.md).
- Las decisiones van al **Decision Log**.
- La bitácora se actualiza en cada standup.
- Las guías visuales viven en `guides/` y se compilan con `make guides`.

---

## 10. Emergencias

- Si `main` se rompe: avisar en el canal, arreglar primero, preguntar después.
- Si una API falla: usar caché/fallback, no bloquear al equipo.
- Si no llegamos: recortar alcance, no calidad del pitch.
- Si alguien está bloqueado: pedir ayuda a los 30 minutos.
