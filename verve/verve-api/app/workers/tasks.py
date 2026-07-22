from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from celery import Task
from sqlalchemy.orm import Session as SASession

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.feedback_report import FeedbackReport
from app.models.practice_session import PracticeSession, SessionStatus
from app.models.transcript import Transcript
from app.models.user import User
from app.services.feedback_engine import FeedbackEngine, FeedbackEngineError
from app.services.rating_service import apply_rating
from app.services.storage_service import StorageService
from app.services.transcription_service import TranscriptionError, TranscriptionService
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


class DatabaseTask(Task):
    _db: SASession | None = None

    def after_return(self, *args: object, **kwargs: object) -> None:
        if self._db is not None:
            self._db.close()
            self._db = None


def run_session_pipeline(session_id: str) -> None:
    """Orchestrate the full audio processing pipeline for a session."""
    logger.info("Starting processing pipeline for session %s", session_id)

    db: SASession = SessionLocal()

    try:
        session = db.get(PracticeSession, session_id)
        if session is None:
            logger.error("Session %s not found, aborting", session_id)
            return

        user = db.get(User, session.user_id)
        if user is None:
            logger.error("User %s not found for session %s", session.user_id, session_id)
            return

        # --- Step 1: Download audio ---
        if not session.audio_url:
            logger.error("Session %s has no audio_url, aborting", session_id)
            _fail_session(db, session)
            return

        logger.info("Step 1/7: Downloading audio from %s", session.audio_url)
        session.status = SessionStatus.transcribing
        db.commit()

        try:
            storage = StorageService()
            audio_bytes = storage.download(session.audio_url)
        except Exception as exc:
            logger.exception("Audio download failed for session %s", session_id)
            _fail_session(db, session)
            raise

        # --- Step 2: Transcribe with Whisper ---
        logger.info("Step 2/7: Transcribing audio via Whisper")
        try:
            transcriber = TranscriptionService()
            transcript_text = transcriber.transcribe(audio_bytes)
        except TranscriptionError as exc:
            logger.exception("Transcription failed for session %s", session_id)
            _fail_session(db, session)
            raise

        # --- Step 3: Store transcript ---
        logger.info("Step 3/7: Storing transcript")
        transcript = Transcript(
            session_id=session.id,
            full_text=transcript_text,
            word_count=len(transcript_text.split()),
        )
        db.add(transcript)
        session.status = SessionStatus.analyzing
        db.commit()

        # --- Step 4: Generate AI feedback ---
        logger.info("Step 4/7: Generating communication feedback")
        try:
            engine = FeedbackEngine()
            feedback_data = engine.analyze(
                transcript=transcript_text,
                mode=session.mode.value if hasattr(session.mode, "value") else str(session.mode),
                prompt=session.prompt_text,
            )
        except FeedbackEngineError as exc:
            logger.exception("Feedback generation failed for session %s", session_id)
            _fail_session(db, session)
            raise

        # --- Step 5: Calculate rating ---
        logger.info("Step 5/7: Calculating rating change")
        rating_before = user.current_rating
        rating_after, rating_change = apply_rating(
            rating_before, feedback_data["overall_score"]
        )

        # --- Step 6: Store feedback report ---
        logger.info("Step 6/7: Storing feedback report")

        rich_details = {
            "skills": feedback_data.get("skills", []),
            "timeline": feedback_data.get("timeline", []),
            "transcript_annotations": feedback_data.get("transcript_annotations", []),
            "statistics": feedback_data.get("statistics"),
            "next_challenge": feedback_data.get("next_challenge"),
        }

        report = FeedbackReport(
            session_id=session.id,
            user_id=user.id,
            overall_score=feedback_data["overall_score"],
            structure_score=feedback_data["structure_score"],
            relevance_score=feedback_data["relevance_score"],
            evidence_score=feedback_data["evidence_score"],
            persuasion_score=feedback_data["persuasion_score"],
            confidence_score=feedback_data["confidence_score"],
            examples_score=feedback_data["examples_score"],
            strongest_skill=feedback_data["strongest_skill"],
            weakest_skill=feedback_data["weakest_skill"],
            next_focus=feedback_data["next_focus"],
            summary=feedback_data.get("summary"),
            details_json=rich_details,
            rating_before=rating_before,
            rating_after=rating_after,
            rating_change=rating_change,
        )
        db.add(report)

        user.current_rating = rating_after

        # --- Step 7: Mark session completed ---
        logger.info("Step 7/7: Marking session completed")
        session.status = SessionStatus.completed
        session.completed_at = datetime.now(timezone.utc)

        from app.models.communication_rating import CommunicationRating

        rating_record = CommunicationRating(
            user_id=user.id,
            session_id=session.id,
            rating_before=rating_before,
            rating_after=rating_after,
            rating_change=rating_change,
        )
        db.add(rating_record)

        db.commit()

        from app.services.email_service import send_feedback_ready_email

        send_feedback_ready_email(user.email, session_id)

        logger.info(
            "Pipeline complete for session %s — rating %d → %d (%+d)",
            session_id,
            rating_before,
            rating_after,
            rating_change,
        )

    except Exception:
        db.rollback()
        logger.exception("Pipeline crashed for session %s", session_id)
        raise
    finally:
        db.close()


@celery_app.task(
    base=DatabaseTask,
    bind=True,
    name="process_session",
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 30},
)
def process_session(self: DatabaseTask, session_id: str) -> None:
    """Orchestrate the full audio processing pipeline for a session (delegates to run_session_pipeline)."""
    run_session_pipeline(session_id)


def _fail_session(db: SASession, session: PracticeSession) -> None:
    """Mark session as failed and commit."""
    session.status = SessionStatus.failed
    try:
        db.commit()
    except Exception:
        db.rollback()
