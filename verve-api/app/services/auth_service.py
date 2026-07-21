from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import SignupRequest


class AuthError(Exception):
    pass


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def create_user(db: Session, payload: SignupRequest) -> User:
    if get_user_by_email(db, payload.email):
        raise AuthError("An account with this email already exists.")

    initials = "".join(part[0] for part in payload.display_name.split()[:2]).upper()

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name,
        avatar_initials=initials or "U",
        current_rating=1200,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise AuthError("Incorrect email or password.")
    return user
