import uuid
from datetime import datetime

from pydantic import BaseModel


class TimelineEntry(BaseModel):
    timestamp_seconds: int
    label: str
    description: str
    type: str  # "strong", "weakness", "improvement", "neutral"


class TranscriptAnnotation(BaseModel):
    text: str
    annotation: str
    type: str  # "strong", "weakness", "neutral"


class SessionStatistics(BaseModel):
    duration_seconds: int
    words_spoken: int
    speaking_rate_wpm: float | None
    longest_pause_seconds: float | None
    filler_word_count: int
    vocabulary_diversity: float | None
    sentence_variety: float | None
    avg_response_length_words: float | None


class SkillDetail(BaseModel):
    name: str
    score: int
    description: str
    improvement_tip: str


class ProgressDelta(BaseModel):
    skill_name: str
    change: int  # positive = improvement


class NextChallenge(BaseModel):
    mode: str
    difficulty: str
    reason: str


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

    skills: list[SkillDetail]
    timeline: list[TimelineEntry]
    transcript_annotations: list[TranscriptAnnotation]
    statistics: SessionStatistics | None
    next_challenge: NextChallenge | None

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
    progress_deltas: list[ProgressDelta] = []


class AudioUploadResponse(BaseModel):
    audio_file_id: uuid.UUID
    storage_url: str
    session_id: uuid.UUID


class SessionStartResponse(BaseModel):
    session_id: uuid.UUID
    status: str


class ReflectionPayload(BaseModel):
    session_id: uuid.UUID
    most_difficult_part: str | None = None
    what_to_improve: str | None = None


class ReflectionResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    most_difficult_part: str | None
    what_to_improve: str | None
