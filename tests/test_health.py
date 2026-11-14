from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["questions"] >= 32


def test_root_serves_game() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "Mission Trainer" in response.text


def test_categories() -> None:
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.json()["categories"]
    assert {c["id"] for c in categories} == {
        "atmosfera",
        "soporte-vital",
        "energia",
        "salud",
        "fuego",
        "comms",
        "entrenamiento",
    }
    assert all(c["count"] >= 4 for c in categories)


def test_quiz_never_leaks_answers() -> None:
    response = client.get("/api/quiz?n=5")
    assert response.status_code == 200
    questions = response.json()["questions"]
    assert len(questions) == 5
    for question in questions:
        assert "answer" not in question
        assert "explanation" not in question
        assert len(question["options"]) == 4


def test_quiz_filters_by_category() -> None:
    response = client.get("/api/quiz?n=4&category=salud")
    assert response.status_code == 200
    assert all(q["category"] == "salud" for q in response.json()["questions"])


def test_quiz_unknown_category() -> None:
    assert client.get("/api/quiz?category=no-existe").status_code == 404


def test_answer_returns_feedback() -> None:
    question = client.get("/api/quiz?n=1").json()["questions"][0]
    response = client.post("/api/answer", json={"id": question["id"], "choice": 0})
    assert response.status_code == 200
    body = response.json()
    assert {"correct", "answer", "explanation", "consequence", "source"} <= body.keys()
    assert body["source"]["url"].startswith("https://")


def test_answer_unknown_question() -> None:
    assert client.post("/api/answer", json={"id": "nope", "choice": 1}).status_code == 404


def test_answer_rejects_invalid_choice() -> None:
    question = client.get("/api/quiz?n=1").json()["questions"][0]
    assert client.post("/api/answer", json={"id": question["id"], "choice": 9}).status_code == 422


def test_support_brief_for_every_category() -> None:
    response = client.get("/api/support")
    assert response.status_code == 200
    briefs = response.json()["support"]
    assert len(briefs) == 7
    for brief in briefs:
        assert brief["headline"] and brief["concept"] and brief["tip"]
        assert brief["source"]["url"].startswith("https://")


def test_support_single_category() -> None:
    assert client.get("/api/support/salud").status_code == 200
    assert client.get("/api/support/no-existe").status_code == 404


def test_hint_discards_two_wrong_options() -> None:
    question = client.get("/api/quiz?n=1").json()["questions"][0]
    full = next(q for q in client.get("/api/questions").json()["questions"] if q["id"] == question["id"])
    response = client.post("/api/hint", json={"id": question["id"]})
    assert response.status_code == 200
    discard = response.json()["discard"]
    assert len(discard) == 2
    assert full["answer"] not in discard
