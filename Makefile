SHELL := /bin/bash
VENV := .venv
PY := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
TYPST := typst

.DEFAULT_GOAL := help

.PHONY: help setup backend frontend test lint format guides precompute clean check

help: ## Mostrar esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

setup: ## Crear .venv e instalar dependencias de desarrollo
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements-dev.txt
	@echo ""
	@echo "Listo. Activá el entorno con: source $(VENV)/bin/activate"
	@echo "Luego: make backend / make test / make guides"

backend: ## Correr la API en modo desarrollo (http://localhost:8000)
	$(PY) -m uvicorn app.main:app --reload --port 8000 --app-dir src/backend

frontend: ## Correr el frontend (requiere npm)
	@if [ ! -f src/frontend/package.json ]; then \
		echo "Todavía no existe src/frontend/package.json"; \
		echo "Cuando Samuel cree el frontend, este target va a funcionar."; \
		exit 1; \
	fi
	cd src/frontend && npm install && npm run dev

test: ## Correr tests
	$(PY) -m pytest -q

lint: ## Correr ruff
	$(PY) -m ruff check .

format: ## Formatear con ruff
	$(PY) -m ruff format .

guides: ## Compilar las guías Typst a PDF y PNG
	mkdir -p guides/dist
	$(TYPST) compile guides/01-rubrica.typ guides/dist/01-rubrica.pdf
	$(TYPST) compile guides/02-benchmark.typ guides/dist/02-benchmark.pdf
	$(TYPST) compile guides/03-plan-48h.typ guides/dist/03-plan-48h.pdf
	$(TYPST) compile guides/04-pitch.typ guides/dist/04-pitch.pdf
	$(TYPST) compile --format png --ppi 200 guides/01-rubrica.typ "guides/dist/01-rubrica-{p}.png"
	$(TYPST) compile --format png --ppi 200 guides/02-benchmark.typ "guides/dist/02-benchmark-{p}.png"
	$(TYPST) compile --format png --ppi 200 guides/03-plan-48h.typ "guides/dist/03-plan-48h-{p}.png"
	$(TYPST) compile --format png --ppi 200 guides/04-pitch.typ "guides/dist/04-pitch-{p}.png"
	@echo "Guías en guides/dist/"

precompute: ## Precomputar WISE 0855 y Barnard's Star (requiere red)
	$(PY) scripts/poc_spherex.py --csv data/samples/wise0855_sia2.csv --name "WISE 0855" --ra 133.795129 --dec -7.245147 --n 12 --size 0.1 --workers 6
	$(PY) scripts/align_diff.py --slug wise-0855 --limit 12
	$(PY) scripts/poc_spherex.py --csv data/samples/barnards_sia2.csv --name "Barnards Star" --ra 269.452075 --dec 4.693392 --n 12 --size 0.1 --workers 6
	$(PY) scripts/align_diff.py --slug barnards-star --limit 12

check: lint test ## Lint + tests (lo mismo que corre CI)

clean: ## Limpiar cachés de herramientas (no borra datos)
	rm -rf .pytest_cache .ruff_cache
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
	rm -rf guides/dist
