import random
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


def _select_prompt(
    db: Session, user: User, mode, style: str | None
) -> tuple[str, str | None]:
    """Pick a prompt from PROMPT_BANK with no-repeat logic.

    Returns (prompt_text, prompt_format).
    """
    from app.data.prompts import PROMPT_BANK

    pool = list(PROMPT_BANK.get(mode, []))

    # Filter by style if specified
    if style == "one_word":
        pool = [e for e in pool if e.get("format") == "one_word"]
    elif style == "full":
        pool = [e for e in pool if e.get("format") != "one_word"]

    if not pool:
        pool = list(PROMPT_BANK.get(mode, []))
        if style == "one_word":
            pool = [e for e in pool if e.get("format") == "one_word"]
        elif style == "full":
            pool = [e for e in pool if e.get("format") != "one_word"]

    # Gather recent texts and formats to exclude
    recent = (
        db.query(PracticeSession.prompt_text, PracticeSession.prompt_format)
        .filter(
            PracticeSession.user_id == user.id,
            PracticeSession.mode == mode,
            PracticeSession.prompt_text.isnot(None),
        )
        .order_by(desc(PracticeSession.created_at))
        .limit(8)
        .all()
    )
    excluded_texts: set[str] = {r.prompt_text for r in recent if r.prompt_text}
    recent_formats = [r.prompt_format for r in recent if r.prompt_format]
    # Exclude the last 2 distinct formats
    seen_formats: set[str] = set()
    excluded_formats: set[str] = set()
    for f in recent_formats:
        if f not in seen_formats:
            seen_formats.add(f)
            if len(seen_formats) <= 2:
                excluded_formats.add(f)

    # Build candidate pool: exclude texts and formats
    candidates = [
        e for e in pool
        if e["text"] not in excluded_texts
        and e.get("format") not in excluded_formats
    ]

    # Fall back to text-exclusion only
    if not candidates:
        candidates = [e for e in pool if e["text"] not in excluded_texts]

    # Fall back to full pool
    if not candidates:
        candidates = pool

    entry = random.choice(candidates)
    return entry["text"], entry.get("format")


def create_session(
    db: Session, user: User, payload: PracticeSessionCreate
) -> PracticeSession:
    debate_side: str | None = None
    if payload.mode.value == "debate":
        debate_side = random.choice(["for", "against"])

    prompt_text: str | None = payload.prompt_text
    prompt_format: str | None = None

    if prompt_text is not None:
        # Explicit text provided — look up its format from the bank
        from app.data.prompts import PROMPT_BANK

        bank = PROMPT_BANK.get(payload.mode, [])
        for entry in bank:
            if entry["text"] == prompt_text:
                prompt_format = entry.get("format")
                break
    else:
        # Auto-select from bank
        prompt_text, prompt_format = _select_prompt(
            db, user, payload.mode, payload.prompt_style
        )

    session = PracticeSession(
        user_id=user.id,
        mode=payload.mode,
        prompt_text=prompt_text,
        prompt_format=prompt_format,
        debate_side=debate_side,
        hints_enabled=payload.hints_enabled,
        scratchpad_enabled=payload.scratchpad_enabled,
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
