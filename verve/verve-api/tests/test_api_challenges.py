import pytest
from httpx import AsyncClient


class TestDailyChallenge:
    async def test_success(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/v1/challenges/daily", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "mode" in data
        assert "prompt_text" in data
        assert data["difficulty"] == "intermediate"
        assert data["prep_seconds"] == 30
        assert data["speak_seconds"] == 120

    async def test_deterministic(self, client: AsyncClient, auth_headers):
        resp1 = await client.get("/api/v1/challenges/daily", headers=auth_headers)
        resp2 = await client.get("/api/v1/challenges/daily", headers=auth_headers)
        assert resp1.json() == resp2.json()

    async def test_requires_auth(self, client: AsyncClient):
        resp = await client.get("/api/v1/challenges/daily")
        assert resp.status_code == 401
