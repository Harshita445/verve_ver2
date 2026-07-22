import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.communication_rating import CommunicationRating
from app.models.feedback_report import FeedbackReport
from app.models.practice_session import PracticeSession, SessionStatus
from app.models.transcript import Transcript
from app.models.user import User
from app.schemas.feedback import (
    NextChallenge,
    ProgressDelta,
    SessionResultRead,
    SessionStatistics,
    SessionStatusRead,
    SkillDetail,
    TimelineEntry,
    TranscriptAnnotation,
)
from app.schemas.practice_session import (
    PracticeSessionCreate,
    PracticeSessionListRead,
    PracticeSessionRead,
    PracticeSessionUpdate,
    PracticeSessionStartResponse,
)
from app.services.practice_session_service import (
    PracticeSessionError,
    count_sessions_this_week,
    create_session,
    get_session_for_user,
    list_sessions_for_user,
    update_session,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])

settings = get_settings()


def _check_weekly_cap(db: Session, user: User) -> None:
    count, oldest_at = count_sessions_this_week(db, user.id)
    if count >= settings.weekly_session_limit:
        resets_at = (oldest_at + timedelta(days=7)) if oldest_at else (datetime.now(timezone.utc) + timedelta(days=7))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Weekly practice limit reached — resets on a rolling 7-day basis.",
                "resets_at": resets_at.isoformat(),
            },
        )


@router.post("", response_model=PracticeSessionRead, status_code=status.HTTP_201_CREATED)
def create_practice_session(
    payload: PracticeSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionRead:
    _check_weekly_cap(db, current_user)
    return create_session(db, current_user, payload)


@router.post("/start", response_model=PracticeSessionStartResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    payload: PracticeSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionStartResponse:
    _check_weekly_cap(db, current_user)
    session = create_session(db, current_user, payload)
    return PracticeSessionStartResponse(session_id=session.id, status=session.status.value)


@router.get("", response_model=PracticeSessionListRead)
def read_sessions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionListRead:
    sessions, total = list_sessions_for_user(db, current_user, skip, limit)
    return PracticeSessionListRead(sessions=sessions, total=total)


@router.get("/{session_id}", response_model=PracticeSessionRead)
def read_practice_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionRead:
    try:
        return get_session_for_user(db, current_user, session_id)
    except PracticeSessionError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{session_id}/status", response_model=SessionStatusRead)
def read_session_status(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionStatusRead:
    try:
        session = get_session_for_user(db, current_user, session_id)
    except PracticeSessionError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return SessionStatusRead(
        id=session.id,
        status=session.status.value,
        duration_seconds=session.duration_seconds,
        audio_url=session.audio_url,
    )


@router.get("/{session_id}/result", response_model=SessionResultRead)
def read_session_result(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SessionResultRead:
    try:
        session = get_session_for_user(db, current_user, session_id)
    except PracticeSessionError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    feedback = (
        db.query(FeedbackReport)
        .filter(FeedbackReport.session_id == session.id)
        .first()
    )
    transcript = (
        db.query(Transcript)
        .filter(Transcript.session_id == session.id)
        .first()
    )

    # Parse rich feedback details from JSON
    if feedback and feedback.details_json:
        details = feedback.details_json
        skills = [SkillDetail(**s) for s in details.get("skills", [])]
        timeline = [TimelineEntry(**t) for t in details.get("timeline", [])]
        annotations = [
            TranscriptAnnotation(**a) for a in details.get("transcript_annotations", [])
        ]
        stats = SessionStatistics(**details["statistics"]) if details.get("statistics") else None
        next_challenge = NextChallenge(**details["next_challenge"]) if details.get("next_challenge") else None
    else:
        skills = []
        timeline = []
        annotations = []
        stats = None
        next_challenge = None

    # Compute progress deltas vs previous completed session
    progress_deltas: list[ProgressDelta] = []
    if feedback:
        prev_session = (
            db.query(PracticeSession)
            .filter(
                PracticeSession.user_id == current_user.id,
                PracticeSession.status == SessionStatus.completed,
                PracticeSession.completed_at < session.created_at,
            )
            .order_by(PracticeSession.completed_at.desc())
            .first()
        )
        if prev_session:
            prev_feedback = (
                db.query(FeedbackReport)
                .filter(FeedbackReport.session_id == prev_session.id)
                .first()
            )
            if prev_feedback:
                skill_fields = [
                    ("Structure", "structure_score"),
                    ("Relevance", "relevance_score"),
                    ("Evidence", "evidence_score"),
                    ("Persuasion", "persuasion_score"),
                    ("Confidence", "confidence_score"),
                    ("Examples", "examples_score"),
                ]
                for label, field in skill_fields:
                    current_val = getattr(feedback, field)
                    prev_val = getattr(prev_feedback, field)
                    diff = current_val - prev_val
                    if diff != 0:
                        progress_deltas.append(ProgressDelta(skill_name=label, change=diff))

    # Build read model with rich nested data
    feedback_read = None
    if feedback:
        feedback_read = type(
            "FeedbackReportReadFromOrm",
            (),
            {
                "id": feedback.id,
                "session_id": feedback.session_id,
                "overall_score": feedback.overall_score,
                "structure_score": feedback.structure_score,
                "relevance_score": feedback.relevance_score,
                "evidence_score": feedback.evidence_score,
                "persuasion_score": feedback.persuasion_score,
                "confidence_score": feedback.confidence_score,
                "examples_score": feedback.examples_score,
                "skills": skills,
                "timeline": timeline,
                "transcript_annotations": annotations,
                "statistics": stats,
                "next_challenge": next_challenge,
                "strongest_skill": feedback.strongest_skill,
                "weakest_skill": feedback.weakest_skill,
                "next_focus": feedback.next_focus,
                "summary": feedback.summary,
                "rating_before": feedback.rating_before,
                "rating_after": feedback.rating_after,
                "rating_change": feedback.rating_change,
                "created_at": feedback.created_at,
            },
        )()

    return SessionResultRead(
        session_id=session.id,
        status=session.status.value,
        feedback=feedback_read,
        transcript_text=transcript.full_text if transcript else None,
        progress_deltas=progress_deltas,
    )


@router.patch("/{session_id}", response_model=PracticeSessionRead)
def update_practice_session(
    session_id: uuid.UUID,
    payload: PracticeSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PracticeSessionRead:
    try:
        return update_session(db, current_user, session_id, payload)
    except PracticeSessionError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
