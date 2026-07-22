from fastapi import APIRouter

from app.api.v1 import achievements, admin, auth, audio, billing, challenges, goals, history, profile, progress, rankings, reflections, sessions, support, users

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
api_router.include_router(admin.router)
api_router.include_router(billing.router)
api_router.include_router(support.router)
