SHELL := /bin/bash
VENV := .venv
PY := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
TYPST := typst

.DEFAULT_GOAL := help

.PHONY: help setup backend frontend test lint format guides clean check branches sync push-branches

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

frontend: ## El juego es estático y lo sirve el backend (no hay npm)
	@echo "El frontend vive en src/backend/static/ y se sirve con:"
	@echo "  make backend  →  http://localhost:8000"

test: ## Correr tests
	$(PY) -m pytest -q

lint: ## Correr ruff
	$(PY) -m ruff check .

format: ## Formatear con ruff
	$(PY) -m ruff format .

guides: ## Compilar las guías Typst a PDF y PNG
	mkdir -p guides/dist
	$(TYPST) compile guides/src/01-rubrica.typ guides/dist/01-rubrica.pdf
	$(TYPST) compile guides/src/03-plan-48h.typ guides/dist/03-plan-48h.pdf
	$(TYPST) compile guides/src/05-ideas.typ guides/dist/05-ideas.pdf
	$(TYPST) compile guides/src/06-retos.typ guides/dist/06-retos.pdf
	$(TYPST) compile --format png --ppi 200 guides/src/01-rubrica.typ "guides/dist/01-rubrica-{p}.png"
	$(TYPST) compile --format png --ppi 200 guides/src/03-plan-48h.typ "guides/dist/03-plan-48h-{p}.png"
	$(TYPST) compile --format png --ppi 200 guides/src/05-ideas.typ "guides/dist/05-ideas-{p}.png"
	$(TYPST) compile --format png --ppi 200 guides/src/06-retos.typ "guides/dist/06-retos-{p}.png"
	@echo "Guías en guides/dist/"

check: lint test ## Lint + tests (lo mismo que corre CI)

branches: ## Crear las ramas del equipo si faltan (main, develop, staging, persona)
	@bash scripts/setup_branches.sh

sync: ## Actualizar main/develop/staging desde origin (sin tocar tu rama)
	git fetch origin --prune
	@for b in main develop staging; do \
	  if git show-ref --verify --quiet refs/remotes/origin/$$b; then \
	    if [ "$$(git rev-parse --abbrev-ref HEAD)" = "$$b" ]; then \
	      echo "saltando $$b (es tu rama activa)"; \
	    else \
	      git branch -f $$b refs/remotes/origin/$$b && echo "actualizada: $$b"; \
	    fi; \
	  else \
	    echo "sin origin/$$b (falta push)"; \
	  fi; \
	done

push-branches: ## Subir todas las ramas del equipo a origin (primera vez)
	git push -u origin main develop staging
	git push -u origin andy david samuel jorge leo
	@echo "Ramas publicadas. Configurá 'develop' como default en GitHub."

clean: ## Limpiar cachés de herramientas (no borra datos)
	rm -rf .pytest_cache .ruff_cache
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
	rm -rf guides/dist
