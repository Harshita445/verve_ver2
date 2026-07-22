import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.data.prompts import PROMPT_BANK
from app.db.session import get_db
from app.models.practice_session import SessionMode
from app.models.user import User
from app.schemas.challenges import DailyChallengeRead

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

    prompts = PROMPT_BANK[mode]
    prompt_idx = int(hashlib.md5((day_seed + mode.value).encode()).hexdigest(), 16) % len(prompts)
    entry = prompts[prompt_idx]

    return DailyChallengeRead(
        mode=mode,
        prompt_text=entry["text"],
        prompt_format=entry.get("format"),
        difficulty="intermediate",
        prep_seconds=30,
        speak_seconds=120,
    )
