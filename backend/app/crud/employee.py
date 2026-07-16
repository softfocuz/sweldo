from sqlalchemy.orm import Session

from app.models.employee import Employee


class EmployeeCRUD:

    def get_all(self, db: Session):
        return db.query(Employee).all()

    def get(self, db: Session, employee_id):
        return (
            db.query(Employee)
            .filter(Employee.id == employee_id)
            .first()
        )


    def create(self, db: Session, user_id, name):
        employee = Employee(
            user_id=user_id,
            name=name,
        )

        db.add(employee)
        db.commit()
        db.refresh(employee)

        return employee

    def update(self, db: Session, employee: Employee, name):
        employee.name = name

        db.commit()
        db.refresh(employee)

        return employee

    def delete(self, db: Session, employee: Employee):
        db.delete(employee)
        db.commit()

    def get_by_user(self, db: Session, user_id):
        return (
            db.query(Employee)
            .filter(Employee.user_id == user_id)
            .first()
        )


employee_crud = EmployeeCRUD()