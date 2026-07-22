import pytest
from httpx import AsyncClient


class TestSignup:
    async def test_success(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/signup", json={
            "email": "new@example.com",
            "password": "Secret123!",
            "display_name": "New User",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "new@example.com"

    async def test_duplicate(self, client: AsyncClient, test_user):
        resp = await client.post("/api/v1/auth/signup", json={
            "email": test_user.email,
            "password": "Secret123!",
            "display_name": "Another",
        })
        assert resp.status_code == 409

    async def test_weak_password(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/signup", json={
            "email": "weak@example.com",
            "password": "short",
            "display_name": "Weak",
        })
        assert resp.status_code == 422


class TestLogin:
    async def test_success(self, client: AsyncClient, test_user, test_password):
        resp = await client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": test_password,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_user.email
        assert "refresh_token" in resp.cookies

    async def test_wrong_password(self, client: AsyncClient, test_user):
        resp = await client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": "wrong",
        })
        assert resp.status_code == 401

    async def test_nonexistent(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "nobody@example.com",
            "password": "any",
        })
        assert resp.status_code == 401


class TestRefresh:
    async def test_success(self, client: AsyncClient, test_user, refresh_token_str):
        client.cookies.set("refresh_token", refresh_token_str)
        resp = await client.post("/api/v1/auth/refresh")
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data

    async def test_no_cookie(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/refresh")
        assert resp.status_code == 401

    async def test_bogus_cookie(self, client: AsyncClient):
        client.cookies.set("refresh_token", "bogus")
        resp = await client.post("/api/v1/auth/refresh")
        assert resp.status_code == 401


class TestLogout:
    async def test_success(self, client: AsyncClient, test_user, refresh_token_str):
        client.cookies.set("refresh_token", refresh_token_str)
        resp = await client.post("/api/v1/auth/logout")
        assert resp.status_code == 204

    async def test_no_cookie(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/logout")
        assert resp.status_code == 204


class TestForgotPassword:
    async def test_success(self, client: AsyncClient, test_user):
        resp = await client.post("/api/v1/auth/forgot-password", json={
            "email": test_user.email,
        })
        assert resp.status_code == 200
        assert resp.json()["message"] == "If an account exists for that email, a reset link has been sent."

    async def test_unknown_email_still_ok(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/forgot-password", json={
            "email": "unknown@example.com",
        })
        assert resp.status_code == 200
        assert resp.json()["message"] == "If an account exists for that email, a reset link has been sent."


class TestResetPassword:
    async def test_success(self, client: AsyncClient, db, test_user):
        from app.services.auth_service import create_password_reset_token
        raw = create_password_reset_token(db, test_user.email)
        assert raw is not None
        resp = await client.post("/api/v1/auth/reset-password", json={
            "token": raw,
            "new_password": "NewPass789!",
        })
        assert resp.status_code == 200
        assert resp.json()["message"] == "Password has been reset. Please log in again."

    async def test_bogus_token(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/reset-password", json={
            "token": "bogus",
            "new_password": "NewPass789!",
        })
        assert resp.status_code == 400
