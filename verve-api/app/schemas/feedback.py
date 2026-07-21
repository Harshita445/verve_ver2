import uuid
from datetime import datetime

from pydantic import BaseModel


class FeedbackReportRead(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    overall_score: int
    structure_score: int
    relevance_score: int
    evidence_score: int
    persuasion_score: int
    confidence_score: int
    examples_score: int
    strongest_skill: str
    weakest_skill: str
    next_focus: str
    summary: str | None
    rating_before: int
    rating_after: int
    rating_change: int
    created_at: datetime

    class Config:
        from_attributes = True


class SessionStatusRead(BaseModel):
    id: uuid.UUID
    status: str
    duration_seconds: int | None
    audio_url: str | None


class SessionResultRead(BaseModel):
    session_id: uuid.UUID
    status: str
    feedback: FeedbackReportRead | None
    transcript_text: str | None


class AudioUploadResponse(BaseModel):
    audio_file_id: uuid.UUID
    storage_url: str
    session_id: uuid.UUID


class SessionStartResponse(BaseModel):
    session_id: uuid.UUID
    status: str
