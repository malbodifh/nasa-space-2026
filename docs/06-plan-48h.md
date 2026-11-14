# 06 — Plan de 48 horas

> **Evento:** sábado 14 y domingo 15 de noviembre de 2026.
> **Entrega:** domingo 15/11 a las **23:59 hora local** del evento.
> **Regla:** el demo tiene que funcionar **sin internet** y **sin IRSA en vivo**.

---

## 1. Objetivo del fin de semana

Tener un **blink comparator público de SPHEREx** con:
- 5 targets precomputados (los del challenge).
- Búsqueda por coordenada (live como bonus).
- Reproducción tipo video, slider de épocas y modo diferencia.
- Ficha de objeto con metadata y flags.
- Slider de 102 bandas (HiPS) si hay tiempo.
- Espectro y trayectoria de centroides como bonus.
- Video de 30 s y submission completos.

**No objetivo:** pipeline científico completo, astrometría publicable, cobertura total del cielo.

---

## 2. Hitos (milestones)

| Hito | Qué significa | Criterio de éxito | Hora límite |
|---|---|---|---|
| **M0** | Decisión + repo + roles | Challenge votado; repo creado; ramas | Sábado 12:00 |
| **M1** | PoC de datos | 1 SIA2 query + 1 cutout + 1 PNG | Sábado 15:00 |
| **M2** | 1 target end-to-end | WISE 0855 con 10 frames y blink | Sábado 20:00 |
| **M3** | 5 targets + UI | Los 5 targets cacheados y reproduciéndose | Domingo 10:00 |
| **M4** | Diferencia + ficha | Modo diff, metadata, flags | Domingo 13:00 |
| **M5** | Bonus | 102 bandas / espectro / trayectoria | Domingo 16:00 |
| **M6** | Freeze + pitch | Video 30 s, deck, submission | Domingo 19:00 |
| **M7** | Entrega | Submit for Judging | Domingo 22:00 |

> Si un hito se atrasa, se recorta el alcance del siguiente; **nunca** se recorta el pitch ni la submission.

---

## 3. Plan hora por hora

### Día 1 — Sábado 14

| Hora | Bloque | Andy (lead/UI) | David (datos) | Samuel (frontend) | Jorge (ciencia/QA) | Leo (diseño/pitch) |
|---|---|---|---|---|---|---|
| 09:00–10:00 | Kickoff | Votar challenge, roles, reglas | Revisar APIs | Revisar stack | Revisar targets | Revisar identidad |
| 10:00–12:00 | **M0** | Crear repo, issues, README | Probar SIA2/cutout | Setup Vite/React | Validar coordenadas | Moodboard/logo |
| 12:00–13:00 | Almuerzo | — | — | — | — | — |
| 13:00–15:00 | **M1** | Wireframe del blink | PoC: SIA2→cutout→PNG | Componente canvas | Verificar frames | Guion del pitch |
| 15:00–18:00 | **M2** | UI de búsqueda + presets | Precomputar WISE 0855 | Blink player | QA de datos | Slides base |
| 18:00–20:00 | Integración | Conectar API | Manifiesto + cache | Slider de épocas | Validar 1 target | Grabar pantallas |
| 20:00–21:00 | Cena | — | — | — | — | — |
| 21:00–23:00 | **M2** | Demo interna | Precomputar Barnard | Modo diff | QA | Editar teaser |
| 23:00 | Standup + dormir | Actualizar bitácora | Dejar script reproducible | Commit | Notas | Backup |

### Día 2 — Domingo 15

| Hora | Bloque | Andy | David | Samuel | Jorge | Leo |
|---|---|---|---|---|---|---|
| 08:00–10:00 | **M3** | Revisar 5 targets | Precomputar 3 restantes | Presets + share URL | QA de los 5 | Hero/landing |
| 10:00–12:00 | **M4** | Ficha de objeto | Diff + flags | Modo diff UI | Validar ciencia | Slides |
| 12:00–13:00 | **Corte de alcance** | Congelar features | Congelar pipeline | Congelar UI | Congelar QA | Congelar guion |
| 13:00–16:00 | **M5** | 102 bandas | Espectro/trayectoria | Pulir | QA final | Editar video |
| 16:00–18:00 | **M6** | Ensayo 1 | Fix bugs | Fix bugs | Revisar submission | Subtítulos |
| 18:00–20:00 | **M6** | Ensayo 2 | Deploy | Deploy | Checklist | Video final |
| 20:00–22:00 | **M7** | Submission | Verificar links | Verificar links | Verificar datos | Verificar demo |
| 22:00–23:59 | Buffer | Submit for Judging | — | — | — | — |

