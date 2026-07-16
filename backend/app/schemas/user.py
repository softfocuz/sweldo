from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.models.enums import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole


class UserUpdate(BaseModel):
    email: EmailStr
    role: UserRole


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True