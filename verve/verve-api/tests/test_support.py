"""Tests for support ticket API."""

import pytest
from httpx import AsyncClient


class TestCreateTicket:
    async def test_create_ticket(self, client: AsyncClient) -> None:
        resp = await client.post("/api/v1/support", json={
            "email": "user@example.com",
            "subject": "Help with recording",
            "message": "My audio isn't working during sessions.",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "user@example.com"
        assert data["subject"] == "Help with recording"

    async def test_missing_field(self, client: AsyncClient) -> None:
        resp = await client.post("/api/v1/support", json={
            "email": "user@example.com",
            "message": "Missing subject",
        })
        assert resp.status_code == 422

    async def test_empty_message(self, client: AsyncClient) -> None:
        resp = await client.post("/api/v1/support", json={
            "email": "user@example.com",
            "subject": "Test",
            "message": "",
        })
        assert resp.status_code == 422

    async def test_invalid_email(self, client: AsyncClient) -> None:
        resp = await client.post("/api/v1/support", json={
            "email": "not-an-email",
            "subject": "Test",
            "message": "Hello",
        })
        assert resp.status_code == 422
