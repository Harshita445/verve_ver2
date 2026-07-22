import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.practice_session import PracticeSession, SessionStatus
from app.models.user import User
from app.schemas.practice_session import PracticeSessionCreate, PracticeSessionUpdate


class PracticeSessionError(Exception):
    pass


import logging

logger = logging.getLogger(__name__)


def create_session(
    db: Session, user: User, payload: PracticeSessionCreate
) -> PracticeSession:
    debate_side: str | None = None
    if payload.mode.value == "debate":
        import random
        debate_side = random.choice(["for", "against"])

    prompt_format: str | None = None
    if payload.prompt_style:
        from app.data.prompts import PROMPT_BANK
        bank = PROMPT_BANK.get(payload.mode, [])
        for entry in bank:
            if entry["text"] == payload.prompt_text:
                prompt_format = entry.get("format")
                break

    session = PracticeSession(
        user_id=user.id,
        mode=payload.mode,
        prompt_text=payload.prompt_text,
        prompt_format=prompt_format,
        debate_side=debate_side,
        hints_enabled=payload.hints_enabled,
        prep_seconds=payload.prep_seconds,
        speak_seconds=payload.speak_seconds,
    )
    db.add(session)
    try:
        db.commit()
        db.refresh(session)
    except Exception:
        db.rollback()
        raise PracticeSessionError("Failed to create session.")
    return session


def count_sessions_this_week(
    db: Session, user_id: uuid.UUID
) -> tuple[int, datetime | None]:
    """Count the user's sessions in the rolling 7-day window.

    Returns (count, oldest_created_at) where oldest_created_at is the
    ``created_at`` of the earliest session in the window, or *None* if
    there are no sessions.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    rows = (
        db.query(PracticeSession.created_at)
        .filter(
            PracticeSession.user_id == user_id,
            PracticeSession.created_at >= cutoff,
        )
        .order_by(PracticeSession.created_at.asc())
        .all()
    )
    return len(rows), rows[0][0] if rows else None


def get_session_for_user(
    db: Session, user: User, session_id: uuid.UUID
) -> PracticeSession:
    session = db.get(PracticeSession, session_id)
    if session is None or session.user_id != user.id:
        raise PracticeSessionError("Session not found.")
    return session


def list_sessions_for_user(
    db: Session, user: User, skip: int = 0, limit: int = 20
) -> tuple[list[PracticeSession], int]:
    total = (
        db.query(PracticeSession)
        .filter(PracticeSession.user_id == user.id)
        .count()
    )
    sessions = (
        db.query(PracticeSession)
        .filter(PracticeSession.user_id == user.id)
        .order_by(desc(PracticeSession.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return sessions, total


def update_session(
    db: Session, user: User, session_id: uuid.UUID, payload: PracticeSessionUpdate
) -> PracticeSession:
    session = get_session_for_user(db, user, session_id)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)

    if payload.status == SessionStatus.completed and session.completed_at is None:
        from datetime import datetime, timezone
        session.completed_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(session)
    except Exception:
        db.rollback()
        raise PracticeSessionError("Failed to update session.")
    return session
