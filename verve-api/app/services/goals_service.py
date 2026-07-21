import uuid

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.user import User
from app.schemas.goals import GoalCreate, GoalUpdate


class GoalError(Exception):
    pass


def list_goals(db: Session, user: User) -> list[Goal]:
    return (
        db.query(Goal)
        .filter(Goal.user_id == user.id)
        .order_by(Goal.created_at.desc())
        .all()
    )


def create_goal(db: Session, user: User, payload: GoalCreate) -> Goal:
    goal = Goal(
        user_id=user.id,
        description=payload.description,
        target_sessions=payload.target_sessions,
    )
    db.add(goal)
    try:
        db.commit()
        db.refresh(goal)
    except Exception:
        db.rollback()
        raise GoalError("Failed to create goal.")
    return goal


def update_goal(db: Session, user: User, goal_id: uuid.UUID, payload: GoalUpdate) -> Goal:
    goal = db.get(Goal, goal_id)
    if goal is None or goal.user_id != user.id:
        raise GoalError("Goal not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    try:
        db.commit()
        db.refresh(goal)
    except Exception:
        db.rollback()
        raise GoalError("Failed to update goal.")
    return goal


def delete_goal(db: Session, user: User, goal_id: uuid.UUID) -> None:
    goal = db.get(Goal, goal_id)
    if goal is None or goal.user_id != user.id:
        raise GoalError("Goal not found.")
    db.delete(goal)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise GoalError("Failed to delete goal.")
