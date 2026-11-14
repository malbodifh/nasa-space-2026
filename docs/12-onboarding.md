# 12 — Onboarding: cómo empezar en 30 minutos

> Para cualquier integrante nuevo (o para vos si te perdiste).
> **No leas todo.** Hacé esto en orden.

---

## Minuto 0–5: contexto

1. Leer [`documentacion.md`](../documentacion.md) — estado y decisiones.
2. Leer [`docs/00-equipo-y-reglas.md`](00-equipo-y-reglas.md) — cómo trabajamos.
3. Leer [`docs/01-decision-challenge.md`](01-decision-challenge.md) — por qué la trivia de astronauta junior.

---

## Minuto 5–10: elegir tu rol

| Si te gusta… | Tu rol | Empezá por |
|---|---|---|
| Python, datos, FITS | Backend/datos | `scripts/query_sia2.py`, `src/backend/` |
| React, diseño de UI | Frontend | `src/frontend/` |
| Ciencia/validar | Ciencia/QA | `docs/04-datos-nasa.md`, `data/questions.json` |
| Diseño, video, pitch | Diseño/storytelling | `docs/07-pitch-30s.md`, `assets/` |
| Organizar, integrar | Lead/producto | `documentacion.md`, `docs/06-plan-48h.md` |

---

## Minuto 10–20: setup

```bash
# 1. Clonar el repo
git clone <URL>
cd "NASA SPACEAPPS"

# 2. Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r src/backend/requirements.txt

# 3. Frontend (cuando exista)
cd src/frontend
npm install
```

> Si no tenés Python o Node, avisá en el canal. No pierdas 1 h instalando.

---

## Minuto 20–30: primera contribución

Elegí una tarea del [backlog](14-backlog.md) y:
1. Comentá en el issue “lo tomo”.
2. Creá una rama `feat/mi-tarea`.
3. Hacé el cambio más chico posible.
4. Abrí un PR.
5. Pedí review a alguien.

**Regla:** no empieces por la tarea más difícil. Empezá por algo que puedas terminar en 30 min.

---

## Checklist del primer día

- [ ] Leí `documentacion.md`.
- [ ] Sé cuál es el challenge.
- [ ] Sé cuál es mi rol.
- [ ] Tengo el repo clonado.
- [ ] Tengo el entorno funcionando.
- [ ] Tomé una tarea del backlog.
- [ ] Hice mi primer commit.
- [ ] Sé a quién pedirle ayuda.

---

## A quién preguntar

| Tema | Persona |
|---|---|
| Challenge / alcance | Andy |
| Datos / FITS / APIs | David |
| Frontend / UI | Samuel |
| Ciencia / validación | Jorge |
| Diseño / video / pitch | Leo |
| Git / deploy | Andy o David |

---

## Frases útiles

- “No entiendo X” → preguntar en el canal, no quedarse.
- “Estoy trabado” → pedir ayuda a los 30 min.
- “Esto va a tardar más” → avisar y recortar alcance.
- “Encontré un problema” → issue, no DM.
- “Ya está” → PR, no “lo subí a mi rama”.
