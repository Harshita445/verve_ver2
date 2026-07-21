import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.practice_session import SessionMode, SessionStatus


class PracticeSessionCreate(BaseModel):
    mode: SessionMode
    prompt_text: str | None = None


class PracticeSessionRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    mode: SessionMode
    prompt_text: str | None
    status: SessionStatus
    duration_seconds: int | None
    audio_url: str | None
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True
