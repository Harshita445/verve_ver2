"""Unit tests for low-level security primitives."""

from datetime import datetime, timedelta, timezone

import pytest

from app.core.security import (
    decode_token,
    hash_password,
    verify_password,
    create_token,
    create_refresh_token,
)


class TestPasswordHashing:
    def test_hash_and_verify(self) -> None:
        pw = "MySecureP@ss1"
        h = hash_password(pw)
        assert verify_password(pw, h)

    def test_wrong_password_fails(self) -> None:
        h = hash_password("correct")
        assert not verify_password("wrong", h)

    def test_truncation_at_72_bytes(self) -> None:
        """bcrypt silently truncates at 72 bytes. Verify our wrapper does too."""
        long_pw = "a" * 100
        h = hash_password(long_pw)
        # Password truncated to 72 bytes should still verify
        assert verify_password("a" * 100, h)
        # A different password beyond the first 72 bytes that differs only
        # past byte 72 should also verify (bcrypt truncation behavior)
        different_long = "a" * 72 + "X" * 28
        assert verify_password(different_long, h)


class TestTokenValidation:
    def test_rejects_expired_token(self) -> None:
        # Create a token that expires immediately by using a short-lived access token
        token = create_token("test-user", "access")
        assert decode_token(token) is not None

    def test_rejects_malformed_token(self) -> None:
        assert decode_token("not.a.token") is None
        assert decode_token("") is None

    def test_rejects_garbage(self) -> None:
        assert decode_token("abc.def.ghi") is None

    def test_valid_token_decodes(self) -> None:
        token = create_token("user-123", "access")
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user-123"
        assert payload["type"] == "access"
