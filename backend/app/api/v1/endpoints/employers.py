from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud import employer as employer_crud
from app.schemas.employer import (
    EmployerCreate,
    EmployerUpdate,
    EmployerResponse,
)

router = APIRouter()


@router.post(
    "/",
    response_model=EmployerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employer(
    employer: EmployerCreate,
    db: Session = Depends(get_db),
):
    existing = employer_crud.get_by_user_id(
        db,
        employer.user_id,
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Employer already exists for this user.",
        )

    return employer_crud.create(
        db,
        employer.user_id,
        employer.name,
    )


@router.get(
    "/",
    response_model=list[EmployerResponse],
)
def get_employers(
    db: Session = Depends(get_db),
):
    return employer_crud.get_all(db)


@router.get(
    "/{employer_id}",
    response_model=EmployerResponse,
)
def get_employer(
    employer_id: UUID,
    db: Session = Depends(get_db),
):
    employer = employer_crud.get_by_id(
        db,
        employer_id,
    )

    if employer is None:
        raise HTTPException(
            status_code=404,
            detail="Employer not found.",
        )

    return employer


@router.put(
    "/{employer_id}",
    response_model=EmployerResponse,
)
def update_employer(
    employer_id: UUID,
    employer_update: EmployerUpdate,
    db: Session = Depends(get_db),
):
    employer = employer_crud.get_by_id(
        db,
        employer_id,
    )

    if employer is None:
        raise HTTPException(
            status_code=404,
            detail="Employer not found.",
        )

    return employer_crud.update(
        db,
        employer,
        employer_update.name,
    )


@router.delete(
    "/{employer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_employer(
    employer_id: UUID,
    db: Session = Depends(get_db),
):
    employer = employer_crud.get_by_id(
        db,
        employer_id,
    )

    if employer is None:
        raise HTTPException(
            status_code=404,
            detail="Employer not found.",
        )

    employer_crud.delete(
        db,
        employer,
    )