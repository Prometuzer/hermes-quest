from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from gateway import server


client = TestClient(server.app)


def setup_function():
    server.SESSIONS.clear()


def test_health(monkeypatch):
    monkeypatch.setattr(server, "is_hermes_available", lambda: True)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["hermes_available"] is True


def test_link_then_chat(monkeypatch):
    monkeypatch.setattr(server, "is_hermes_available", lambda: True)
    monkeypatch.setattr(server, "call_hermes", AsyncMock(return_value="La forêt écoute."))
    session = client.post("/link").json()["session"]

    response = client.post(
        "/chat",
        json={
            "session": session,
            "message": "Où aller ?",
            "context": {"health": 5, "enemies_defeated": 3, "lore_fragments": 1},
        },
    )

    assert response.status_code == 200
    assert response.json()["reply"] == "La forêt écoute."


def test_unknown_session_is_rejected(monkeypatch):
    monkeypatch.setattr(server, "is_hermes_available", lambda: True)
    response = client.post(
        "/chat",
        json={"session": "game-unknown", "message": "Bonjour", "context": {}},
    )
    assert response.status_code == 404


def test_rate_limit(monkeypatch):
    monkeypatch.setattr(server, "is_hermes_available", lambda: True)
    monkeypatch.setattr(server, "call_hermes", AsyncMock(return_value="Réponse"))
    session = client.post("/link").json()["session"]
    payload = {"session": session, "message": "Test", "context": {}}

    assert client.post("/chat", json=payload).status_code == 200
    assert client.post("/chat", json=payload).status_code == 429


def test_unavailable_upstream(monkeypatch):
    monkeypatch.setattr(server, "is_hermes_available", lambda: False)
    session = client.post("/link").json()["session"]
    response = client.post(
        "/chat",
        json={"session": session, "message": "Tu es là ?", "context": {}},
    )
    assert response.status_code == 503
