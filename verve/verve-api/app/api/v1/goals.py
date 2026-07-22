import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.goals import GoalCreate, GoalRead, GoalUpdate
from app.services.goals_service import GoalError, create_goal, delete_goal, list_goals, update_goal

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=list[GoalRead])
def read_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[GoalRead]:
    return list_goals(db, current_user)


@router.post("", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
def create_goal_route(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalRead:
    try:
        return create_goal(db, current_user, payload)
    except GoalError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{goal_id}", response_model=GoalRead)
def update_goal_route(
    goal_id: uuid.UUID,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalRead:
    try:
        return update_goal(db, current_user, goal_id, payload)
    except GoalError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal_route(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    try:
        delete_goal(db, current_user, goal_id)
    except GoalError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
