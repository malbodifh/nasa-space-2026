# src/backend/

Backend del proyecto: API, ingesta de datos, procesamiento FITS y caché.

## Stack
- Python 3.12+ (probado en 3.14)
- FastAPI + Uvicorn
- Astropy, NumPy, Pillow
- Reproject / Astroalign (alineación)
- Requests

## Instalación
```bash
cd src/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Correr
```bash
uvicorn app.main:app --reload --port 8000
```

## Estructura
```text
app/
├── main.py
├── config.py
├── routes/
├── ingest/
└── models.py
```

## Reglas
- No commitear `.env` ni datos pesados.
- Todo endpoint debe tener timeout y manejo de errores.
- El frontend nunca llama a IRSA directamente.
- Cachear todo lo que se descargue.
