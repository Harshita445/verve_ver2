import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings, validate_production_config
from app.core.middleware import RequestIDMiddleware
from app.core.sentry import init_sentry

settings = get_settings()
validate_production_config(settings)

logging.basicConfig(
    level=logging.INFO if settings.environment != "production" else logging.WARNING,
    format="%(levelname)s [%(name)s] %(message)s",
)

init_sentry()

app = FastAPI(title=settings.app_name)

app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
