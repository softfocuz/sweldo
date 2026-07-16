from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)

from app.models.enums import UserRole
from app.models.user import User


class UserCRUD:

    def create(
        self,
        db: Session,
        email: str,
        password: str,
        role: UserRole,
    ):
        user = User(
            email=email,
            password_hash=hash_password(password),
            role=role,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    def get(
        self,
        db: Session,
        user_id,
    ):
        return (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    def get_by_id(
        self,
        db: Session,
        user_id,
    ):
        return (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    def get_all(
        self,
        db: Session,
    ):
        return db.query(User).all()

    def get_by_email(
        self,
        db: Session,
        email: str,
    ):
        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    def authenticate(
        self,
        db: Session,
        email: str,
        password: str,
    ):
        user = self.get_by_email(
            db,
            email,
        )

        if user is None:
            return None

        if not verify_password(
            password,
            user.password_hash,
        ):
            return None

        return user

    def update(
        self,
        db: Session,
        user: User,
        email: str,
        role: UserRole,
    ):
        user.email = email
        user.role = role

        db.commit()
        db.refresh(user)

        return user

    def delete(
        self,
        db: Session,
        user: User,
    ):
        db.delete(user)
        db.commit()


user_crud = UserCRUD()