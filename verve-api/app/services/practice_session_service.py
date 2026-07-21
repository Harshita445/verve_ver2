import uuid

from sqlalchemy.orm import Session

from app.models.practice_session import PracticeSession
from app.models.user import User
from app.schemas.practice_session import PracticeSessionCreate


class PracticeSessionError(Exception):
    pass


def create_session(
    db: Session, user: User, payload: PracticeSessionCreate
) -> PracticeSession:
    session = PracticeSession(
        user_id=user.id,
        mode=payload.mode,
        prompt_text=payload.prompt_text,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session_for_user(
    db: Session, user: User, session_id: uuid.UUID
) -> PracticeSession:
    session = db.get(PracticeSession, session_id)
    # A session that exists but belongs to someone else is treated
    # identically to a session that doesn't exist at all — we never leak
    # whether a given ID is in use by another user.
    if session is None or session.user_id != user.id:
        raise PracticeSessionError("Session not found.")
    return session
