import pytest
from httpx import AsyncClient


class TestCreateSession:
    async def test_success(self, client: AsyncClient, auth_headers):
        resp = await client.post("/api/v1/sessions", json={
            "mode": "impromptu",
            "prompt_text": "Test prompt",
            "prep_seconds": 30,
            "speak_seconds": 120,
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["mode"] == "impromptu"
        assert data["status"] == "pending"

    async def test_requires_auth(self, client: AsyncClient):
        resp = await client.post("/api/v1/sessions", json={"mode": "impromptu"})
        assert resp.status_code == 401

    async def test_invalid_mode(self, client: AsyncClient, auth_headers):
        resp = await client.post("/api/v1/sessions", json={"mode": "invalid"}, headers=auth_headers)
        assert resp.status_code == 422


class TestListSessions:
    async def test_empty(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/v1/sessions", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["sessions"] == []

    async def test_with_sessions(self, client: AsyncClient, auth_headers, test_session):
        resp = await client.get("/api/v1/sessions", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sessions"][0]["id"] == str(test_session.id)


class TestGetSession:
    async def test_success(self, client: AsyncClient, auth_headers, test_session):
        resp = await client.get(f"/api/v1/sessions/{test_session.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == str(test_session.id)

    async def test_not_found(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/v1/sessions/00000000-0000-0000-0000-000000000000", headers=auth_headers)
        assert resp.status_code == 404

    async def test_other_user(self, client: AsyncClient, test_user2, test_session):
        from app.core.security import create_token
        token = create_token(str(test_user2.id), "access")
        resp = await client.get(f"/api/v1/sessions/{test_session.id}", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 404


class TestUpdateSession:
    async def test_update_status(self, client: AsyncClient, auth_headers, test_session):
        resp = await client.patch(f"/api/v1/sessions/{test_session.id}", json={
            "status": "recording",
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "recording"

    async def test_not_found(self, client: AsyncClient, auth_headers):
        resp = await client.patch("/api/v1/sessions/00000000-0000-0000-0000-000000000000", json={
            "status": "recording",
        }, headers=auth_headers)
        assert resp.status_code == 404