---

## 4. Roles y responsabilidades (RACI simplificado)

| Área | Responsable | Aprueba | Consulta | Informa |
|---|---|---|---|---|
| Challenge / alcance | Andy | Equipo | Jorge | Todos |
| Backend / datos | David | Andy | Jorge | Todos |
| Frontend / UI | Samuel | Andy | Leo | Todos |
| Ciencia / QA | Jorge | Andy | David | Todos |
| Diseño / pitch / video | Leo | Andy | Samuel | Todos |
| Submission | Andy | Equipo | Todos | Todos |

**Regla:** cada área tiene un dueño; si el dueño no está, el backup decide.

---

## 5. Camino crítico

```text
SIA2 → cutout → FITS → PNG → manifest → frontend → demo
```

Si algo se atrasa, se prioriza en este orden:
1. **Que el blink funcione** con 1 target.
2. **Que haya 5 targets**.
3. **Que el modo diff funcione**.
4. **Que la ficha muestre metadata**.
5. **102 bandas / espectro / trayectoria** (bonus).
6. **Live mode** (bonus).

---

## 6. Qué hacer si arrancamos tarde (versión 24 h)

Si el equipo empieza el sábado a la noche o el domingo temprano:

| Bloque | Qué se hace | Qué se recorta |
|---|---|---|
| 0–2 h | Repo + 1 target + PNG | 5 targets |
| 2–4 h | Blink mínimo | Slider 102 bandas |
| 4–6 h | 3 targets precargados | Live mode |
| 6–8 h | Ficha + diff | Espectro |
| 8–10 h | Deploy + video | Trayectoria |
| 10–12 h | Submission + ensayo | Todo lo demás |

**Mínimo viable para competir:** 3 targets, blink, diff, ficha, video de 30 s, submission en inglés.

---

## 7. Reglas de trabajo durante el evento

- **Standup 09:00 y 21:00** (10 min).
- **Bloques de 90 min** con foco; notificaciones apagadas.
- **PRs chicos**; revisión en <15 min.
- **Nadie toca `main` sin PR**.
- **Si algo no funciona en 30 min, pedir ayuda.**
- **Comida y descanso** obligatorios.
- **Actualizar `documentacion.md`** al final del día.
- **No se agregan features después del corte de alcance.**

---

## 8. Checklist de demo (antes del pitch)

- [ ] Los 5 targets cargan.
- [ ] El botón play funciona.
- [ ] El slider de épocas funciona.
- [ ] El modo diff funciona.
- [ ] La ficha muestra RA/Dec, fecha, banda, flags.
- [ ] La URL compartible funciona.
- [ ] El sitio carga en <3 s.
- [ ] Funciona sin internet (cache).
- [ ] Funciona en Chrome y Firefox.
- [ ] No hay errores en consola.
- [ ] Los créditos NASA/IRSA están visibles.
- [ ] El video de 30 s está grabado y subtitulado.

---

## 9. Checklist de submission (resumen)

- [ ] Nombre del proyecto.
- [ ] High-Level Summary en inglés.
- [ ] Link al demo (público).
- [ ] Link al proyecto final (público).
- [ ] Descripción detallada.
- [ ] Uso de SI declarado.
- [ ] NASA data listada.
- [ ] Referencias completas.
- [ ] Equipo registrado en el mismo evento.
- [ ] “Submit for Judging” antes de las 23:59.

Detalle completo en [10-submission-checklist.md](10-submission-checklist.md).

---

## 10. Después del evento

- [ ] Guardar el repo con tag `v1.0`.
- [ ] Archivar los datos cacheados (opcional).
- [ ] Escribir un post-mortem de 1 página.
- [ ] Agradecer al equipo.
- [ ] Descansar.
