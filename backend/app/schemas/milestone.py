from uuid import UUID

from pydantic import BaseModel


class MilestoneCreate(BaseModel):
    payroll_id: UUID
    title: str
    description: str | None = None
    order_index: int = 1


class MilestoneUpdate(BaseModel):
    title: str
    description: str | None = None
    completed: bool


class MilestoneResponse(BaseModel):
    id: UUID

    payroll_id: UUID

    title: str

    description: str | None

    order_index: int

    completed: bool

    class Config:
        from_attributes = True