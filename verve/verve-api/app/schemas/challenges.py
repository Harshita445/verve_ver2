from pydantic import BaseModel

from app.models.practice_session import SessionMode


class DailyChallengeRead(BaseModel):
    mode: SessionMode
    prompt_text: str
    prompt_format: str | None = None
    difficulty: str
    prep_seconds: int = 30
    speak_seconds: int = 120
