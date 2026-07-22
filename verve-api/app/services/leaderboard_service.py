import uuid

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.feedback_report import FeedbackReport
from app.models.practice_session import PracticeSession, SessionStatus
from app.models.user import User


def get_leaderboard(
    db: Session, current_user: User, limit: int = 50
) -> tuple[list[dict], int]:
    """Return users ordered by rating, with strongest skill and streak."""

    min_sessions = (
        db.query(PracticeSession.user_id)
        .filter(PracticeSession.status == SessionStatus.completed)
        .group_by(PracticeSession.user_id)
        .having(func.count() >= 1)
        .subquery()
    )

    users = (
        db.query(User)
        .filter(User.id.in_(db.query(min_sessions.c.user_id)))
        .order_by(desc(User.current_rating))
        .limit(limit)
        .all()
    )

    entries = []
    for rank, user in enumerate(users, 1):
        latest_feedback = (
            db.query(FeedbackReport)
            .join(PracticeSession, FeedbackReport.session_id == PracticeSession.id)
            .filter(PracticeSession.user_id == user.id)
            .order_by(desc(PracticeSession.created_at))
            .first()
        )

        strongest_skill = latest_feedback.strongest_skill if latest_feedback else None

        streak = _calculate_streak(db, user.id)

        entries.append(
            {
                "rank": rank,
                "user_id": user.id,
                "name": user.display_name,
                "avatar_initials": user.avatar_initials,
                "rating": user.current_rating,
                "strongest_skill": strongest_skill,
                "streak": streak,
                "is_current_user": user.id == current_user.id,
            }
        )

    return entries, len(users)


def _calculate_streak(db: Session, user_id: uuid.UUID) -> int:
    completed = (
        db.query(PracticeSession.completed_at)
        .filter(
            PracticeSession.user_id == user_id,
            PracticeSession.status == SessionStatus.completed,
            PracticeSession.completed_at.isnot(None),
        )
        .order_by(desc(PracticeSession.completed_at))
        .all()
    )

    if not completed:
        return 0

    from datetime import date, timedelta

    streak = 1
    for i in range(len(completed) - 1):
        curr = completed[i].completed_at.date()
        prev = completed[i + 1].completed_at.date()
        if curr - prev == timedelta(days=1):
            streak += 1
        elif curr == prev:
            continue
        else:
            break

    return streak
