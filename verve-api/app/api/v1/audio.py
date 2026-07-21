import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.db.session import get_db
from app.models.audio_file import AudioFile
from app.models.practice_session import PracticeSession, SessionStatus
from app.models.user import User
from app.schemas.feedback import AudioUploadResponse
from app.services.storage_service import StorageService
from app.workers.tasks import process_session

router = APIRouter(prefix="/sessions/{session_id}/audio", tags=["audio"])

MAX_AUDIO_SIZE = 50 * 1024 * 1024
ALLOWED_FORMATS = {"audio/webm", "audio/mp4", "audio/wav", "audio/mpeg", "audio/ogg"}


@router.post("", response_model=AudioUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_audio(
    session_id: uuid.UUID,
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AudioUploadResponse:
    if file.content_type and file.content_type not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format: {file.content_type}. Allowed: {ALLOWED_FORMATS}",
        )

    session = db.get(PracticeSession, session_id)
    if session is None or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.status not in (SessionStatus.pending, SessionStatus.uploading):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Session is in {session.status.value} state; cannot upload audio",
        )

    file_bytes = file.file.read()
    if len(file_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds {MAX_AUDIO_SIZE // (1024*1024)} MB limit",
        )

    file_format = file.filename.rsplit(".", 1)[-1] if file.filename else "webm"

    try:
        storage = StorageService()
        storage_url = storage.upload(str(session_id), file_bytes, file_format)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Storage upload failed: {exc}",
        )

    audio_file = AudioFile(
        session_id=session.id,
        user_id=current_user.id,
        storage_url=storage_url,
        storage_provider=storage.provider,
        file_format=file_format,
        file_size_bytes=len(file_bytes),
    )
    db.add(audio_file)

    session.status = SessionStatus.transcribing
    session.audio_url = storage_url
    db.commit()
    db.refresh(audio_file)

    process_session.delay(str(session_id))

    return AudioUploadResponse(
        audio_file_id=audio_file.id,
        storage_url=storage_url,
        session_id=session.id,
    )
