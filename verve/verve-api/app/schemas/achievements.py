import uuid
from datetime import datetime

from pydantic import BaseModel


class AchievementRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
