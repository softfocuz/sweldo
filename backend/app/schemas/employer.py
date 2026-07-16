from uuid import UUID

from pydantic import BaseModel, ConfigDict


class EmployerCreate(BaseModel):
    user_id: UUID
    name: str


class EmployerUpdate(BaseModel):
    name: str


class EmployerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str