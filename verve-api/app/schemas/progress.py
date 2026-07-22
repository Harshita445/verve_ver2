import uuid
from datetime import datetime

from pydantic import BaseModel


class SkillAverage(BaseModel):
    name: str
    average_score: float


class RecentSessionEntry(BaseModel):
    session_id: uuid.UUID
    mode: str
    rating_before: int
    rating_after: int
    rating_change: int
    overall_score: int
    created_at: datetime


class RatingHistoryPoint(BaseModel):
    session_id: uuid.UUID
    rating_after: int
    created_at: datetime


class ProgressResponse(BaseModel):
    total_sessions: int
    current_streak: int
    average_rating: float
    current_rating: int
    best_mode: str | None
    skill_averages: list[SkillAverage]
    recent_sessions: list[RecentSessionEntry]
    rating_history: list[RatingHistoryPoint]
