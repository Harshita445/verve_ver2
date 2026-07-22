import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limiter import rate_limiter
from app.core.security import create_token
from app.db.session import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from app.services.auth_service import (
    AuthError,
    authenticate_user,
    create_password_reset_token,
    create_user,
    issue_refresh_token,
    reset_password,
    revoke_refresh_token,
    rotate_refresh_token,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

REFRESH_COOKIE_NAME = "refresh_token"
# Scoped to /api/v1/auth rather than the whole API — the cookie is only
# ever read by the refresh/logout routes, so there's no reason for it to
# go out on every request.
REFRESH_COOKIE_PATH = "/api/v1/auth"


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)


def _rate_limit_key(request: Request, suffix: str = "") -> str:
    client_ip = request.client.host if request.client else "unknown"
    return f"{client_ip}:{suffix}"


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignupRequest, request: Request, response: Response, db: Session = Depends(get_db)
) -> TokenResponse:
    rl_key = _rate_limit_key(request, "signup")
    if not rate_limiter.check(rl_key, max_attempts=5, window_seconds=300):
        logger.warning("Rate-limited signup attempt from %s", request.client.host if request.client else "unknown")
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many signup attempts. Try again later.")

    try:
        user = create_user(db, payload)
    except AuthError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    logger.info("User signed up: email=%s id=%s", payload.email, user.id)
    from app.services.email_service import send_welcome_email

    send_welcome_email(payload.email, payload.display_name)
    access_token = create_token(str(user.id), "access")
    _set_refresh_cookie(response, issue_refresh_token(db, user))
    return TokenResponse(access_token=access_token, user=user)  # type: ignore[arg-type]


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)
) -> TokenResponse:
    rl_key = _rate_limit_key(request, "login")
    if not rate_limiter.check(rl_key, max_attempts=5, window_seconds=60):
        logger.warning("Rate-limited login attempt from %s", request.client.host if request.client else "unknown")
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many login attempts. Try again later.")

    try:
        user = authenticate_user(db, payload.email, payload.password)
    except AuthError as e:
        logger.warning("Failed login attempt for email=%s from %s", payload.email, request.client.host if request.client else "unknown")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    logger.info("User logged in: email=%s id=%s", payload.email, user.id)
    access_token = create_token(str(user.id), "access")
    _set_refresh_cookie(response, issue_refresh_token(db, user))
    return TokenResponse(access_token=access_token, user=user)  # type: ignore[arg-type]


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    request: Request, response: Response, db: Session = Depends(get_db)
) -> TokenResponse:
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        user, new_refresh_token = rotate_refresh_token(db, raw_token)
    except AuthError as e:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    access_token = create_token(str(user.id), "access")
    _set_refresh_cookie(response, new_refresh_token)
    return TokenResponse(access_token=access_token, user=user)  # type: ignore[arg-type]


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request, response: Response, db: Session = Depends(get_db)
) -> None:
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_token is not None:
        revoke_refresh_token(db, raw_token)
    _clear_refresh_cookie(response)
    return None


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)
) -> MessageResponse:
    rl_key = _rate_limit_key(request, "forgot-password")
    rate_limiter.check(rl_key, max_attempts=3, window_seconds=300)

    # Always return the same generic message whether or not the email is
    # registered — a differing response is how account enumeration leaks.
    token = create_password_reset_token(db, payload.email)
    if token:
        logger.info("Password reset token created for email=%s", payload.email)
    else:
        logger.info("Password reset requested for unknown email=%s", payload.email)

    return MessageResponse(
        message="If an account exists for that email, a reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password_route(
    payload: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)
) -> MessageResponse:
    rl_key = _rate_limit_key(request, "reset-password")
    if not rate_limiter.check(rl_key, max_attempts=5, window_seconds=300):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many reset attempts. Try again later.")

    try:
        reset_password(db, payload.token, payload.new_password)
    except AuthError as e:
        logger.warning("Password reset failed: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    logger.info("Password reset successful")
    return MessageResponse(message="Password has been reset. Please log in again.")
