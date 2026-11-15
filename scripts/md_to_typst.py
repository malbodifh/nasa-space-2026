#!/usr/bin/env python3
"""Convierte los .md del proyecto a .typ para el libro de documentación.

El resultado va a `guides/src/docs/*.typ`; el maestro se genera en
`guides/src/07-documentacion.typ`. Los PDF se compilan aparte (`make docs`).

Requiere `pandoc` (>= 3.x). El repo no lo instala: se pasa con `--pandoc`
o se usa el que esté en PATH.
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "guides" / "src" / "docs"
MASTER = ROOT / "guides" / "src" / "07-documentacion.typ"

# (número, título, descripción, [(ruta_md, slug, título_para_metadata)])
PARTS: list[tuple[str, str, str, list[tuple[str, str, str]]]] = [
    (
        "I",
        "Inicio",
        "Contexto, reglas y estado del proyecto.",
        [
            ("README.md", "readme", "README"),
            ("CONTRIBUTING.md", "contributing", "Contribuir"),
            ("AGENTS.md", "agents", "AGENTS.md"),
            ("documentacion.md", "documentacion", "Documentación"),
        ],
    ),
    (
        "II",
        "Equipo y retos",
        "Cómo se organiza el equipo y qué retos existen.",
        [
            ("docs/00-equipo-y-reglas.md", "00-equipo-y-reglas", "00 — Equipo y reglas"),
            ("docs/02-challenges-2026.md", "02-challenges-2026", "02 — Los 14 retos"),
        ],
    ),
    (
        "III",
        "Producto y arquitectura",
        "Qué se construye y cómo se estructura.",
        [
            (
                "docs/22-investigacion-desastres.md",
                "22-investigacion-desastres",
                "22 — Investigación de desastres",
            ),
            ("docs/23-plan-app.md", "23-plan-app", "23 — Plan de la app"),
            ("docs/24-arquitectura-app.md", "24-arquitectura-app", "24 — Arquitectura"),
        ],
    ),
    (
        "IV",
        "Datos y APIs",
        "Qué datos existen, qué se probó y qué se puede construir.",
        [
            ("docs/25-api-research.md", "25-api-research", "25 — APIs verificadas"),
            ("docs/26-spike-datos.md", "26-spike-datos", "26 — Spike de datos"),
            ("docs/27-benchmark-apps.md", "27-benchmark-apps", "27 — Benchmark de apps"),
            (
                "docs/apis_research_samuel.md",
                "apis-research-samuel",
                "APIs research — Samuel",
            ),
        ],
    ),
    (
        "V",
        "Operación",
        "Cómo se trabaja y qué se registró.",
        [
            ("docs/18-workflow.md", "18-workflow", "18 — Workflow"),
            ("docs/19-herramientas.md", "19-herramientas", "19 — Herramientas"),
            (
                "docs/bitacora/2026-11-14.md",
                "bitacora-2026-11-14",
                "Bitácora 2026-11-14",
            ),
        ],
    ),
    (
        "VI",
        "Anexos",
        "README de carpetas, plantillas y reglas de la app.",
        [
            ("guides/README.md", "anexo-guides", "Anexo — Guides"),
            ("research/README.md", "anexo-research", "Anexo — Research"),
            ("assets/README.md", "anexo-assets", "Anexo — Assets"),
            ("scripts/README.md", "anexo-scripts", "Anexo — Scripts"),
            (
                ".github/pull_request_template.md",
                "anexo-pr-template",
                "Anexo — Plantilla de PR",
            ),
            ("web/README.md", "anexo-web", "Anexo — Web"),
            ("web/AGENTS.md", "anexo-nextjs-agents", "Anexo — Reglas de Next.js"),
        ],
    ),
    (
        "VII",
        "Archivo",
        "Idea SPHEREx descartada; no se borra.",
        [
            (
                "backups/ideas/spherex/README.md",
                "archivo-spherex-readme",
                "Archivo — SPHEREx",
            ),
            (
                "backups/ideas/spherex/docs/03-spherex-tecnico.md",
                "archivo-spherex-03-tecnico",
                "Archivo — SPHEREx técnico",
            ),
            (
                "backups/ideas/spherex/docs/04-apis.md",
                "archivo-spherex-04-apis",
                "Archivo — SPHEREx APIs",
            ),
            (
                "backups/ideas/spherex/docs/05-arquitectura.md",
                "archivo-spherex-05-arquitectura",
                "Archivo — SPHEREx arquitectura",
            ),
            (
                "backups/ideas/spherex/docs/07-pitch-30s.md",
                "archivo-spherex-07-pitch",
                "Archivo — SPHEREx pitch",
            ),
            (
                "backups/ideas/spherex/docs/08-problemas-astrofisica.md",
                "archivo-spherex-08-problemas",
                "Archivo — SPHEREx problemas",
            ),
            (
                "backups/ideas/spherex/docs/15-validacion-datos.md",
                "archivo-spherex-15-validacion",
                "Archivo — SPHEREx validación",
            ),
        ],
    ),
]

TABLE_STYLE = (
    "    stroke: 0.4pt + lineColor,\n"
    "    inset: 3.0pt,\n"
    "    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },\n"
)

EMOJI = {
    "⚠️": '#text(fill: orange, weight: "bold")[!]',
    "⚠": '#text(fill: orange, weight: "bold")[!]',
    "✅": '#text(fill: green, weight: "bold")[✓]',
    "❌": '#text(fill: red, weight: "bold")[×]',
    "🟡": '#text(fill: orange, weight: "bold")[●]',
    "🔴": '#text(fill: red, weight: "bold")[●]',
    "⚪": '#text(fill: muted, weight: "bold")[○]',
    "🔍": "BUSCAR",
    "📍": "GPS",
}


def wrap_wide_tables(text: str) -> str:
    """Pone las tablas de 7+ columnas en una página horizontal."""
    lines = text.splitlines()
    out: list[str] = []
    i = 0
    while i < len(lines):
        if lines[i].strip() == "#figure(":
            j = i
            n = None
            while j < len(lines):
                m = re.search(r"columns:\s*(\d+),", lines[j])
                if m:
                    n = int(m.group(1))
                if "kind: table" in lines[j]:
                    break
                j += 1
            if n is not None and n >= 7 and j < len(lines):
                k = j + 1
                while k < len(lines) and lines[k].strip() != ")":
                    k += 1
                if k < len(lines):
                    out.append("#page(flipped: true, header: none, footer: none)[")
                    for line in lines[i : k + 1]:
                        out.append("  " + line)
                    out.append("]")
                    i = k + 1
                    continue
        out.append(lines[i])
        i += 1
    return "\n".join(out)


def postprocess(text: str, slug: str) -> str:
    """Ajusta la salida de pandoc al tema del libro."""
    # Pandoc agrega labels de heading (<slug>); no los necesitamos.
    text = re.sub(r"(?m)^<[^>]+>\s*$\n?", "", text)

    # Separadores.
    text = text.replace(
        "#divider()", "#line(length: 100%, stroke: 0.6pt + lineColor)"
    )

    # Tablas: estilo común (encabezado navy, filas alternadas).
    text = re.sub(
        r"(#table\(\n\s*columns: [^\n]+,\n)",
        lambda m: m.group(1) + TABLE_STYLE,
        text,
    )

    # Tablas anchas: anchos por columna en vez de partes iguales.
    patterns = {
        6: "(1.0fr, 1.8fr, 1.6fr, 1.8fr, 1.8fr, 1.8fr)",
        7: "(1.0fr, 0.7fr, 2.0fr, 2.4fr, 0.9fr, 0.5fr, 1.4fr)",
        9: "(0.5fr, 1.8fr, 2.2fr, 2.2fr, 0.5fr, 0.5fr, 0.5fr, 0.5fr, 0.6fr)",
    }
    text = re.sub(
        r"columns: (\d+),",
        lambda m: f"columns: {patterns.get(int(m.group(1)), m.group(1))},",
        text,
    )

    # Links relativos: en PDF no resuelven; dejamos el texto.
    def link_repl(match: re.Match[str]) -> str:
        url = match.group(1)
        label = match.group(2)
        if url.startswith(("http://", "https://", "mailto:")):
            return match.group(0)
        return label or url

    text = re.sub(r'#link\("([^"]+)"\)\[([^\]]*)\]', link_repl, text)

    # Emojis: Typst no garantiza glifos de color.
    for emoji, replacement in EMOJI.items():
        text = text.replace(emoji, replacement)

    # web/AGENTS.md empieza en nivel 2; le damos un H1 propio.
    if slug == "anexo-nextjs-agents" and not re.search(r"(?m)^= ", text):
        text = "= Anexo — Reglas de Next.js\n\n" + text

    return wrap_wide_tables(text)


def convert(pandoc: str, src: Path, dst: Path, slug: str) -> None:
    tmp = dst.with_suffix(".raw.typ")
    subprocess.run(
        [pandoc, "-f", "gfm", "-t", "typst", str(src), "-o", str(tmp)],
        check=True,
        capture_output=True,
        text=True,
    )
    text = tmp.read_text(encoding="utf-8")
    tmp.unlink(missing_ok=True)
    body = postprocess(text, slug)
    rel = src.relative_to(ROOT).as_posix()
    dst.write_text(
        f"// Generado desde {rel} con pandoc. No editar a mano.\n\n"
        f'#import "theme.typ": *\n\n{body}',
        encoding="utf-8",
    )


def build_master() -> None:
    lines = [
        "// Generado por scripts/md_to_typst.py. No editar a mano.",
        '#import "docs/theme.typ": *',
        "#show: docs",
        '#set document(title: "Documentación — Astral Codes", author: "Astral Codes")',
        "",
        "#cover()",
        "",
        '#outline(title: "Contenido", indent: auto, depth: 1)',
        "",
    ]
    for num, title, desc, docs in PARTS:
        lines.append(f'#part("{num}", "{title}", "{desc}")')
        lines.append("")
        for _, slug, _ in docs:
            lines.append(f'#include "docs/{slug}.typ"')
            lines.append("")
    lines.append("#colophon()")
    lines.append("")
    MASTER.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--pandoc",
        default=shutil.which("pandoc") or "pandoc",
        help="Ruta al binario de pandoc (default: pandoc en PATH).",
    )
    args = parser.parse_args()

    if not Path(args.pandoc).exists() and not shutil.which(args.pandoc):
        raise SystemExit(
            "No encontré pandoc. Instalalo o pasá --pandoc /ruta/a/pandoc."
        )

    SRC.mkdir(parents=True, exist_ok=True)
    for _, _, _, docs in PARTS:
        for rel, slug, _ in docs:
            src = ROOT / rel
            if not src.is_file():
                raise SystemExit(f"Falta {rel}")
            convert(args.pandoc, src, SRC / f"{slug}.typ", slug)

    build_master()
    total = sum(len(docs) for _, _, _, docs in PARTS)
    print(f"Listo: {total} documentos en {SRC.relative_to(ROOT)}")
    print(f"Maestro: {MASTER.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
