from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.auth import UserOut
from app.schemas.profile import OnboardingUpdate, ProfileRead, ProfileUpdate
from app.services import profile_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileRead)
def read_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    return profile_service.get_or_create_profile(db, current_user)


@router.put("", response_model=ProfileRead)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    return profile_service.update_profile(db, current_user, payload)


@router.post("/onboarding", response_model=UserOut)
def complete_onboarding(
    payload: OnboardingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    user = current_user
    if payload.onboarding_completed:
        user = profile_service.complete_onboarding(db, current_user)
    else:
        user.onboarding_step = payload.onboarding_step
        db.commit()
        db.refresh(user)
    return user
