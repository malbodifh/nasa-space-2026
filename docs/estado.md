# Estado del proyecto

> **Única fuente viva del estado.** Cambia a diario. Si algo no está acá o enlazado desde acá,
> no existe. Cada decisión nueva se registra en [`decisiones/`](decisiones/) y se enlaza abajo.
> Última actualización: **2026-11-14**.

---

## 1. Datos del equipo

| Campo | Valor |
|---|---|
| Equipo | **Astral Codes** |
| Evento | NASA Space Apps Challenge 2026 |
| Integrantes | Andy, David, Samuel, Jorge, Leo |
| Reto de trabajo | **Dancing with the SARs** (NISAR). La votación formal sigue sin registrarse: confirmar con el equipo y anotarlo en [`decisiones/`](decisiones/) |
| Producto | **Memoria de Fuego**: alertas de desastres para Costa Rica y, por cada evento, cómo cambió la superficie vista con radar NISAR |
| Región | Costa Rica |
| Repo | [malbodifh/nasa-space-2026](https://github.com/malbodifh/nasa-space-2026) |
| Deploy | Pendiente (Vercel, Root Directory `web/`; ver [`tecnico/herramientas.md`](tecnico/herramientas.md)) |
| Entrega | Domingo 15/11/2026, **23:59** hora local del evento |

## 2. Qué existe hoy

- **App** en [`web/`](../web/README.md): portada con alertas y mapa, y página de estudio con
  imágenes de radar comparadas.
- **Alertas** con 9 fuentes en vivo (USGS, OVSICORI, RSN, PTWC, NHC, Open-Meteo, GDACS, EONET y
  NISAR). FIRMS está conectado pero oculto. Reglas en [`producto/alertas.md`](producto/alertas.md).
- **Radar NISAR** real (ASF DAAC), con 4 zonas precalculadas. Método en
  [`producto/nisar.md`](producto/nisar.md).
- **Qué no hace**: [`producto/limites.md`](producto/limites.md).

## 3. Pendientes

1. Registrar el reto elegido (ver §1).
2. Deploy en Vercel con `FIRMS_MAP_KEY` como variable de entorno.
3. Confirmación cruzada entre fuentes y nivel de confianza por alerta.
4. Video de 30 s y submission en inglés.

## 4. Decisiones

| Fecha | Decisión | Documento |
|---|---|---|
| 2026-11-14 | Archivar Mission Trainer y reiniciar | [0001](decisiones/0001-archivar-mission-trainer.md) |
| 2026-11-14 | Next.js + TypeScript + Tailwind + MapLibre, monolito sin base de datos | [0002](decisiones/0002-stack-y-monolito.md) |
| 2026-11-14 | Costa Rica, todos los desastres naturales | [0003](decisiones/0003-region-y-alcance.md) |
| 2026-11-14 | Alertas como entrada y radar NISAR como estudio | [0004](decisiones/0004-alertas-y-radar.md) |
| 2026-11-14 | Identidad visual de Aulemo sin su logo | [0005](decisiones/0005-identidad-visual.md) |
| 2026-11-14 | Ocultar incendios por ahora | [0006](decisiones/0006-ocultar-incendios.md) |
| 2026-11-14 | Color por desastre y áreas solo si está en curso | [0007](decisiones/0007-colores-y-areas.md) |
| 2026-11-14 | La documentación vive en `docs/` en Markdown; `guides/` solo tiene la guía visual de retos | [0008](decisiones/0008-documentacion.md) |

## 5. Reglas mínimas

1. **Un solo reto** y un solo repositorio. `main` siempre funciona; se trabaja en ramas
   (`feat/`, `fix/`, `docs/`) y PRs chicos.
2. Nadie mergea sin avisar. Standup de 10 min a las 9:00 y a las 21:00.
3. Bloqueo de 30 min: pedir ayuda. Timebox de 2 h para cualquier spike.
4. Datos pesados y secretos fuera del repo (`.env`, claves, `*.fits`, videos).
5. **Ciencia honesta**: cada dato cita fuente y hora; no se inventan cifras.
6. La IA se declara: si se usa para código, texto o imágenes, se anota.
7. Corte de alcance a T-12 h. Dormir es parte del plan.

Detalle en [`equipo/reglas.md`](equipo/reglas.md) y [`equipo/workflow.md`](equipo/workflow.md).

## 6. Cómo se mantiene

- **Cada standup**: una línea en [`bitacora/`](bitacora/).
- **Cada decisión**: un archivo en `decisiones/` y una fila en §4. Las decisiones no se editan:
  se reemplazan por una nueva que dice cuál sustituye.
- **Cada cambio de alcance**: se actualiza §2 y §3 y se avisa al equipo.
- **Un dato, un dueño**: las fuentes viven en [`tecnico/fuentes.md`](tecnico/fuentes.md) y las
  reglas de alerta en [`producto/alertas.md`](producto/alertas.md); los demás documentos enlazan.
