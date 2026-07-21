from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "verve",
    broker=settings.celery_broker_url or "redis://localhost:6379/0",
    backend=settings.celery_result_backend or "redis://localhost:6379/0",
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_soft_time_limit=300,
    task_time_limit=360,
    task_default_retry_delay=30,
    task_max_retries=3,
)

import app.workers.tasks  # noqa: E402,F401 -- register tasks with the Celery app
