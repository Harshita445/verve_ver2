import uuid

import pytest
from sqlalchemy.orm import Session

from app.models.password_reset_token import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import SignupRequest
from app.services.auth_service import (
    AuthError,
    authenticate_user,
    create_password_reset_token,
    create_user,
    get_user_by_email,
    issue_refresh_token,
    reset_password,
    revoke_refresh_token,
    rotate_refresh_token,
)


class TestCreateUser:
    def test_success(self, db: Session):
        payload = SignupRequest(email="new@example.com", password="Secret123!", display_name="New User")
        user = create_user(db, payload)
        assert user.email == "new@example.com"
        assert user.display_name == "New User"
        assert user.avatar_initials == "NU"
        assert user.current_rating == 1200

    def test_duplicate_email_raises(self, db: Session, test_user: User):
        payload = SignupRequest(email=test_user.email, password="Secret123!", display_name="Another")
        with pytest.raises(AuthError, match="already exists"):
            create_user(db, payload)

    def test_avatar_initials_two_parts(self, db: Session):
        payload = SignupRequest(email="a@b.com", password="Secret123!", display_name="John Doe")
        user = create_user(db, payload)
        assert user.avatar_initials == "JD"

    def test_avatar_initials_single_part(self, db: Session):
        payload = SignupRequest(email="a@b.com", password="Secret123!", display_name="Prince")
        user = create_user(db, payload)
        assert user.avatar_initials == "P"

    def test_avatar_initials_single_char_name(self, db: Session):
        payload = SignupRequest(email="a@b.com", password="Secret123!", display_name="X")
        user = create_user(db, payload)
        assert user.avatar_initials == "X"


class TestGetUserByEmail:
    def test_found(self, db: Session, test_user: User):
        assert get_user_by_email(db, test_user.email) is test_user

    def test_not_found(self, db: Session):
        assert get_user_by_email(db, "nobody@example.com") is None


class TestAuthenticateUser:
    def test_success(self, db: Session, test_user: User, test_password: str):
        user = authenticate_user(db, test_user.email, test_password)
        assert user is test_user

    def test_wrong_password(self, db: Session, test_user: User):
        with pytest.raises(AuthError, match="Incorrect"):
            authenticate_user(db, test_user.email, "wrong")

    def test_wrong_email(self, db: Session):
        with pytest.raises(AuthError, match="Incorrect"):
            authenticate_user(db, "wrong@example.com", "any")


class TestIssueRefreshToken:
    def test_creates_row(self, db: Session, test_user: User):
        token = issue_refresh_token(db, test_user)
        assert isinstance(token, str) and len(token) > 20
        rows = db.query(RefreshToken).filter(RefreshToken.user_id == test_user.id).all()
        assert len(rows) == 1
        assert rows[0].revoked_at is None

    def test_multiple_tokens(self, db: Session, test_user: User):
        issue_refresh_token(db, test_user)
        issue_refresh_token(db, test_user)
        rows = db.query(RefreshToken).filter(RefreshToken.user_id == test_user.id).all()
        assert len(rows) == 2


class TestRotateRefreshToken:
    def test_success(self, db: Session, test_user: User):
        old_token = issue_refresh_token(db, test_user)
        user, new_token = rotate_refresh_token(db, old_token)
        assert user.id == test_user.id
        assert new_token != old_token
        old_row = db.query(RefreshToken).filter(RefreshToken.user_id == test_user.id).first()
        assert old_row.revoked_at is not None

    def test_invalid_token_raises(self, db: Session):
        with pytest.raises(AuthError, match="Invalid or expired"):
            rotate_refresh_token(db, "garbage-token")

    def test_reuse_revokes_all(self, db: Session, test_user: User):
        t1 = issue_refresh_token(db, test_user)
        t2 = issue_refresh_token(db, test_user)
        rotate_refresh_token(db, t1)
        with pytest.raises(AuthError, match="reuse detected"):
            rotate_refresh_token(db, t1)
        remaining = db.query(RefreshToken).filter(
            RefreshToken.user_id == test_user.id, RefreshToken.revoked_at.is_(None)
        ).all()
        assert len(remaining) == 0


class TestRevokeRefreshToken:
    def test_revokes_valid(self, db: Session, test_user: User):
        token = issue_refresh_token(db, test_user)
        revoke_refresh_token(db, token)
        row = db.query(RefreshToken).filter(RefreshToken.user_id == test_user.id).first()
        assert row.revoked_at is not None

    def test_noop_on_bogus(self, db: Session):
        revoke_refresh_token(db, "bogus")  # should not raise


class TestCreatePasswordResetToken:
    def test_creates_token(self, db: Session, test_user: User):
        raw = create_password_reset_token(db, test_user.email)
        assert raw is not None
        rows = db.query(PasswordResetToken).filter(PasswordResetToken.user_id == test_user.id).all()
        assert len(rows) == 1
        assert rows[0].used_at is None

    def test_unknown_email_returns_none(self, db: Session):
        assert create_password_reset_token(db, "unknown@example.com") is None

    def test_multiple_tokens(self, db: Session, test_user: User):
        create_password_reset_token(db, test_user.email)
        create_password_reset_token(db, test_user.email)
        rows = db.query(PasswordResetToken).filter(PasswordResetToken.user_id == test_user.id).all()
        assert len(rows) == 2


class TestResetPassword:
    def test_success(self, db: Session, test_user: User, test_password: str):
        raw = create_password_reset_token(db, test_user.email)
        assert raw is not None
        reset_password(db, raw, "NewPass789!")
        db.refresh(test_user)
        from app.core.security import verify_password
        assert verify_password("NewPass789!", test_user.password_hash)

    def test_invalid_token_raises(self, db: Session):
        with pytest.raises(AuthError, match="Invalid or expired"):
            reset_password(db, "bogus-token", "NewPass789!")

    def test_reuse_raises(self, db: Session, test_user: User):
        raw = create_password_reset_token(db, test_user.email)
        assert raw is not None
        reset_password(db, raw, "NewPass789!")
        with pytest.raises(AuthError, match="Invalid or expired"):
            reset_password(db, raw, "AnotherPass1!")
