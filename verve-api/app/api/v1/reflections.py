import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.practice_session import PracticeSession
from app.models.reflection import Reflection
from app.models.user import User
from app.schemas.feedback import ReflectionPayload, ReflectionResponse

router = APIRouter(prefix="/reflections", tags=["reflections"])


@router.get("/{session_id}", response_model=ReflectionResponse | None)
def get_reflection(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReflectionResponse | None:
    reflection = (
        db.query(Reflection)
        .filter(
            Reflection.session_id == session_id,
            Reflection.user_id == current_user.id,
        )
        .first()
    )
    if reflection is None:
        return None
    return ReflectionResponse(
        id=reflection.id,
        session_id=reflection.session_id,
        most_difficult_part=reflection.most_difficult_part,
        what_to_improve=reflection.what_to_improve,
    )


@router.put("/{session_id}", response_model=ReflectionResponse)
def upsert_reflection(
    session_id: uuid.UUID,
    payload: ReflectionPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReflectionResponse:
    session = db.get(PracticeSession, session_id)
    if session is None or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    reflection = (
        db.query(Reflection)
        .filter(
            Reflection.session_id == session_id,
            Reflection.user_id == current_user.id,
        )
        .first()
    )

    if reflection is None:
        reflection = Reflection(
            session_id=session_id,
            user_id=current_user.id,
        )
        db.add(reflection)

    if payload.most_difficult_part is not None:
        reflection.most_difficult_part = payload.most_difficult_part
    if payload.what_to_improve is not None:
        reflection.what_to_improve = payload.what_to_improve

    db.commit()
    db.refresh(reflection)

    return ReflectionResponse(
        id=reflection.id,
        session_id=reflection.session_id,
        most_difficult_part=reflection.most_difficult_part,
        what_to_improve=reflection.what_to_improve,
    )
