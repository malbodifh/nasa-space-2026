# backups/ideas — ideas descartadas

Acá se guarda lo que se construyó para retos que **finalmente no elegimos**. No se borra:
sirve como evidencia de trabajo, para reutilizar código y para no repetir errores.

## `spherex/` — Planet X and SPHEREx (descartada 14/11/2026)

| Archivo | Qué era |
|---|---|
| `docs/03-spherex-tecnico.md` | SPHEREx, 102 bandas, escala, WCS-WAVE |
| `docs/04-apis.md` | SIA2, cutouts, HiPS, TAP (con estados verificados) |
| `docs/05-arquitectura.md` | FastAPI + React + caché de frames |
| `docs/07-pitch-30s.md` | Guion del pitch de SkyBlink |
| `docs/08-problemas-astrofisica.md` | Regla data-first e inventario de APIs |
| `docs/15-validacion-datos.md` | PoC real con WISE 0855 y Barnard's Star |
| `scripts/poc_spherex.py` | SIA2 → cutout FITS → PNG |
| `scripts/align_diff.py` | Alineación y diferencia de frames |
| `data/*.csv` | 301 filas SIA2 de los dos targets |
| `guides/` | Guía de benchmark y storyboard del pitch |
| `cache/` | 22 frames + manifests + GIFs (**solo local**, gitignoreado) |

### Por qué se descartó

SPHEREx tenía el mejor fit técnico (datos ya validados, pipeline probado), pero el equipo
prefirió **Build a Junior Astronaut Mission Trainer** en formato trivia: más fácil de
mostrar en 30 s, más impacto educativo y menos dependencia de APIs intermitentes (IRSA
devolvió 502 varias veces).

### Cómo recuperar algo

```bash
git mv backups/ideas/spherex/docs/05-arquitectura.md docs/05-arquitectura.md
```

El código de `scripts/` sigue funcionando: solo hay que devolverlo a `scripts/` y
reinstalar `reproject`, `astroalign` y `astropy` (ya están en `requirements-dev.txt`).
