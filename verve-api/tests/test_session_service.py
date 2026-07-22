import uuid

import pytest
from sqlalchemy.orm import Session

from app.models.practice_session import PracticeSession, SessionMode, SessionStatus
from app.models.user import User
from app.schemas.practice_session import PracticeSessionCreate, PracticeSessionUpdate
from app.services.practice_session_service import (
    PracticeSessionError,
    create_session,
    get_session_for_user,
    list_sessions_for_user,
    update_session,
)


class TestCreateSession:
    def test_success(self, db: Session, test_user: User):
        payload = PracticeSessionCreate(mode=SessionMode.debate, prompt_text="Test", prep_seconds=60, speak_seconds=180)
        session = create_session(db, test_user, payload)
        assert session.user_id == test_user.id
        assert session.mode == SessionMode.debate
        assert session.prompt_text == "Test"
        assert session.prep_seconds == 60
        assert session.speak_seconds == 180
        assert session.status == SessionStatus.pending

    def test_defaults(self, db: Session, test_user: User):
        payload = PracticeSessionCreate(mode=SessionMode.impromptu)
        session = create_session(db, test_user, payload)
        assert session.prep_seconds == 30
        assert session.speak_seconds == 120


class TestGetSessionForUser:
    def test_own_session(self, db: Session, test_user: User, test_session: PracticeSession):
        session = get_session_for_user(db, test_user, test_session.id)
        assert session.id == test_session.id

    def test_other_users_session(self, db: Session, test_user: User, test_user2: User, test_session: PracticeSession):
        with pytest.raises(PracticeSessionError, match="not found"):
            get_session_for_user(db, test_user2, test_session.id)

    def test_nonexistent(self, db: Session, test_user: User):
        with pytest.raises(PracticeSessionError, match="not found"):
            get_session_for_user(db, test_user, uuid.uuid4())


class TestListSessions:
    def test_returns_own(self, db: Session, test_user: User, test_session: PracticeSession):
        sessions, total = list_sessions_for_user(db, test_user)
        assert total == 1
        assert sessions[0].id == test_session.id

    def test_empty_for_other(self, db: Session, test_user2: User):
        sessions, total = list_sessions_for_user(db, test_user2)
        assert total == 0
        assert sessions == []

    def test_pagination(self, db: Session, test_user: User):
        for i in range(5):
            db.add(PracticeSession(user_id=test_user.id, mode=SessionMode.impromptu))
        db.commit()
        sessions, total = list_sessions_for_user(db, test_user, skip=0, limit=3)
        assert total == 5
        assert len(sessions) == 3


class TestUpdateSession:
    def test_update_status(self, db: Session, test_user: User, test_session: PracticeSession):
        payload = PracticeSessionUpdate(status=SessionStatus.recording)
        session = update_session(db, test_user, test_session.id, payload)
        assert session.status == SessionStatus.recording

    def test_complete_sets_completed_at(self, db: Session, test_user: User, test_session: PracticeSession):
        payload = PracticeSessionUpdate(status=SessionStatus.completed)
        session = update_session(db, test_user, test_session.id, payload)
        assert session.completed_at is not None
        assert session.status == SessionStatus.completed

    def test_other_user_cannot_update(self, db: Session, test_user2: User, test_session: PracticeSession):
        payload = PracticeSessionUpdate(status=SessionStatus.recording)
        with pytest.raises(PracticeSessionError, match="not found"):
            update_session(db, test_user2, test_session.id, payload)

    def test_update_duration(self, db: Session, test_user: User, test_session: PracticeSession):
        payload = PracticeSessionUpdate(duration_seconds=90)
        session = update_session(db, test_user, test_session.id, payload)
        assert session.duration_seconds == 90

    def test_update_audio_url(self, db: Session, test_user: User, test_session: PracticeSession):
        payload = PracticeSessionUpdate(audio_url="https://storage.example.com/audio.webm")
        session = update_session(db, test_user, test_session.id, payload)
        assert session.audio_url == "https://storage.example.com/audio.webm"
