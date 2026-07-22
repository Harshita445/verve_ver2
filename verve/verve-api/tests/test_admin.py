"""Tests for admin API endpoints."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.core.security import create_token
from app.models.user import User


@pytest.fixture()
def admin_user(db: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        password_hash="x",
        display_name="Admin",
        avatar_initials="AD",
        current_rating=1200,
        is_admin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def admin_token(admin_user: User) -> str:
    return create_token(str(admin_user.id), "access")


@pytest.fixture()
def admin_headers(admin_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture()
def non_admin_user(db: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="user@example.com",
        password_hash="x",
        display_name="User",
        avatar_initials="US",
        current_rating=1200,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


class TestAdminAuth:
    async def test_non_admin_forbidden(self, client: AsyncClient, non_admin_user: User) -> None:
        token = create_token(str(non_admin_user.id), "access")
        resp = await client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403

    async def test_unauthenticated(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/admin/users")
        assert resp.status_code == 401


class TestListUsers:
    async def test_list_all(self, client: AsyncClient, admin_headers: dict[str, str], non_admin_user: User) -> None:
        resp = await client.get("/api/v1/admin/users", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    async def test_pagination(self, client: AsyncClient, admin_headers: dict[str, str]) -> None:
        resp = await client.get("/api/v1/admin/users?skip=0&limit=5", headers=admin_headers)
        assert resp.status_code == 200

    async def test_negative_skip(self, client: AsyncClient, admin_headers: dict[str, str]) -> None:
        resp = await client.get("/api/v1/admin/users?skip=-1", headers=admin_headers)
        assert resp.status_code == 422

    async def test_overflow_limit(self, client: AsyncClient, admin_headers: dict[str, str]) -> None:
        resp = await client.get("/api/v1/admin/users?limit=999", headers=admin_headers)
        assert resp.status_code == 422


class TestGetUser:
    async def test_get_by_id(self, client: AsyncClient, admin_headers: dict[str, str], non_admin_user: User) -> None:
        resp = await client.get(f"/api/v1/admin/users/{non_admin_user.id}", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["email"] == "user@example.com"

    async def test_not_found(self, client: AsyncClient, admin_headers: dict[str, str]) -> None:
        resp = await client.get(f"/api/v1/admin/users/{uuid.uuid4()}", headers=admin_headers)
        assert resp.status_code == 404


class TestUpdateUser:
    async def test_update_plan(self, client: AsyncClient, admin_headers: dict[str, str], non_admin_user: User) -> None:
        resp = await client.patch(
            f"/api/v1/admin/users/{non_admin_user.id}",
            json={"plan": "pro"},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["plan"] == "pro"

    async def test_make_admin(self, client: AsyncClient, admin_headers: dict[str, str], non_admin_user: User) -> None:
        resp = await client.patch(
            f"/api/v1/admin/users/{non_admin_user.id}",
            json={"is_admin": True},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["is_admin"] is True

    async def test_update_not_found(self, client: AsyncClient, admin_headers: dict[str, str]) -> None:
        resp = await client.patch(
            f"/api/v1/admin/users/{uuid.uuid4()}",
            json={"plan": "pro"},
            headers=admin_headers,
        )
        assert resp.status_code == 404


class TestDeleteUser:
    async def test_delete_user(self, client: AsyncClient, admin_headers: dict[str, str], non_admin_user: User, db: Session) -> None:
        uid = non_admin_user.id
        resp = await client.delete(f"/api/v1/admin/users/{uid}", headers=admin_headers)
        assert resp.status_code == 204
        db.expire_all()
        assert db.get(User, uid) is None

    async def test_delete_not_found(self, client: AsyncClient, admin_headers: dict[str, str]) -> None:
        resp = await client.delete(f"/api/v1/admin/users/{uuid.uuid4()}", headers=admin_headers)
        assert resp.status_code == 404


class TestStats:
    async def test_stats(self, client: AsyncClient, admin_headers: dict[str, str]) -> None:
        resp = await client.get("/api/v1/admin/stats", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_users" in data
        assert "total_sessions" in data
        assert "total_feedback_reports" in data
        assert "active_users_last_7d" in data
        assert "pro_users" in data
        assert "free_users" in data
        assert isinstance(data["total_users"], int)
