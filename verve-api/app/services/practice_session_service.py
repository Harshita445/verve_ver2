import uuid

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.practice_session import PracticeSession, SessionStatus
from app.models.user import User
from app.schemas.practice_session import PracticeSessionCreate, PracticeSessionUpdate


class PracticeSessionError(Exception):
    pass


import logging

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.practice_session import PracticeSession, SessionStatus
from app.models.user import User
from app.schemas.practice_session import PracticeSessionCreate, PracticeSessionUpdate

logger = logging.getLogger(__name__)


class PracticeSessionError(Exception):
    pass


def create_session(
    db: Session, user: User, payload: PracticeSessionCreate
) -> PracticeSession:
    session = PracticeSession(
        user_id=user.id,
        mode=payload.mode,
        prompt_text=payload.prompt_text,
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
