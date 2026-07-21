from datetime import datetime, timedelta, timezone
from typing import Any, Literal
import hashlib
import secrets
import uuid

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()

# Using the `bcrypt` package directly rather than passlib's CryptContext:
# passlib 1.7.4's bcrypt backend self-test is broken against bcrypt>=4.1
# (it probes a removed internal attribute), so we skip that dependency
# entirely rather than pin around it.
_BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    truncated = password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    return bcrypt.hashpw(truncated, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    truncated = plain_password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    return bcrypt.checkpw(truncated, password_hash.encode("utf-8"))


def create_token(
    subject: str, token_type: Literal["access", "refresh"]
) -> str:
    if token_type == "access":
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    else:
        expires_delta = timedelta(days=settings.refresh_token_expire_days)

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode: dict[str, Any] = {"sub": subject, "type": token_type, "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> tuple[str, uuid.UUID, datetime]:
    """
    Refresh tokens carry a `jti` (JWT ID) so each one maps to exactly one
    `refresh_tokens` DB row — that row is what makes revocation and
    rotation-on-use possible, since a bare JWT can't be invalidated before
    its natural expiry. Returns (encoded_token, jti, expires_at) so the
    caller can persist the tracking row alongside handing back the token.
    """
    jti = uuid.uuid4()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    to_encode: dict[str, Any] = {
        "sub": subject,
        "type": "refresh",
        "jti": str(jti),
        "exp": expire,
    }
    token = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, jti, expire


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        return None


def generate_reset_token() -> tuple[str, str]:
    """
    Returns (raw_token, token_hash). raw_token goes to the user (email
    link / dev response); token_hash is what gets stored in the DB. A
    plain SHA-256 hash (not bcrypt) is intentional here — the input is
    already a 32-byte cryptographically random value, not a short
    human-chosen password, so there's no brute-force surface a slow hash
    would protect against, and a fast hash keeps the reset-password
    lookup a simple indexed equality check.
    """
    raw = secrets.token_urlsafe(32)
    return raw, hash_reset_token(raw)


def hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
