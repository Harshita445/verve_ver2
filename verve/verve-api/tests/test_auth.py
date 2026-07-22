"""Auth endpoint integration tests — signup, login, refresh rotation, password reset."""

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.core.security import hash_reset_token
from app.models.password_reset_token import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.services.auth_service import create_password_reset_token
from app.services.email_service import send_password_reset_email

class TestSignup:
    async def test_success(self, client: AsyncClient, db: Session) -> None:
        payload = {"email": "new@example.com", "password": "Str0ng!Pass", "display_name": "New User"}
        resp = await client.post("/api/v1/auth/signup", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["access_token"]
        assert data["user"]["email"] == "new@example.com"

    async def test_duplicate_email(self, client: AsyncClient, test_user: User) -> None:
        payload = {"email": test_user.email, "password": "Str0ng!Pass", "display_name": "Duplicate"}
        resp = await client.post("/api/v1/auth/signup", json=payload)
        assert resp.status_code == 409
        assert "already exists" in resp.json()["detail"]


class TestLogin:
    async def test_success(self, client: AsyncClient, test_user: User, test_password: str) -> None:
        resp = await client.post("/api/v1/auth/login", json={"email": test_user.email, "password": test_password})
        assert resp.status_code == 200
        assert resp.json()["access_token"]

    async def test_bad_password(self, client: AsyncClient, test_user: User) -> None:
        resp = await client.post("/api/v1/auth/login", json={"email": test_user.email, "password": "wrong"})
        assert resp.status_code == 401

    async def test_nonexistent(self, client: AsyncClient) -> None:
        resp = await client.post("/api/v1/auth/login", json={"email": "nobody@example.com", "password": "x"})
        assert resp.status_code == 401


class TestRefreshRotation:
    async def test_rotate_once(self, client: AsyncClient, test_user: User, refresh_token_str: str) -> None:
        client.cookies.set("refresh_token", refresh_token_str)
        resp = await client.post("/api/v1/auth/refresh")
        assert resp.status_code == 200
        # Second cookie (after rotate) should be different
        new_cookie = resp.cookies.get("refresh_token")
        assert new_cookie is not None
        assert new_cookie != refresh_token_str

    async def test_reuse_rejected(self, client: AsyncClient, test_user: User, refresh_token_str: str, db: Session) -> None:
        client.cookies.set("refresh_token", refresh_token_str)
        # First use succeeds
        resp1 = await client.post("/api/v1/auth/refresh")
        assert resp1.status_code == 200
        # Second use of the same token triggers reuse detection -> all sessions revoked
        client.cookies.set("refresh_token", refresh_token_str)
        resp2 = await client.post("/api/v1/auth/refresh")
        assert resp2.status_code == 401
        assert "reuse" in resp2.json()["detail"].lower()


class TestPasswordReset:
    async def test_issue_and_consume(self, client: AsyncClient, test_user: User, db: Session) -> None:
        raw = create_password_reset_token(db, test_user.email)
        assert raw is not None
        new_password = "NewPass789!"
        resp = await client.post("/api/v1/auth/reset-password", json={"token": raw, "new_password": new_password})
        assert resp.status_code == 200
        # Verify the new password works
        login_resp = await client.post("/api/v1/auth/login", json={"email": test_user.email, "password": new_password})
        assert login_resp.status_code == 200

    async def test_consume_twice_fails(self, client: AsyncClient, test_user: User, db: Session) -> None:
        raw = create_password_reset_token(db, test_user.email)
        assert raw is not None
        await client.post("/api/v1/auth/reset-password", json={"token": raw, "new_password": "NewPass789!"})
        resp2 = await client.post("/api/v1/auth/reset-password", json={"token": raw, "new_password": "AnotherPass1!"})
        assert resp2.status_code == 400
