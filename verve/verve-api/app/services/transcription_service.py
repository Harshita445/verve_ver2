from __future__ import annotations

import io
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class TranscriptionError(Exception):
    pass


class TranscriptionService:
    """Transcribes audio via the OpenAI Whisper API."""

    def __init__(self) -> None:
        self.api_key = settings.openai_api_key

    def transcribe(self, audio_bytes: bytes, filename: str = "audio.webm") -> str:
        if not self.api_key:
            raise TranscriptionError("OpenAI API key is not configured")

        try:
            from openai import OpenAI

            client = OpenAI(api_key=self.api_key)

            file_like = io.BytesIO(audio_bytes)
            file_like.name = filename

            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=file_like,
                response_format="json",
            )

            transcript: str = response.text
            logger.info(
                "Whisper transcription complete (%d chars)", len(transcript)
            )
            return transcript

        except ImportError:
            raise TranscriptionError("openai package is not installed")
        except Exception as exc:
            logger.exception("Whisper transcription failed")
            raise TranscriptionError(f"Whisper transcription failed: {exc}") from exc


def transcribe_audio(audio_bytes: bytes) -> str:
    """Convenience wrapper for one-shot transcription."""
    return TranscriptionService().transcribe(audio_bytes)
