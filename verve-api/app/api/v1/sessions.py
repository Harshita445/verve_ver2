import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.practice_session import (
    PracticeSessionCreate,
    PracticeSessionListRead,
    PracticeSessionRead,
    PracticeSessionUpdate,
)
from app.services.practice_session_service import (
    PracticeSessionError,
    create_session,
    get_session_for_user,
    list_sessions_for_user,
    update_session,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=PracticeSessionRead, status_code=status.HTTP_201_CREATED)
def create_practice_session(
    payload: PracticeSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionRead:
    return create_session(db, current_user, payload)


@router.get("", response_model=PracticeSessionListRead)
def read_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionListRead:
    sessions, total = list_sessions_for_user(db, current_user, skip, limit)
    return PracticeSessionListRead(sessions=sessions, total=total)


@router.get("/{session_id}", response_model=PracticeSessionRead)
def read_practice_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionRead:
    try:
        return get_session_for_user(db, current_user, session_id)
    except PracticeSessionError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{session_id}", response_model=PracticeSessionRead)
def update_practice_session(
    session_id: uuid.UUID,
    payload: PracticeSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionRead:
    try:
        return update_session(db, current_user, session_id, payload)
    except PracticeSessionError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
