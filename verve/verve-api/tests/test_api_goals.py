import pytest
from httpx import AsyncClient


class TestCreateGoal:
    async def test_success(self, client: AsyncClient, auth_headers):
        resp = await client.post("/api/v1/goals", json={
            "description": "Practice 10 times",
            "target_sessions": 10,
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["description"] == "Practice 10 times"
        assert data["target_sessions"] == 10
        assert data["current_progress"] == 0
        assert data["achieved"] is False

    async def test_default_target(self, client: AsyncClient, auth_headers):
        resp = await client.post("/api/v1/goals", json={
            "description": "Just practice",
        }, headers=auth_headers)
        assert resp.status_code == 201
        assert resp.json()["target_sessions"] == 5

    async def test_requires_auth(self, client: AsyncClient):
        resp = await client.post("/api/v1/goals", json={"description": "test"})
        assert resp.status_code == 401


class TestListGoals:
    async def test_empty(self, client: AsyncClient, auth_headers):
        resp = await client.get("/api/v1/goals", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_with_goals(self, client: AsyncClient, auth_headers, test_goal):
        resp = await client.get("/api/v1/goals", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == str(test_goal.id)


class TestUpdateGoal:
    async def test_update_progress(self, client: AsyncClient, auth_headers, test_goal):
        resp = await client.put(f"/api/v1/goals/{test_goal.id}", json={
            "current_progress": 3,
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["current_progress"] == 3

    async def test_mark_achieved(self, client: AsyncClient, auth_headers, test_goal):
        resp = await client.put(f"/api/v1/goals/{test_goal.id}", json={
            "achieved": True,
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["achieved"] is True

    async def test_not_found(self, client: AsyncClient, auth_headers):
        resp = await client.put("/api/v1/goals/00000000-0000-0000-0000-000000000000", json={
            "description": "updated",
        }, headers=auth_headers)
        assert resp.status_code == 404


class TestDeleteGoal:
    async def test_success(self, client: AsyncClient, auth_headers, test_goal):
        resp = await client.delete(f"/api/v1/goals/{test_goal.id}", headers=auth_headers)
        assert resp.status_code == 204

    async def test_not_found(self, client: AsyncClient, auth_headers):
        resp = await client.delete("/api/v1/goals/00000000-0000-0000-0000-000000000000", headers=auth_headers)
        assert resp.status_code == 404
