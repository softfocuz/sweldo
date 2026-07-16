from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_employer

from app.crud.payroll import payroll_crud
from app.crud.claim import claim_crud
from app.crud.milestone import milestone_crud

from app.schemas.payroll import (
    PayrollCreate,
    PayrollResponse,
    PayrollUpdate,
)

from app.models.enums import DistributionType

from app.services.payroll_engine import (
    payroll_engine,
)

from app.schemas.transaction import TransactionSubmit

router = APIRouter()


@router.get(
    "/",
    response_model=list[PayrollResponse],
)
def get_payrolls(
    db: Session = Depends(get_db),
):
    return payroll_crud.get_all(db)


@router.get(
    "/{payroll_id}",
    response_model=PayrollResponse,
)
def get_payroll(
    payroll_id: UUID,
    db: Session = Depends(get_db),
):
    payroll = payroll_crud.get(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll not found.",
        )

    return payroll


@router.post(
    "/",
    response_model=PayrollResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payroll(
    payroll: PayrollCreate,
    current_user=Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    # MONTHLY needs a next_run to ever be picked up by the scheduler.
    # Rather than requiring an extra form field, derive a sensible
    # default from start_date so it works out of the box.
    next_run = payroll.next_run
    day_of_month = payroll.day_of_month

    if payroll.distribution_type == DistributionType.MONTHLY and next_run is None:
        next_run = payroll.start_date

    if (
        payroll.distribution_type == DistributionType.MILESTONE
        and not payroll.milestones
    ):
        raise HTTPException(
            status_code=400,
            detail="Add at least one milestone for a milestone-based payroll.",
        )

    created = payroll_crud.create(
        db,
        payroll.employer_id,
        payroll.employee_id,
        payroll.asset_id,
        payroll.title,
        payroll.amount,
        payroll.distribution_type,
        payroll.start_date,
        next_run=next_run,
        day_of_month=day_of_month,
        message=payroll.message,
    )

    if payroll.distribution_type == DistributionType.MILESTONE:
        for index, title in enumerate(payroll.milestones, start=1):
            milestone_crud.create(
                db,
                payroll_id=created.id,
                title=title,
                order_index=index,
            )

    return created


@router.post("/{payroll_id}/process")
def process_payroll(
    payroll_id: UUID,
    current_user=Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    payroll = payroll_crud.get(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll not found.",
        )

    try:
        return payroll_engine.process(
            db,
            payroll,
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.put(
    "/{payroll_id}",
    response_model=PayrollResponse,
)
def update_payroll(
    payroll_id: UUID,
    payroll_data: PayrollUpdate,
    current_user=Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    payroll = payroll_crud.get(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll not found.",
        )

    return payroll_crud.update(
        db,
        payroll,
        payroll_data.title,
        payroll_data.amount,
        payroll_data.distribution_type,
        payroll_data.status,
        payroll_data.start_date,
    )


@router.delete("/{payroll_id}")
def delete_payroll(
    payroll_id: UUID,
    current_user=Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    payroll = payroll_crud.get(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll not found.",
        )

    payroll_crud.delete(
        db,
        payroll,
    )

    return {
        "message": "Payroll deleted successfully."
    }

@router.post("/{payroll_id}/confirm")
def confirm_transaction(
    payroll_id: UUID,
    data: TransactionSubmit,
    current_user=Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    payroll = payroll_crud.get(
        db,
        payroll_id,
    )

    if payroll is None:
        raise HTTPException(
            status_code=404,
            detail="Payroll not found.",
        )

    existing_claim = claim_crud.get_by_payroll(
        db,
        payroll.id,
    )

    if existing_claim is not None:
        raise HTTPException(
            status_code=400,
            detail=(
                "This payroll already has a claim on record. "
                "Recording a different transaction hash here would "
                "make that claim unrecoverable."
            ),
        )

    payroll_crud.mark_transaction_submitted(
        db,
        payroll,
        data.transaction_hash,
    )

    return {
        "message": "Transaction recorded.",
    }