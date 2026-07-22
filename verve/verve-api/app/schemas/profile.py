import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ProfileRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    bio: str | None
    job_title: str | None
    company: str | None
    communication_goals: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    bio: str | None = Field(None, max_length=500)
    job_title: str | None = Field(None, max_length=120)
    company: str | None = Field(None, max_length=120)
    communication_goals: str | None = Field(None, max_length=500)


class OnboardingUpdate(BaseModel):
    onboarding_completed: bool
    onboarding_step: int = Field(ge=0, le=5)
