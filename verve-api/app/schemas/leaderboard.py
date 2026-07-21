import uuid

from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: uuid.UUID
    name: str
    avatar_initials: str
    rating: int
    strongest_skill: str | None
    streak: int
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    total_count: int
