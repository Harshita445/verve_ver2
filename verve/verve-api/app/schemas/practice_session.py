import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.practice_session import SessionMode, SessionStatus


class PracticeSessionCreate(BaseModel):
    mode: SessionMode
    prompt_text: str | None = None
    prompt_style: str | None = None
    hints_enabled: bool = False
    prep_seconds: int = Field(default=30, ge=10, le=300)
    speak_seconds: int = Field(default=120, ge=30, le=600)


class PracticeSessionUpdate(BaseModel):
    status: SessionStatus | None = None
    duration_seconds: int | None = None
    audio_url: str | None = None


class PracticeSessionRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    mode: SessionMode
    prompt_text: str | None
    prompt_format: str | None
    debate_side: str | None
    hints_enabled: bool
    prep_seconds: int
    speak_seconds: int
    status: SessionStatus
    duration_seconds: int | None
    audio_url: str | None
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True


class PracticeSessionListRead(BaseModel):
    sessions: list[PracticeSessionRead]
    total: int


class PracticeSessionStartResponse(BaseModel):
    session_id: uuid.UUID
    status: str
