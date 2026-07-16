import uuid
from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Employee(BaseModel):
    __tablename__ = "employees"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="employee",
    )

    wallet = relationship(
        "Wallet",
        back_populates="employee",
        uselist=False,
        cascade="all, delete-orphan",
    )

    payrolls = relationship(
        "Payroll",
        back_populates="employee",
    )

    claims = relationship(
        "Claim",
        back_populates="employee",
        cascade="all, delete-orphan",
    )