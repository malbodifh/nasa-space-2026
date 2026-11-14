# data/

Datos locales del proyecto.

## Carpetas
- `cache/` — datos descargados y procesados. **Gitignored.** No se commitea.
- `samples/` — muestras chicas que sí se pueden commitear (1–2 frames, JSON de ejemplo).

## Regla
**Nunca** subir FITS grandes, videos o cachés al repo. Si alguien necesita los datos, se regeneran con `scripts/precompute.py` o se comparten por link.

## Convención
```text
data/cache/<target_slug>/
├── manifest.json
├── frame_000.png
├── frame_001.png
├── diff_000.png
└── README.md
```
