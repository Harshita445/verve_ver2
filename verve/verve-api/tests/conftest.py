import os
os.environ["DATABASE_URL"] = "sqlite://"

import uuid
from collections.abc import Generator
from datetime import datetime, timezone

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.rate_limiter import rate_limiter
from app.core.security import create_token, hash_password, create_refresh_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app as _app
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.password_reset_token import PasswordResetToken
from app.models.goal import Goal
from app.models.practice_session import PracticeSession, SessionMode, SessionStatus
from app.models.achievement import Achievement

TEST_DB_URL = "sqlite://"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


_app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def _clear_rate_limiter() -> None:
    rate_limiter._fallback.clear()


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    for table in reversed(Base.metadata.sorted_tables):
        with engine.connect() as conn:
            conn.execute(table.delete())
            conn.commit()
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest_asyncio.fixture()
async def client() -> AsyncClient:
    transport = ASGITransport(app=_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture()
def test_password() -> str:
    return "TestPass123!"


@pytest.fixture()
def test_email() -> str:
    return "test@example.com"


@pytest.fixture()
def test_display_name() -> str:
    return "Test User"


@pytest.fixture()
def test_user(db: Session, test_password: str, test_email: str, test_display_name: str) -> User:
    user = User(
        id=uuid.uuid4(),
        email=test_email,
        password_hash=hash_password(test_password),
        display_name=test_display_name,
        avatar_initials="TU",
        current_rating=1200,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def test_user2(db: Session) -> User:
    user = User(
        id=uuid.uuid4(),
        email="other@example.com",
        password_hash=hash_password("OtherPass456!"),
        display_name="Other User",
        avatar_initials="OU",
        current_rating=1200,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def access_token(test_user: User) -> str:
    return create_token(str(test_user.id), "access")


@pytest.fixture()
def auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture()
def test_session(db: Session, test_user: User) -> PracticeSession:
    session = PracticeSession(
        id=uuid.uuid4(),
        user_id=test_user.id,
        mode=SessionMode.impromptu,
        prompt_text="Test prompt",
        prep_seconds=30,
        speak_seconds=120,
        status=SessionStatus.pending,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@pytest.fixture()
def test_goal(db: Session, test_user: User) -> Goal:
    goal = Goal(
        id=uuid.uuid4(),
        user_id=test_user.id,
        description="Practice 5 times",
        target_sessions=5,
        current_progress=0,
        achieved=False,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@pytest.fixture()
def test_achievement(db: Session, test_user: User) -> Achievement:
    ach = Achievement(
        id=uuid.uuid4(),
        user_id=test_user.id,
        name="First Session",
        description="Complete your first practice session",
        icon="\U0001f3af",
        unlocked=True,
        unlocked_at=datetime.now(timezone.utc),
    )
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach


@pytest.fixture()
def refresh_token_str(db: Session, test_user: User) -> str:
    from app.services.auth_service import issue_refresh_token
    return issue_refresh_token(db, test_user)
