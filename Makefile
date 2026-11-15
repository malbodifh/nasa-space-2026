SHELL := /bin/bash
VENV := .venv
PY := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
TYPST := typst
PANDOC ?= pandoc

.DEFAULT_GOAL := help

.PHONY: help setup test lint format check guides docs docs-convert clean branches sync

help: ## Mostrar esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

setup: ## Crear .venv e instalar herramientas de desarrollo
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements-dev.txt
	@echo ""
	@echo "Listo. Activá el entorno con: source $(VENV)/bin/activate"
	@echo "Luego: make check / make guides"

test: ## Correr tests
	$(PY) -m pytest -q

lint: ## Correr ruff
	$(PY) -m ruff check .

format: ## Formatear con ruff
	$(PY) -m ruff format .

check: lint test ## Lint + tests (lo mismo que corre CI)

guides: ## Compilar las guías Typst a PDF y PNG
	mkdir -p guides/dist
	$(TYPST) compile guides/src/06-retos.typ guides/dist/06-retos.pdf
	$(TYPST) compile --format png --ppi 200 guides/src/06-retos.typ "guides/dist/06-retos-{p}.png"
	@echo "Guías en guides/dist/"

branches: ## Crear las ramas del equipo si faltan (main, develop, persona)
	@bash scripts/setup_branches.sh

sync: ## Actualizar ramas base solo si avanzan sin perder commits locales
	git fetch origin --prune
	@set -e; for b in main develop; do \
	  if git show-ref --verify --quiet refs/remotes/origin/$$b; then \
	    if [ "$$(git rev-parse --abbrev-ref HEAD)" = "$$b" ]; then \
	      echo "saltando $$b (es tu rama activa)"; \
	    else \
	      if git show-ref --verify --quiet refs/heads/$$b; then \
	        git merge-base --is-ancestor refs/heads/$$b refs/remotes/origin/$$b || \
	          { echo "ERROR: $$b tiene commits locales; no se modifica."; exit 1; }; \
	        old=$$(git rev-parse refs/heads/$$b); \
	      else \
	        echo "ERROR: falta la rama local $$b; creala con autorización."; exit 1; \
	      fi; \
	      git update-ref refs/heads/$$b refs/remotes/origin/$$b $$old && echo "actualizada: $$b"; \
	    fi; \
	  else \
	    echo "sin origin/$$b (falta push)"; \
	  fi; \
	done

clean: ## Limpiar cachés y PNGs (NO borra los PDF versionados)
	rm -rf .pytest_cache .ruff_cache
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
	rm -f guides/dist/*.png
