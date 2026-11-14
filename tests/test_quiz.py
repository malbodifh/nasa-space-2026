"""Contrato de datos del banco de preguntas."""

from __future__ import annotations

from app.quiz import (
    CATEGORY_LABELS,
    RESOURCES,
    check_answer,
    load_questions,
    pick_quiz,
    rank_for,
    validate_bank,
)


def test_bank_has_no_contract_errors() -> None:
    questions = load_questions()
    errors = validate_bank(questions)
    assert errors == [], "\n".join(errors)


def test_bank_covers_every_category() -> None:
    questions = load_questions()
    categories = {q["category"] for q in questions}
    assert categories == set(CATEGORY_LABELS)


def test_every_question_has_a_nasa_source() -> None:
    for question in load_questions():
        url = question["source"]["url"]
        assert url.startswith("https://"), question["id"]
        assert "nasa.gov" in url, question["id"]


def test_every_question_maps_to_a_resource() -> None:
    for question in load_questions():
        assert question["resource"] in RESOURCES, question["id"]


def test_ids_are_unique() -> None:
    ids = [q["id"] for q in load_questions()]
    assert len(ids) == len(set(ids))


def test_explanations_are_short() -> None:
    for question in load_questions():
        assert len(question["explanation"]) <= 240, question["id"]
        assert len(question["consequence"]) <= 160, question["id"]


def test_check_answer_marks_correct_choice() -> None:
    question = load_questions()[0]
    result = check_answer(question, question["answer"])
    assert result["correct"] is True
    assert result["answer"] == question["answer"]


def test_check_answer_marks_wrong_choice() -> None:
    question = load_questions()[0]
    wrong = (question["answer"] + 1) % 4
    result = check_answer(question, wrong)
    assert result["correct"] is False


def test_pick_quiz_respects_size_and_category() -> None:
    questions = load_questions()
    picked = pick_quiz(questions, n=4, category="salud")
    assert len(picked) == 4
    assert all(q["category"] == "salud" for q in picked)


def test_rank_is_relative_to_mission_length() -> None:
    # La misma proporción da el mismo rango en partidas de 10 o de 32.
    assert rank_for(0, 10)["name"] == "Cadete"
    assert rank_for(3, 10)["name"] == "Especialista"
    assert rank_for(5, 10)["name"] == "Oficial de misión"
    assert rank_for(8, 10)["name"] == "Comandante"
    assert rank_for(24, 32)["name"] == "Comandante"


def test_every_question_has_scenario_and_hook() -> None:
    for question in load_questions():
        assert question["scenario"].strip(), question["id"]
        assert question["hook"].strip(), question["id"]


def test_training_category_exists() -> None:
    questions = load_questions()
    assert sum(q["category"] == "entrenamiento" for q in questions) >= 6
