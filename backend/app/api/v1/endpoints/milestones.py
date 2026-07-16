from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_employer

from app.crud.milestone import milestone_crud
from app.crud.payroll import payroll_crud

router = APIRouter()


class MilestoneCreate(BaseModel):
    payroll_id: UUID
    title: str
    description: str | None = None


@router.post("/")
def create_milestone(
    data: MilestoneCreate,
    current_user=Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    payroll = payroll_crud.get(
        db,
        data.payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll not found.",
        )

    existing = milestone_crud.get_by_payroll(
        db,
        payroll.id,
    )

    milestone = milestone_crud.create(
        db,
        payroll_id=payroll.id,
        title=data.title,
        description=data.description,
        order_index=len(existing) + 1,
    )

    return milestone


@router.get("/payroll/{payroll_id}")
def list_milestones(
    payroll_id: UUID,
    db: Session = Depends(get_db),
):
    return milestone_crud.get_by_payroll(
        db,
        payroll_id,
    )


@router.post("/{milestone_id}/complete")
def complete_milestone(
    milestone_id: UUID,
    current_user=Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    milestone = milestone_crud.get(
        db,
        milestone_id,
    )

    if milestone is None:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found.",
        )

    milestone_crud.mark_completed(
        db,
        milestone,
    )

    completed = milestone_crud.all_completed(
        db,
        milestone.payroll_id,
    )

    return {
        "message": "Milestone completed.",
        "all_completed": completed,
    }