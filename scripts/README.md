# scripts/

Utilidades reproducibles para datos y demo.

## Scripts implementados
| Script | Qué hace | Estado |
|---|---|---|
| `poc_spherex.py` | SIA2/CSV → cutouts → PNG → contact sheet + manifest | ✅ Probado |
| `align_diff.py` | Reproyecta a grilla común → stack → diferencia → GIF | ✅ Probado |

### Comandos
```bash
# 1. PoC con un CSV local (recomendado si SIA2 está intermitente)
.venv/bin/python scripts/poc_spherex.py \
  --csv data/samples/wise0855_sia2.csv \
  --name "WISE 0855" --ra 133.795129 --dec -7.245147 \
  --n 10 --size 0.1 --workers 5

# 2. Alinear, apilar y generar diferencia/GIF
.venv/bin/python scripts/align_diff.py \
  --slug wise-0855 --limit 10 --size 0.1 --out-size 64 --pixscale 6.15
```

## Scripts planeados
| Script | Qué hace |
|---|---|
| `query_sia2.py` | Consulta SIA2 y guarda CSV |
| `precompute.py` | Genera `data/cache/<target>/` completo para los 5 targets |
| `check_targets.py` | Verifica que los 5 targets tengan datos |
| `make_spectrum.py` | Espectro quick-look desde `WCS-WAVE` |

## Reglas
- Cada script debe correr con un comando y argumentos claros.
- Si baja datos, cachear y no repetir.
- Si falla, reintentar con backoff.
- Documentar en el README del script.
- No hardcodear rutas absolutas.
