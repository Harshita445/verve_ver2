import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.practice_session import SessionMode
from app.models.user import User
from app.schemas.challenges import DailyChallengeRead

DAILY_PROMPTS: dict[SessionMode, list[str]] = {
    SessionMode.impromptu: [
        "Describe a time you had to make a difficult decision with limited information.",
        "What does effective leadership mean to you?",
        "If you could solve one global problem, which would it be and why?",
        "What is the most important lesson you've learned in the past year?",
        "Describe a situation where you had to persuade someone who disagreed with you.",
    ],
    SessionMode.debate: [
        "Artificial intelligence will create more jobs than it destroys. Defend or oppose.",
        "Remote work is better for productivity than office work. Defend or oppose.",
        "Social media does more harm than good. Defend or oppose.",
        "Universal basic income should be implemented globally. Defend or oppose.",
        "Standardized testing is an effective measure of student ability. Defend or oppose.",
    ],
    SessionMode.interview: [
        "Tell me about a time you led a team through a challenging project.",
        "Describe a situation where you had to adapt to a significant change at work.",
        "Tell me about a mistake you made and what you learned from it.",
        "Describe a time you went above and beyond what was expected of you.",
        "Tell me about a time you had to resolve a conflict within your team.",
    ],
    SessionMode.storytelling: [
        "Recall a moment when you felt completely out of your depth. What happened?",
        "Tell the story of a mentor who changed your perspective.",
        "Describe a journey — literal or metaphorical — that transformed you.",
        "Tell a story about a time things didn't go as planned, but worked out anyway.",
        "Recall a moment of unexpected kindness you witnessed or experienced.",
    ],
}

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.get("/daily", response_model=DailyChallengeRead)
def get_daily_challenge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyChallengeRead:
    import hashlib
    from datetime import date

    day_seed = str(date.today())
    modes = list(SessionMode)
    mode_idx = int(hashlib.md5(day_seed.encode()).hexdigest(), 16) % len(modes)
    mode = modes[mode_idx]

    prompts = DAILY_PROMPTS[mode]
    prompt_idx = int(hashlib.md5((day_seed + mode.value).encode()).hexdigest(), 16) % len(prompts)
    prompt_text = prompts[prompt_idx]

    return DailyChallengeRead(
        mode=mode,
        prompt_text=prompt_text,
        difficulty="intermediate",
        prep_seconds=30,
        speak_seconds=120,
    )
