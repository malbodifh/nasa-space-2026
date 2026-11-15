#!/usr/bin/env bash
# Compila un PDF por documento desde guides/src/docs/*.typ.
# Los wrappers viven en guides/build/docs/ (ignorado por git).
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p guides/build/docs guides/dist/docs

for src in guides/src/docs/*.typ; do
  slug="$(basename "$src" .typ)"
  [ "$slug" = "theme" ] && continue

  wrapper="guides/build/docs/$slug.typ"
  {
    echo '#import "../../src/docs/theme.typ": *'
    echo '#show: docs'
    echo "#set document(title: \"$slug\", author: \"Astral Codes\")"
    echo "#include \"../../src/docs/$slug.typ\""
  } > "$wrapper"

  typst compile --root . "$wrapper" "guides/dist/docs/$slug.pdf"
done

echo "PDFs individuales en guides/dist/docs/"
