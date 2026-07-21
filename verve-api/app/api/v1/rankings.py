from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, LeaderboardResponse
from app.services.leaderboard_service import get_leaderboard

router = APIRouter(prefix="/rankings", tags=["rankings"])


@router.get("", response_model=LeaderboardResponse)
def read_leaderboard(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LeaderboardResponse:
    entries, total = get_leaderboard(db, current_user, limit)
    return LeaderboardResponse(
        entries=[LeaderboardEntry(**e) for e in entries],
        total_count=total,
    )
