"""Smoke tests del esqueleto: que la documentación y las guías no se rompan."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Enlaces locales en Markdown: [texto](ruta), sin http/anclas/correo.
LINK = re.compile(r"\]\((?![a-z]+:|#|mailto:)([^)#]+)(?:#[^)]*)?\)")


def test_archivos_base_existen() -> None:
    for name in ("README.md", "AGENTS.md", "documentacion.md", "Makefile"):
        assert (ROOT / name).is_file(), f"falta {name}"


def test_documentos_referenciados_existen() -> None:
    faltantes: list[str] = []
    paginas = ("documentacion.md", "README.md", "AGENTS.md", "CONTRIBUTING.md")
    for name in paginas:
        page = ROOT / name
        for target in LINK.findall(page.read_text(encoding="utf-8")):
            target = target.strip()
            if target and not (ROOT / target).exists():
                faltantes.append(f"{page.name} -> {target}")
    assert not faltantes, "enlaces rotos:\n" + "\n".join(faltantes)


def test_cada_guia_tiene_fuente_y_pdf() -> None:
    fuentes = {p.stem for p in (ROOT / "guides" / "src").glob("*.typ")} - {"theme"}
    pdfs = {p.stem for p in (ROOT / "guides" / "dist").glob("*.pdf")}
    assert fuentes, "no hay fuentes Typst en guides/src"
    assert fuentes == pdfs, f"sin PDF: {fuentes - pdfs} · sin fuente: {pdfs - fuentes}"
