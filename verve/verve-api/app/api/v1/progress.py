from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.progress import ProgressResponse, SkillAverage, RecentSessionEntry, RatingHistoryPoint
from app.services.progress_service import get_progress

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=ProgressResponse)
def read_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProgressResponse:
    data = get_progress(db, current_user)
    return ProgressResponse(
        total_sessions=data["total_sessions"],
        current_streak=data["current_streak"],
        average_rating=data["average_rating"],
        current_rating=data["current_rating"],
        best_mode=data["best_mode"],
        skill_averages=[SkillAverage(**s) for s in data["skill_averages"]],
        recent_sessions=[RecentSessionEntry(**s) for s in data["recent_sessions"]],
        rating_history=[RatingHistoryPoint(**r) for r in data["rating_history"]],
    )
