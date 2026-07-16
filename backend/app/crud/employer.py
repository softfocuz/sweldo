from uuid import UUID

from sqlalchemy.orm import Session

from app.models.employer import Employer


def create(
    db: Session,
    user_id: UUID,
    name: str,
):
    employer = Employer(
        user_id=user_id,
        name=name,
    )

    db.add(employer)
    db.commit()
    db.refresh(employer)

    return employer


def get_all(db: Session):
    return db.query(Employer).all()


def get_by_id(
    db: Session,
    employer_id: UUID,
):
    return (
        db.query(Employer)
        .filter(Employer.id == employer_id)
        .first()
    )


def get_by_user_id(
    db: Session,
    user_id: UUID,
):
    return (
        db.query(Employer)
        .filter(Employer.user_id == user_id)
        .first()
    )


def update(
    db: Session,
    employer: Employer,
    name: str,
):
    employer.name = name

    db.commit()
    db.refresh(employer)

    return employer


def delete(
    db: Session,
    employer: Employer,
):
    db.delete(employer)
    db.commit()