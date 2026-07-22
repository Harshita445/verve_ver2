from fastapi import APIRouter

from app.api.v1 import auth, audio, history, profile, progress, rankings, reflections, sessions, users
from app.api.v1 import achievements, challenges, goals

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(sessions.router)
api_router.include_router(audio.router)
api_router.include_router(history.router)
api_router.include_router(profile.router)
api_router.include_router(reflections.router)
api_router.include_router(rankings.router)
api_router.include_router(progress.router)
api_router.include_router(goals.router)
api_router.include_router(achievements.router)
api_router.include_router(challenges.router)
