# 19 — Herramientas del repo

> **Qué está instalado, qué comando usar y cómo replicarlo en tu máquina.**

---

## 1. Lo que ya está en este entorno

| Herramienta | Versión | Estado | Uso |
|---|---|---|---|
| Python | 3.14.7 | ✅ | Backend/scripts |
| venv | — | ✅ | `.venv/` |
| NumPy | 2.5.4 | ✅ | Arrays |
| Pillow | 13.0.0 | ✅ | PNG/GIF |
| Astropy | 8.0.2 | ✅ | FITS/WCS |
| Astropy-healpix | — | ✅ | Tiles HiPS |
| Reproject | 0.21.0 | ✅ | Reproyección |
| Requests | — | ✅ | APIs |
| Typst | 0.15.1 | ✅ | Guías PDF/PNG |
| ffmpeg | 9.0.2 | ✅ | Video/GIF |
| Node | 26.11.1 | ✅ | Frontend |
| npm | ❌ | No instalado | Samuel debe instalarlo |
| Git | — | Ver `git --version` | Versionado |
| GitHub CLI | — | Ver `gh --version` | Opcional |

> **Nota:** el entorno del sandbox no tiene `npm`; en las máquinas del equipo sí debería estar.

---

## 2. Comandos principales

```bash
make help        # lista de targets
make setup       # crea .venv e instala requirements-dev
make backend     # FastAPI en http://localhost:8000
make frontend    # React/Vite (si existe package.json)
make test        # pytest
make lint        # ruff check
make format      # ruff format
make check       # lint + tests (lo mismo que CI)
make guides      # compila Typst a PDF/PNG
make precompute  # baja y procesa WISE 0855 + Barnard
make clean       # limpia cachés de herramientas
```

---

## 3. Setup en una máquina nueva

### Linux / macOS
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements-dev.txt
pre-commit install
```

### Windows (PowerShell)
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements-dev.txt
pre-commit install
```

### Frontend
```bash
cd src/frontend
npm install
npm run dev
```

---

## 4. Calidad de código

### Ruff
- Config en `pyproject.toml`.
- `make lint` / `make format`.
- Reglas: E, F, I, UP, B.

### Pytest
- Tests en `tests/`.
- `make test`.
- CI corre lo mismo.

### Pre-commit
```bash
pre-commit install
pre-commit run --all-files
```
Hooks:
- trailing whitespace, EOF, YAML/JSON, merge conflicts.
- archivos grandes (>2 MB).
- claves privadas.
- Ruff + Ruff format.

---

## 5. GitHub Actions

Archivo: `.github/workflows/ci.yml`.

Jobs:
1. **Python:** instala dependencias, `ruff check`, `pytest`.
2. **Frontend:** build si existe `src/frontend/package.json`.
3. **Guías:** instala Typst, `make guides`, sube artifact.

**Regla:** no se mergea con CI rojo.

---

## 6. Typst (guías visuales)

### Compilar
```bash
make guides
```

### Salida
```text
guides/dist/
├── 01-rubrica.pdf
├── 02-benchmark.pdf
├── 03-plan-48h.pdf
├── 04-pitch.pdf
├── 01-rubrica-1.png
├── ...
```

### Editar
- `guides/theme.typ` — colores, tipografía, tarjetas.
- `guides/01-rubrica.typ` — rúbrica y prioridades.
- `guides/02-benchmark.typ` — competidores y diferenciación.
- `guides/03-plan-48h.typ` — cronograma y roles.
- `guides/04-pitch.typ` — storyboard del video de 30 s.

### Requisito
Typst 0.15+ (`typst --version`).

---

## 7. Datos

### Cache
```text
data/cache/<slug>/
├── manifest.json
├── frame_XXX.png
├── aligned_XXX.png
├── diff_XXX.png
├── blink.gif
└── fits/XXX.fits
```

### Reglas
- `data/cache/` está gitignored.
- `data/samples/` tiene CSVs chicos para reproducir.
- No subir FITS/Videos al repo.

### Si IRSA falla
- Usar los CSV de `data/samples/`.
- Usar `data/cache/` ya precomputado.
- Reintentar con backoff.
- Consultar el estado en el canal.

---

## 8. Editor recomendado (VS Code)

Extensiones:
- **Python** (Microsoft)
- **Ruff**
- **Typst LSP** (o `tinymist`)
- **Markdown All in One**
- **GitLens**
- **Error Lens**

Settings:
- Format on save con Ruff.
- ruler a 100.
- spell check en español/inglés (opcional).

---

## 9. Seguridad

- `.env` nunca se commitea.
- `detect-private-key` en pre-commit.
- No pegar tokens en issues/PRs.
- Si se filtra una clave: rotarla y avisar.
- Links públicos para la submission (sin login).

---

## 10. Troubleshooting

| Problema | Solución |
|---|---|
| `make: command not found` | Instalar `make` o correr los comandos a mano |
| `python3 -m venv` falla | Instalar `python3-venv` |
| `npm: command not found` | Instalar Node.js LTS |
| `typst: command not found` | Instalar Typst 0.15+ |
| IRSA 502 | Usar CSV/caché; reintentar más tarde |
| `ruff` falla por imports | `make format` y revisar |
| CI rojo en frontend | Revisar `package-lock.json` / `npm ci` |
| Puerto 8000 ocupado | `uvicorn --port 8001` |

---

## 11. Enlaces

- [Workflow](18-workflow.md)
- [Reglas del equipo](00-equipo-y-reglas.md)
- [Backlog](14-backlog.md)
- [APIs](04-apis.md)
- [SPHEREx técnico](03-spherex-tecnico.md)
