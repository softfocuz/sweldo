from sqlalchemy.orm import Session

from app.models.payroll import Payroll
from app.models.enums import PayrollStatus


class PayrollCRUD:

    def get_all(self, db: Session):
        return db.query(Payroll).all()

    def get(self, db: Session, payroll_id):
        return (
            db.query(Payroll)
            .filter(Payroll.id == payroll_id)
            .first()
        )

    def create(
        self,
        db: Session,
        employer_id,
        employee_id,
        asset_id,
        title,
        amount,
        distribution_type,
        start_date,
        next_run=None,
        day_of_month=None,
        milestone_name=None,
        message=None,
    ):
        payroll = Payroll(
            employer_id=employer_id,
            employee_id=employee_id,
            asset_id=asset_id,
            title=title,
            amount=amount,
            distribution_type=distribution_type,
            start_date=start_date,
            status=PayrollStatus.PENDING,
            next_run=next_run,
            day_of_month=day_of_month,
            milestone_name=milestone_name,
            message=message,
        )

        db.add(payroll)
        db.commit()
        db.refresh(payroll)

        return payroll

    def update(
        self,
        db: Session,
        payroll: Payroll,
        title,
        amount,
        distribution_type,
        status,
        start_date,
    ):
        payroll.title = title
        payroll.amount = amount
        payroll.distribution_type = distribution_type
        payroll.status = status
        payroll.start_date = start_date

        db.commit()
        db.refresh(payroll)

        return payroll

    def delete(
        self,
        db: Session,
        payroll: Payroll,
    ):
        db.delete(payroll)
        db.commit()

    def update_transaction_hash(
        self,
        db: Session,
        payroll: Payroll,
        tx_hash: str,
    ):
        payroll.stellar_transaction_hash = tx_hash

        db.commit()
        db.refresh(payroll)

        return payroll

    def mark_transaction_submitted(
        self,
        db: Session,
        payroll: Payroll,
        transaction_hash: str,
    ):
        payroll.status = PayrollStatus.FUNDED
        payroll.stellar_transaction_hash = transaction_hash

        db.commit()
        db.refresh(payroll)

        return payroll

    def mark_completed(
        self,
        db: Session,
        payroll: Payroll,
    ):
        payroll.status = PayrollStatus.COMPLETED

        db.commit()
        db.refresh(payroll)

        return payroll


payroll_crud = PayrollCRUD()