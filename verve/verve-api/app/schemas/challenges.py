from pydantic import BaseModel

from app.models.practice_session import SessionMode


class DailyChallengeRead(BaseModel):
    mode: SessionMode
    prompt_text: str
    difficulty: str
    prep_seconds: int = 30
    speak_seconds: int = 120
