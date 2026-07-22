import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.feedback_report import FeedbackReport
from app.models.practice_session import PracticeSession
from app.models.user import User
from app.schemas.admin import StatsOut, UserAdminOut, UserUpdateAdmin

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    _admin: User = Depends(_require_admin),
    db: Session = Depends(get_db),
) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


@router.get("/users/{user_id}", response_model=UserAdminOut)
def get_user(
    user_id: uuid.UUID,
    _admin: User = Depends(_require_admin),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserAdminOut)
def update_user(
    user_id: uuid.UUID,
    payload: UserUpdateAdmin,
    _admin: User = Depends(_require_admin),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.plan is not None:
        user.plan = payload.plan
    if payload.is_admin is not None:
        user.is_admin = payload.is_admin
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: uuid.UUID,
    _admin: User = Depends(_require_admin),
    db: Session = Depends(get_db),
) -> None:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()


@router.get("/stats", response_model=StatsOut)
def get_stats(
    _admin: User = Depends(_require_admin),
    db: Session = Depends(get_db),
) -> StatsOut:
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_sessions = db.query(func.count(PracticeSession.id)).scalar() or 0
    total_feedback = db.query(func.count(FeedbackReport.id)).scalar() or 0
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    active_users = (
        db.query(func.count(func.distinct(PracticeSession.user_id)))
        .filter(PracticeSession.created_at >= cutoff)
        .scalar()
        or 0
    )
    pro_users = db.query(func.count(User.id)).filter(User.plan == "pro").scalar() or 0
    free_users = total_users - pro_users

    return StatsOut(
        total_users=total_users,
        total_sessions=total_sessions,
        total_feedback_reports=total_feedback,
        active_users_last_7d=active_users,
        pro_users=pro_users,
        free_users=free_users,
    )
