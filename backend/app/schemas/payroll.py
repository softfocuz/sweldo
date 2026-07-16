from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import (
    DistributionType,
    PayrollStatus,
)


class PayrollCreate(BaseModel):
    employer_id: UUID
    employee_id: UUID

    asset_id: UUID

    title: str

    amount: float

    distribution_type: DistributionType

    start_date: datetime

    # Optional — auto-derived from start_date when not supplied.
    # MONTHLY uses next_run to schedule its recurring payouts.
    next_run: datetime | None = None
    day_of_month: int | None = None

    # MILESTONE only: names of the milestones that must all be
    # completed before this payroll is funded.
    milestones: list[str] | None = None

    # Optional short note from the employer, shown to the employee
    # alongside their claim (e.g. "Great work this month!").
    message: str | None = None


class PayrollUpdate(BaseModel):
    title: str

    amount: float

    distribution_type: DistributionType

    status: PayrollStatus

    start_date: datetime


class PayrollResponse(BaseModel):
    id: UUID

    employer_id: UUID
    employee_id: UUID

    asset_id: UUID

    title: str

    amount: float

    distribution_type: DistributionType

    status: PayrollStatus

    stellar_transaction_hash: str | None

    start_date: datetime
    next_run: datetime | None = None
    last_run: datetime | None = None
    day_of_month: int | None = None
    is_active: bool

    message: str | None = None

    class Config:
        from_attributes = True