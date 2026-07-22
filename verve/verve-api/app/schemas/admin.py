import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserAdminOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    display_name: str
    avatar_initials: str
    current_rating: int
    onboarding_completed: bool
    onboarding_step: int
    plan: str
    stripe_customer_id: str | None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateAdmin(BaseModel):
    plan: str | None = None
    is_admin: bool | None = None


class StatsOut(BaseModel):
    total_users: int
    total_sessions: int
    total_feedback_reports: int
    active_users_last_7d: int
    pro_users: int
    free_users: int
