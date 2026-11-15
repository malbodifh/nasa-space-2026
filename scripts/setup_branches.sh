#!/usr/bin/env bash
# Crea el modelo de ramas del equipo si falta alguna.
# Uso: ./scripts/setup_branches.sh [base]     (base por defecto: develop)
set -euo pipefail

BASE="${1:-develop}"
PERSONAS=(andy david samuel jorge leo)

git rev-parse --is-inside-work-tree >/dev/null

if ! git show-ref --verify --quiet refs/heads/main; then
  echo "ERROR: no existe la rama main. Inicializá el repo primero." >&2
  exit 1
fi

exists() { git show-ref --verify --quiet "refs/heads/$1"; }

if exists "$BASE"; then
  echo "existe: $BASE"
else
  git branch "$BASE" main
  echo "creada: $BASE"
fi

for p in "${PERSONAS[@]}"; do
  if exists "$p"; then
    echo "existe: $p"
  else
    git branch "$p" "$BASE"
    echo "creada: $p"
  fi
done

echo
echo "Modelo: persona -> $BASE -> main"
git branch --list
