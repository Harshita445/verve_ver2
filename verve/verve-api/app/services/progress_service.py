import uuid

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.feedback_report import FeedbackReport
from app.models.practice_session import PracticeSession, SessionStatus
from app.models.user import User


def get_progress(db: Session, user: User) -> dict:
    completed_sessions = (
        db.query(PracticeSession)
        .filter(
            PracticeSession.user_id == user.id,
            PracticeSession.status == SessionStatus.completed,
        )
        .order_by(desc(PracticeSession.completed_at))
        .all()
    )

    total_sessions = len(completed_sessions)

    streak = _calculate_streak(completed_sessions)

    session_ids = [s.id for s in completed_sessions]
    feedbacks = (
        db.query(FeedbackReport)
        .filter(FeedbackReport.session_id.in_(session_ids))
        .order_by(desc(FeedbackReport.created_at))
        .all()
    ) if session_ids else []

    feedback_map = {f.session_id: f for f in feedbacks}

    # Skill averages
    skill_fields = [
        "structure_score", "relevance_score", "evidence_score",
        "persuasion_score", "confidence_score", "examples_score",
    ]
    skill_names = ["Structure", "Relevance", "Evidence", "Persuasion", "Confidence", "Examples"]

    skill_averages = []
    if feedbacks:
        n = len(feedbacks)
        for name, field in zip(skill_names, skill_fields):
            avg = sum(getattr(f, field) for f in feedbacks) / n
            skill_averages.append({"name": name, "average_score": round(avg, 1)})
    else:
        for name in skill_names:
            skill_averages.append({"name": name, "average_score": 0.0})

    # Average rating (overall_score)
    avg_rating = round(
        sum(f.overall_score for f in feedbacks) / len(feedbacks), 1
    ) if feedbacks else 0.0

    # Best mode
    mode_scores: dict[str, list[int]] = {}
    for s in completed_sessions:
        f = feedback_map.get(s.id)
        if f:
            mode_scores.setdefault(s.mode.value, []).append(f.overall_score)

    best_mode = None
    if mode_scores:
        best_mode = max(mode_scores, key=lambda m: sum(mode_scores[m]) / len(mode_scores[m]))

    # Recent sessions
    recent_sessions = []
    for s in completed_sessions[:5]:
        f = feedback_map.get(s.id)
        if f:
            recent_sessions.append({
                "session_id": s.id,
                "mode": s.mode.value,
                "rating_before": f.rating_before,
                "rating_after": f.rating_after,
                "rating_change": f.rating_change,
                "overall_score": f.overall_score,
                "created_at": s.created_at,
            })

    # Rating history
    rating_history = []
    for s in completed_sessions:
        f = feedback_map.get(s.id)
        if f:
            rating_history.append({
                "session_id": s.id,
                "rating_after": f.rating_after,
                "created_at": s.created_at,
            })

    return {
        "total_sessions": total_sessions,
        "current_streak": streak,
        "average_rating": avg_rating,
        "current_rating": user.current_rating,
        "best_mode": best_mode,
        "skill_averages": skill_averages,
        "recent_sessions": recent_sessions,
        "rating_history": rating_history,
    }


def _calculate_streak(completed_sessions: list) -> int:
    if not completed_sessions:
        return 0

    from datetime import date, timedelta

    dates = sorted(
        set(s.completed_at.date() for s in completed_sessions if s.completed_at),
        reverse=True,
    )
    if not dates:
        return 0

    streak = 1
    for i in range(len(dates) - 1):
        if dates[i] - dates[i + 1] == timedelta(days=1):
            streak += 1
        else:
            break

    return streak
