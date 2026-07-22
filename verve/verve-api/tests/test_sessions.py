"""Weekly session cap integration tests."""

from datetime import datetime, timedelta, timezone
from unittest.mock import ANY

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.practice_session import PracticeSession, SessionMode, SessionStatus
from app.models.user import User

settings = get_settings()


def _make_sessions(db: Session, user: User, count: int, days_ago: list[float] | None = None) -> None:
    """Create *count* practice sessions for *user*, optionally with custom ages in days."""
    for i in range(count):
        age = days_ago[i] if days_ago else 0
        session = PracticeSession(
            user_id=user.id,
            mode=SessionMode.freestyle,
            prompt_text=f"Session {i}",
            prep_seconds=30,
            speak_seconds=120,
            status=SessionStatus.completed,
            created_at=datetime.now(timezone.utc) - timedelta(days=age),
        )
        db.add(session)
    db.commit()


class TestWeeklyCap:
    async def test_under_limit_allowed(self, client: AsyncClient, test_user: User, db: Session, auth_headers: dict[str, str]) -> None:
        _make_sessions(db, test_user, settings.free_plan_weekly_limit - 1)
        resp = await client.post("/api/v1/sessions", json={"mode": "freestyle"}, headers=auth_headers)
        assert resp.status_code == 201

    async def test_at_limit_rejected(self, client: AsyncClient, test_user: User, db: Session, auth_headers: dict[str, str]) -> None:
        _make_sessions(db, test_user, settings.free_plan_weekly_limit)
        resp = await client.post("/api/v1/sessions", json={"mode": "freestyle"}, headers=auth_headers)
        assert resp.status_code == 429
        detail = resp.json()["detail"]
        assert "resets_at" in detail

    async def test_seventh_day_rolls_off(self, client: AsyncClient, test_user: User, db: Session, auth_headers: dict[str, str]) -> None:
        # 5 sessions in the last week, 1 session exactly 7.1 days old
        _make_sessions(db, test_user, 5, days_ago=[0, 0, 0, 0, 0])
        old = PracticeSession(
            user_id=test_user.id,
            mode=SessionMode.freestyle,
            prompt_text="Old session",
            prep_seconds=30,
            speak_seconds=120,
            status=SessionStatus.completed,
            created_at=datetime.now(timezone.utc) - timedelta(days=7, hours=2),
        )
        db.add(old)
        db.commit()
        # We should be at limit - 5 recent + 1 old (just outside the window)
        resp = await client.post("/api/v1/sessions", json={"mode": "freestyle"}, headers=auth_headers)
        # The old one is outside the 7-day window, so the count is 5, and a new one is allowed
        assert resp.status_code == 201
