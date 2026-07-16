from uuid import UUID

from pydantic import BaseModel


class EmployeeCreate(BaseModel):
    user_id: UUID
    name: str


class EmployeeUpdate(BaseModel):
    name: str


class EmployeeResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str

    class Config:
        from_attributes = True