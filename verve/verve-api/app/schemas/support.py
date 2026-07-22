from pydantic import BaseModel, EmailStr, Field


class SupportTicketCreate(BaseModel):
    email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)


class SupportTicketOut(BaseModel):
    id: int
    email: str
    subject: str
    message: str

    class Config:
        from_attributes = True
