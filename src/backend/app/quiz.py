"""Lógica del banco de preguntas y de la partida."""

from __future__ import annotations

import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
QUESTIONS_PATH = BASE_DIR / "data" / "questions.json"

RESOURCES = {"o2": "O₂", "energia": "Energía", "agua": "Agua", "moral": "Moral"}

CATEGORY_LABELS = {
    "atmosfera": "Atmósfera",
    "soporte-vital": "Soporte vital",
    "energia": "Energía",
    "salud": "Salud",
    "fuego": "Fuego",
    "comms": "Comunicaciones",
    "entrenamiento": "Entrenamiento",
}

RANKS = [
    (0.75, "Comandante", "Listo para Artemis."),
    (0.50, "Oficial de misión", "El puesto confía en vos."),
    (0.25, "Especialista", "Ya podés cuidar un sistema."),
    (0.0, "Cadete", "Todo astronauta empieza acá."),
]


def load_questions(path: Path | None = None) -> list[dict]:
    """Lee el banco completo desde data/questions.json."""
    source = path or QUESTIONS_PATH
    return json.loads(source.read_text(encoding="utf-8"))


def public_view(question: dict) -> dict:
    """Lo que puede ver el cliente: nunca la respuesta ni la explicación."""
    return {
        "id": question["id"],
        "category": question["category"],
        "category_label": CATEGORY_LABELS.get(question["category"], question["category"]),
        "difficulty": question["difficulty"],
        "prompt": question["prompt"],
        "options": question["options"],
    }


def categories(questions: list[dict]) -> list[dict]:
    counts: dict[str, int] = {}
    for question in questions:
        counts[question["category"]] = counts.get(question["category"], 0) + 1
    return [
        {"id": key, "label": CATEGORY_LABELS.get(key, key), "count": counts[key]}
        for key in sorted(counts)
    ]


def pick_quiz(
    questions: list[dict],
    n: int = 10,
    category: str | None = None,
    rng: random.Random | None = None,
) -> list[dict]:
    """Mezcla y recorta el banco, opcionalmente por categoría."""
    pool = [q for q in questions if category is None or q["category"] == category]
    (rng or random).shuffle(pool)
    return pool[: max(1, min(n, len(pool)))]


def check_answer(question: dict, choice: int) -> dict:
    """Valida una respuesta y devuelve el feedback completo."""
    correct = choice == question["answer"]
    return {
        "id": question["id"],
        "correct": correct,
        "answer": question["answer"],
        "explanation": question["explanation"],
        "consequence": question["consequence"],
        "scenario": question.get("scenario", ""),
        "hook": question.get("hook", ""),
        "resource": question["resource"],
        "source": question["source"],
    }


def rank_for(hits: int, total: int) -> dict:
    """Rango final según proporción de aciertos (sirve para cualquier largo de partida)."""
    ratio = hits / total if total else 0.0
    for threshold, name, message in RANKS:
        if ratio >= threshold:
            return {"name": name, "message": message, "ratio": round(ratio, 2)}
    return {"name": "Cadete", "message": "Todo astronauta empieza acá.", "ratio": 0.0}


def validate_bank(questions: list[dict]) -> list[str]:
    """Chequeos del contrato de datos. Devuelve la lista de errores."""
    errors: list[str] = []
    seen: set[str] = set()
    for q in questions:
        qid = q.get("id", "?")
        if qid in seen:
            errors.append(f"{qid}: id duplicado")
        seen.add(qid)
        if len(q.get("options", [])) != 4:
            errors.append(f"{qid}: debe tener 4 opciones")
        if not 0 <= q.get("answer", -1) < 4:
            errors.append(f"{qid}: answer fuera de rango")
        if q.get("category") not in CATEGORY_LABELS:
            errors.append(f"{qid}: categoría desconocida")
        if q.get("resource") not in RESOURCES:
            errors.append(f"{qid}: recurso desconocido")
        if len(q.get("prompt", "")) > 140:
            errors.append(f"{qid}: prompt > 140 caracteres")
        if len(q.get("explanation", "")) > 240:
            errors.append(f"{qid}: explanation > 240 caracteres")
        if len(q.get("scenario", "")) > 160:
            errors.append(f"{qid}: scenario > 160 caracteres")
        if len(q.get("hook", "")) > 90:
            errors.append(f"{qid}: hook > 90 caracteres")
        if not q.get("source", {}).get("url", "").startswith("https://"):
            errors.append(f"{qid}: source.url inválida")
    return errors
