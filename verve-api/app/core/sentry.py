import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)

try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

    HAS_SENTRY = True
except ImportError:
    HAS_SENTRY = False


def init_sentry() -> None:
    settings = get_settings()

    sentry_dsn = getattr(settings, "sentry_dsn", None)
    if not sentry_dsn or not HAS_SENTRY:
        logger.info("Sentry not configured — skipping initialization")
        return

    environment = settings.environment

    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=environment,
        traces_sample_rate=0.1 if environment == "production" else 1.0,
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
        ],
    )
    logger.info("Sentry initialized for environment=%s", environment)
