from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.employee import employee_crud
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    return employee_crud.get_all(db)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: UUID,
    db: Session = Depends(get_db),
):
    employee = employee_crud.get(db, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee


@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
):
    return employee_crud.create(
        db,
        employee.user_id,
        employee.name,
    )


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: UUID,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
):
    employee = employee_crud.get(db, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee_crud.update(
        db,
        employee,
        employee_data.name,
    )


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: UUID,
    db: Session = Depends(get_db),
):
    employee = employee_crud.get(db, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    employee_crud.delete(db, employee)

    return {"message": "Employee deleted successfully"}