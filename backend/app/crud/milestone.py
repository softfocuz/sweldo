from sqlalchemy.orm import Session

from app.models.milestone import Milestone


class MilestoneCRUD:

    def get_all(
        self,
        db: Session,
    ):
        return db.query(Milestone).all()

    def get(
        self,
        db: Session,
        milestone_id,
    ):
        return (
            db.query(Milestone)
            .filter(
                Milestone.id == milestone_id,
            )
            .first()
        )

    def get_by_payroll(
        self,
        db: Session,
        payroll_id,
    ):
        return (
            db.query(Milestone)
            .filter(
                Milestone.payroll_id == payroll_id,
            )
            .order_by(Milestone.order_index)
            .all()
        )

    def create(
        self,
        db: Session,
        payroll_id,
        title,
        description=None,
        order_index=1,
    ):
        milestone = Milestone(
            payroll_id=payroll_id,
            title=title,
            description=description,
            order_index=order_index,
            completed=False,
        )

        db.add(milestone)
        db.commit()
        db.refresh(milestone)

        return milestone

    def mark_completed(
        self,
        db: Session,
        milestone: Milestone,
    ):
        milestone.completed = True

        db.commit()
        db.refresh(milestone)

        return milestone

    def all_completed(
        self,
        db: Session,
        payroll_id,
    ):
        milestones = self.get_by_payroll(
            db,
            payroll_id,
        )

        if not milestones:
            return False

        return all(
            m.completed
            for m in milestones
        )


milestone_crud = MilestoneCRUD()