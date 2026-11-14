# 14 — Backlog de tareas

> **Cómo usarlo:** cada tarea tiene prioridad, dueño tentativo y estimación. Se toma una, se abre un issue, se hace un PR.
> **Regla:** si una tarea no está acá, no se hace (o se agrega primero).

---

## P0 — Imprescindible para el demo

| ID | Tarea | Dueño | Est. | Depende de |
|---|---|---|---|---|
| P0-01 | Crear repo, README y ramas | Andy | 15 min | — |
| P0-02 | Script `query_sia2.py` que devuelve CSV | David | 1 h | — |
| P0-03 | Script `fetch_cutouts.py` que baja N cutouts | David | 2 h | P0-02 |
| P0-04 | Script `precompute.py` que genera PNGs + manifest | David | 3 h | P0-03 |
| P0-05 | Backend FastAPI con `/api/targets` y `/api/frames` | David | 2 h | P0-04 |
| P0-06 | Frontend: layout + búsqueda + presets | Samuel | 2 h | — |
| P0-07 | Blink player (canvas, play/pause/slider) | Samuel | 3 h | P0-05, P0-06 |
| P0-08 | Modo diferencia | Samuel | 2 h | P0-07 |
| P0-09 | Ficha de objeto (RA/Dec, fecha, banda, flags) | Andy | 1 h | P0-05 |
| P0-10 | Precomputar los 5 targets | David | 3 h | P0-04 |
| P0-11 | Deploy (frontend + backend) | Andy | 2 h | P0-07 |
| P0-12 | Video de 30 s + subtítulos | Leo | 3 h | P0-07 |
| P0-13 | Submission en inglés | Andy | 2 h | Todos |
| P0-14 | QA de los 5 targets | Jorge | 2 h | P0-10 |

**Total estimado:** ~30 h de trabajo. Con 5 personas en 2 días, es factible si se paraleliza.

---

## P1 — Diferenciadores (si hay tiempo)

| ID | Tarea | Dueño | Est. | Depende de |
|---|---|---|---|---|
| P1-01 | Slider 102 bandas con HiPS PNG | Samuel | 2 h | P0-06 |
| P1-02 | Espectro quick-look (WCS-WAVE) | David | 3 h | P0-04 |
| P1-03 | Trayectoria de centroides | Jorge | 3 h | P0-08 |
| P1-04 | URL compartible `?ra=&dec=` | Samuel | 30 min | P0-06 |
| P1-05 | Overlay de flags de contaminación | Andy | 1 h | P0-09 |
| P1-06 | Ficha “¿hay un exoplaneta acá?” | Jorge | 1 h | P0-09 |
| P1-07 | Modo oscuro / pulido visual | Leo | 1 h | P0-06 |
| P1-08 | GIF de blink para el pitch | Leo | 30 min | P0-07 |

---

## P2 — Bonus (solo si sobra tiempo)

| ID | Tarea | Dueño | Est. |
|---|---|---|---|
| P2-01 | Modo live para cualquier coordenada | David | 3 h |
| P2-02 | Aladin Lite con Gaia/WISE overlay | Samuel | 2 h |
| P2-03 | MOST: asteroides/cometas conocidos | Jorge | 2 h |
| P2-04 | Landing con APOD/NASA Images | Leo | 1 h |
| P2-05 | Exportar el blink como GIF/MP4 | Samuel | 1 h |
| P2-06 | Tests automatizados | David | 2 h |
| P2-07 | Accesibilidad (teclado, contraste) | Leo | 1 h |

---

## Cómo se toma una tarea

1. Elegí una tarea **P0** que no esté tomada.
2. Abrí un issue con el ID (`P0-03`).
3. Creá una rama `feat/p0-03-fetch-cutouts`.
4. Hacé el cambio más chico que funcione.
5. Abrí un PR y pedí review.
6. Cuando se mergea, mové la tarjeta a “Done”.

---

## Definition of Ready (para tomar una tarea)

- [ ] Está clara la salida (qué archivo/función/pantalla).
- [ ] Sé cómo probarla.
- [ ] No depende de algo que no existe.
- [ ] Está en el backlog con prioridad.
- [ ] Tiene **contrato de datos**: dataset, API/endpoint, campos, caché y fallback.
- [ ] Usa solo datos del inventario (`docs/08`, tabla 0.1) o justifica uno nuevo.

## Definition of Done

- [ ] Funciona en la demo.
- [ ] Está documentada en una línea.
- [ ] No rompe `main`.
- [ ] Tiene PR mergeado.
- [ ] Si usa datos, hay script/caché identificable.
- [ ] Si usa IA, está declarado.
