import uuid

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.profile import ProfileUpdate


class ProfileNotFoundError(Exception):
    pass


def get_or_create_profile(db: Session, user: User) -> UserProfile:
    profile = (
        db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    )
    if profile is None:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_profile(
    db: Session, user: User, payload: ProfileUpdate
) -> UserProfile:
    profile = get_or_create_profile(db, user)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


def complete_onboarding(
    db: Session, user: User, profile_payload: ProfileUpdate | None = None
) -> User:
    if profile_payload:
        update_profile(db, user, profile_payload)
    user.onboarding_completed = True
    user.onboarding_step = 5
    db.commit()
    db.refresh(user)
    return user
