from __future__ import annotations

import io
import logging
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class StorageError(Exception):
    pass


class StorageService:
    """Abstraction over Cloudinary / S3 for audio file storage.

    Configure provider via settings.storage_provider. In development
    mode files are stored on local disk under /tmp/verve-audio.
    """

    def __init__(self) -> None:
        self.provider = (settings.storage_provider or "local").lower()
        self._local_root = Path("/tmp/verve-audio")

    def upload(
        self, session_id: str, file_bytes: bytes, file_format: str = "webm"
    ) -> str:
        if self.provider == "cloudinary":
            return self._upload_cloudinary(session_id, file_bytes, file_format)
        if self.provider == "s3":
            return self._upload_s3(session_id, file_bytes, file_format)
        return self._upload_local(session_id, file_bytes, file_format)

    def download(self, remote_path: str) -> bytes:
        if self.provider == "cloudinary":
            return self._download_cloudinary(remote_path)
        if self.provider == "s3":
            return self._download_s3(remote_path)
        return self._download_local(remote_path)

    def delete(self, remote_path: str) -> None:
        if self.provider == "cloudinary":
            self._delete_cloudinary(remote_path)
        elif self.provider == "s3":
            self._delete_s3(remote_path)
        else:
            self._delete_local(remote_path)

    # ------------------------------------------------------------------
    # Local filesystem (development / testing)
    # ------------------------------------------------------------------

    def _upload_local(self, session_id: str, file_bytes: bytes, file_format: str) -> str:
        self._local_root.mkdir(parents=True, exist_ok=True)
        path = self._local_root / f"{session_id}.{file_format}"
        path.write_bytes(file_bytes)
        logger.info("Stored audio locally at %s", path)
        return str(path)

    def _download_local(self, remote_path: str) -> bytes:
        return Path(remote_path).read_bytes()

    def _delete_local(self, remote_path: str) -> None:
        Path(remote_path).unlink(missing_ok=True)

    # ------------------------------------------------------------------
    # Cloudinary
    # ------------------------------------------------------------------

    def _upload_cloudinary(
        self, session_id: str, file_bytes: bytes, file_format: str
    ) -> str:
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=settings.cloudinary_cloud_name,
                api_key=settings.cloudinary_api_key,
                api_secret=settings.cloudinary_api_secret,
            )

            result = cloudinary.uploader.upload(
                io.BytesIO(file_bytes),
                public_id=f"audio/{session_id}",
                resource_type="video",
                format=file_format,
            )
            url: str = result["secure_url"]
            logger.info("Uploaded audio to Cloudinary: %s", url)
            return url
        except ImportError:
            raise StorageError("cloudinary package is not installed")
        except Exception as exc:
            logger.exception("Cloudinary upload failed")
            raise StorageError(f"Cloudinary upload failed: {exc}") from exc

    def _download_cloudinary(self, remote_path: str) -> bytes:
        import httpx

        resp = httpx.get(remote_path, timeout=30)
        resp.raise_for_status()
        return resp.content

    def _delete_cloudinary(self, remote_path: str) -> None:
        try:
            import cloudinary.api

            public_id = remote_path.split("/")[-1].rsplit(".", 1)[0]
            cloudinary.api.delete_resources([public_id], resource_type="video")
        except Exception:
            logger.warning("Failed to delete Cloudinary resource %s", remote_path)

    # ------------------------------------------------------------------
    # S3-compatible (MinIO / AWS S3)
    # ------------------------------------------------------------------

    def _upload_s3(self, session_id: str, file_bytes: bytes, file_format: str) -> str:
        try:
            import boto3

            bucket = settings.storage_bucket
            if not bucket:
                raise StorageError("storage_bucket is not configured")

            key = f"audio/{session_id}.{file_format}"
            client = boto3.client(
                "s3",
                aws_access_key_id=settings.storage_access_key,
                aws_secret_access_key=settings.storage_secret_key,
                endpoint_url=settings.s3_endpoint_url,
            )
            client.put_object(Bucket=bucket, Key=key, Body=file_bytes)
            url = f"{settings.s3_public_url or f'https://{bucket}.s3.amazonaws.com'}/{key}"
            logger.info("Uploaded audio to S3: %s", url)
            return url
        except ImportError:
            raise StorageError("boto3 package is not installed")
        except Exception as exc:
            logger.exception("S3 upload failed")
            raise StorageError(f"S3 upload failed: {exc}") from exc

    def _download_s3(self, remote_path: str) -> bytes:
        import httpx

        resp = httpx.get(remote_path, timeout=30)
        resp.raise_for_status()
        return resp.content

    def _delete_s3(self, remote_path: str) -> None:
        try:
            import boto3

            bucket = settings.storage_bucket
            if not bucket:
                return
            key = remote_path.split(f"{bucket}/")[-1] if bucket in remote_path else remote_path
            client = boto3.client(
                "s3",
                aws_access_key_id=settings.storage_access_key,
                aws_secret_access_key=settings.storage_secret_key,
                endpoint_url=settings.s3_endpoint_url,
            )
            client.delete_object(Bucket=bucket, Key=key)
        except Exception:
            logger.warning("Failed to delete S3 object %s", remote_path)
