import uuid
from datetime import datetime

from pydantic import BaseModel


class GoalCreate(BaseModel):
    description: str
    target_sessions: int = 5


class GoalUpdate(BaseModel):
    description: str | None = None
    target_sessions: int | None = None
    current_progress: int | None = None
    achieved: bool | None = None


class GoalRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    description: str
    target_sessions: int
    current_progress: int
    achieved: bool
    created_at: datetime

    class Config:
        from_attributes = True
