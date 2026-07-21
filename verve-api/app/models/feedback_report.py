import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FeedbackReport(Base):
    __tablename__ = "feedback_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("practice_sessions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    structure_score: Mapped[int] = mapped_column(Integer, nullable=False)
    relevance_score: Mapped[int] = mapped_column(Integer, nullable=False)
    evidence_score: Mapped[int] = mapped_column(Integer, nullable=False)
    persuasion_score: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence_score: Mapped[int] = mapped_column(Integer, nullable=False)
    examples_score: Mapped[int] = mapped_column(Integer, nullable=False)

    strongest_skill: Mapped[str] = mapped_column(Text, nullable=False)
    weakest_skill: Mapped[str] = mapped_column(Text, nullable=False)
    next_focus: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    rating_change: Mapped[int] = mapped_column(Integer, default=0)
    rating_before: Mapped[int] = mapped_column(Integer, default=1200)
    rating_after: Mapped[int] = mapped_column(Integer, default=1200)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
