from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "Astral Codes" in response.json()["name"]


def test_targets_returns_list() -> None:
    response = client.get("/api/targets")
    assert response.status_code == 200
    assert isinstance(response.json()["targets"], list)
