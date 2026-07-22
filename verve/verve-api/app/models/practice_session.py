import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SessionMode(str, enum.Enum):
    freestyle = "freestyle"
    debate = "debate"
    interview = "interview"
    storytelling = "storytelling"


class SessionStatus(str, enum.Enum):
    pending = "pending"
    uploading = "uploading"
    recording = "recording"
    processing = "processing"
    transcribing = "transcribing"
    analyzing = "analyzing"
    completed = "completed"
    failed = "failed"


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mode: Mapped[SessionMode] = mapped_column(
        SAEnum(SessionMode, name="sessionmode"), nullable=False
    )
    prompt_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_format: Mapped[str | None] = mapped_column(String(32), nullable=True)
    debate_side: Mapped[str | None] = mapped_column(String(8), nullable=True)
    hints_enabled: Mapped[bool] = mapped_column(default=False)
    prep_seconds: Mapped[int] = mapped_column(Integer, default=30)
    speak_seconds: Mapped[int] = mapped_column(Integer, default=120)
    status: Mapped[SessionStatus] = mapped_column(
        SAEnum(SessionStatus, name="sessionstatus"),
        nullable=False,
        default=SessionStatus.pending,
    )
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    audio_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
