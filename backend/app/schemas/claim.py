from uuid import UUID

from pydantic import BaseModel

from app.models.enums import ClaimStatus


class ClaimCreate(BaseModel):
    payroll_id: UUID
    employee_id: UUID
    claimable_balance_id: str


class ClaimUpdate(BaseModel):
    status: ClaimStatus


class ClaimResponse(BaseModel):
    id: UUID
    payroll_id: UUID
    employee_id: UUID
    claimable_balance_id: str
    status: ClaimStatus

    class Config:
        from_attributes = True


class ClaimWithPayrollResponse(ClaimResponse):
    """
    What the employee actually sees for a claim: the claim itself plus
    the payroll's title and the employer's optional message, so a
    note like "Great work this month!" shows up alongside the claim
    it was attached to.
    """
    payroll_title: str | None = None
    payroll_message: str | None = None