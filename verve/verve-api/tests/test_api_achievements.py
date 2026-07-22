import pytest
from httpx import AsyncClient


class TestListAchievements:
    async def test_empty(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/v1/achievements", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_with_achievements(self, client: AsyncClient, auth_headers, test_achievement):
        resp = await client.get("/api/v1/achievements", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "First Session"
        assert data[0]["unlocked"] is True

    async def test_requires_auth(self, client: AsyncClient):
        resp = await client.get("/api/v1/achievements")
        assert resp.status_code == 401
