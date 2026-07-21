import logging
import tempfile
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.audio_file import AudioFile
from app.models.practice_session import PracticeSession, SessionStatus
from app.models.user import User
from app.schemas.feedback import AudioUploadResponse
from app.services.storage_service import StorageService
from app.workers.tasks import process_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions/{session_id}/audio", tags=["audio"])

settings = get_settings()
MAX_AUDIO_SIZE = settings.max_audio_size_mb * 1024 * 1024
ALLOWED_FORMATS = set(settings.allowed_audio_formats)

# Magic bytes for common audio formats
MAGIC_BYTES: dict[bytes, str] = {
    b"\x1a\x45\xdf\xa3": "webm",           # WebM / Matroska
    b"\x00\x00\x00\x1c\x66\x74\x79\x70": "mp4",  # MP4 (ftyp box)
    b"\xff\xfb": "mp3",                      # MP3 (MPEG-1 Layer 3)
    b"\xff\xf3": "mp3",                      # MP3 (MPEG-2 Layer 3)
    b"\xff\xf2": "mp3",                      # MP3
    b"\x52\x49\x46\x46": "wav",              # WAV (RIFF header)
    b"\x4f\x67\x67\x53": "ogg",              # Ogg Vorbis / Opus
}


def _validate_audio_magic(file_bytes: bytes) -> str | None:
    for magic, fmt in MAGIC_BYTES.items():
        if file_bytes[:len(magic)] == magic:
            return fmt
    return None


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

    # Stream to temp file to check magic bytes and respect size limit
    header = file.file.read(16)
    detected_format = _validate_audio_magic(header)
    if not detected_format:
        logger.warning("Invalid audio magic bytes from user=%s session=%s", current_user.id, session_id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File does not appear to be valid audio",
        )

    total_size = len(header)
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(header)
        while chunk := file.file.read(8192):
            total_size += len(chunk)
            if total_size > MAX_AUDIO_SIZE:
                tmp.close()
                import os
                os.unlink(tmp.name)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File size exceeds {MAX_AUDIO_SIZE // (1024*1024)} MB limit",
                )
            tmp.write(chunk)
        tmp_path = tmp.name

    file_bytes = open(tmp_path, "rb").read()
    import os
    os.unlink(tmp_path)

    file_format = file.filename.rsplit(".", 1)[-1] if file.filename else detected_format

    try:
        storage = StorageService()
        storage_url = storage.upload(str(session_id), file_bytes, file_format)
    except Exception as exc:
        logger.exception("Storage upload failed for session=%s", session_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Storage upload failed: {exc}",
        )

    try:
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
    except Exception as exc:
        db.rollback()
        logger.exception("DB commit failed during audio upload for session=%s", session_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save audio metadata",
        )

    process_session.delay(str(session_id))

    return AudioUploadResponse(
        audio_file_id=audio_file.id,
        storage_url=storage_url,
        session_id=session.id,
    )
