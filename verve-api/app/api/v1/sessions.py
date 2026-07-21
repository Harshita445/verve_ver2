import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.practice_session import PracticeSessionCreate, PracticeSessionRead
from app.services.practice_session_service import (
    PracticeSessionError,
    create_session,
    get_session_for_user,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=PracticeSessionRead, status_code=status.HTTP_201_CREATED)
def create_practice_session(
    payload: PracticeSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionRead:
    return create_session(db, current_user, payload)  # type: ignore[return-value]


@router.get("/{session_id}", response_model=PracticeSessionRead)
def read_practice_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionRead:
    try:
        return get_session_for_user(db, current_user, session_id)  # type: ignore[return-value]
    except PracticeSessionError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
