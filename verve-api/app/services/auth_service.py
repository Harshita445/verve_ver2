import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    create_refresh_token,
    decode_token,
    generate_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.models.password_reset_token import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import SignupRequest

logger = logging.getLogger(__name__)
settings = get_settings()

# How long a password-reset link stays valid. Short-lived by design — this
# is a bearer credential that only needs to survive an inbox check.
RESET_TOKEN_TTL = timedelta(minutes=30)


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
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        logger.exception("Failed to create user")
        raise AuthError("Failed to create account.") from e
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise AuthError("Incorrect email or password.")
    return user


# --- Refresh tokens -----------------------------------------------------


def issue_refresh_token(db: Session, user: User) -> str:
    """Creates a new refresh token JWT and its tracking row, returns the
    encoded token to be set as the httpOnly cookie."""
    token, jti, expires_at = create_refresh_token(str(user.id))
    db.add(RefreshToken(id=jti, user_id=user.id, expires_at=expires_at))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise AuthError("Failed to issue refresh token.")
    return token


def rotate_refresh_token(db: Session, raw_token: str) -> tuple[User, str]:
    """
    Validates a presented refresh token, revokes it, and issues a new
    token pair — refresh tokens are single-use. If the presented token
    has already been revoked, that's a sign it was stolen and replayed
    (the legitimate client would only ever hold the latest one), so every
    other live refresh token for that user is revoked too, forcing a
    fresh login everywhere.
    """
    payload = decode_token(raw_token)
    if payload is None or payload.get("type") != "refresh" or "jti" not in payload:
        raise AuthError("Invalid or expired refresh token.")

    try:
        jti = uuid.UUID(payload["jti"])
        user_id = uuid.UUID(payload["sub"])
    except ValueError:
        raise AuthError("Invalid or expired refresh token.")

    row = db.get(RefreshToken, jti)
    if row is None or row.user_id != user_id:
        raise AuthError("Invalid or expired refresh token.")

    if row.revoked_at is not None:
        _revoke_all_refresh_tokens(db, user_id)
        raise AuthError("Refresh token reuse detected; all sessions revoked.")

    if row.expires_at < datetime.now(timezone.utc):
        raise AuthError("Invalid or expired refresh token.")

    user = db.get(User, user_id)
    if user is None:
        raise AuthError("Invalid or expired refresh token.")

    row.revoked_at = datetime.now(timezone.utc)
    new_token = issue_refresh_token(db, user)
    return user, new_token


def revoke_refresh_token(db: Session, raw_token: str) -> None:
    """Best-effort revoke for logout — silently no-ops on an already
    invalid/expired/unknown token rather than erroring, since the caller's
    goal (this cookie should stop working) is achieved either way."""
    payload = decode_token(raw_token)
    if payload is None or payload.get("type") != "refresh" or "jti" not in payload:
        return

    try:
        jti = uuid.UUID(payload["jti"])
    except ValueError:
        return

    row = db.get(RefreshToken, jti)
    if row is not None and row.revoked_at is None:
        row.revoked_at = datetime.now(timezone.utc)
        try:
            db.commit()
        except Exception:
            db.rollback()


def _revoke_all_refresh_tokens(db: Session, user_id: uuid.UUID) -> None:
    now = datetime.now(timezone.utc)
    rows = db.scalars(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None)
        )
    )
    for row in rows:
        row.revoked_at = now
    try:
        db.commit()
    except Exception:
        db.rollback()


# --- Forgot / reset password ---------------------------------------------


def create_password_reset_token(db: Session, email: str) -> str | None:
    """
    Returns the raw reset token, or None if no account matches. The route
    layer must NOT reflect that None-vs-not distinction back to the
    caller (that's how account enumeration happens) — it's returned here
    only so the route can log/send it.
    """
    user = get_user_by_email(db, email)
    if user is None:
        return None

    raw, token_hash = generate_reset_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + RESET_TOKEN_TTL,
        )
    )
    try:
        db.commit()
    except Exception:
        db.rollback()
        return None

    # No email provider is wired up yet (see CONTEXT.md build order) — log
    # the link server-side so the flow is testable end to end until one
    # is. This must never happen in production; swap for a real send once
    # step 15's email integration lands.
    if settings.environment != "production":
        logger.info("Password reset token for %s: %s", email, raw)

    return raw


def reset_password(db: Session, raw_token: str, new_password: str) -> None:
    token_hash = hash_reset_token(raw_token)
    row = db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )

    if row is None or row.used_at is not None:
        raise AuthError("Invalid or expired reset token.")

    if row.expires_at < datetime.now(timezone.utc):
        raise AuthError("Invalid or expired reset token.")

    user = db.get(User, row.user_id)
    if user is None:
        raise AuthError("Invalid or expired reset token.")

    user.password_hash = hash_password(new_password)
    row.used_at = datetime.now(timezone.utc)
    _revoke_all_refresh_tokens(db, user.id)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise AuthError("Failed to reset password.")
