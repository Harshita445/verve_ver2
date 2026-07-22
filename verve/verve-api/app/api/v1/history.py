import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.feedback_report import FeedbackReport
from app.models.practice_session import PracticeSession, SessionStatus
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/history", tags=["history"])


class HistoryItem(BaseModel):
    session_id: uuid.UUID
    mode: str
    prompt_text: str | None
    duration_seconds: int | None
    status: str
    overall_score: int | None
    rating_change: int | None
    completed_at: str | None
    created_at: str

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    items: list[HistoryItem]
    total: int


@router.get("", response_model=HistoryListResponse)
def list_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HistoryListResponse:
    total = (
        db.query(PracticeSession)
        .filter(PracticeSession.user_id == current_user.id)
        .filter(PracticeSession.status == SessionStatus.completed)
        .count()
    )

    sessions = (
        db.query(PracticeSession)
        .filter(PracticeSession.user_id == current_user.id)
        .filter(PracticeSession.status == SessionStatus.completed)
        .order_by(desc(PracticeSession.completed_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    session_ids = [s.id for s in sessions]
    reports = (
        db.query(FeedbackReport)
        .filter(FeedbackReport.session_id.in_(session_ids))
        .all()
    )
    report_map = {r.session_id: r for r in reports}

    items = [
        HistoryItem(
            session_id=s.id,
            mode=s.mode.value if hasattr(s.mode, "value") else str(s.mode),
            prompt_text=s.prompt_text,
            duration_seconds=s.duration_seconds,
            status=s.status.value if hasattr(s.status, "value") else str(s.status),
            overall_score=report_map.get(s.id).overall_score if report_map.get(s.id) else None,
            rating_change=report_map.get(s.id).rating_change if report_map.get(s.id) else None,
            completed_at=(
                s.completed_at.isoformat() if s.completed_at else None
            ),
            created_at=s.created_at.isoformat(),
        )
        for s in sessions
    ]

    return HistoryListResponse(items=items, total=total)
