import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.enums import ClaimStatus


class Claim(BaseModel):
    __tablename__ = "claims"

    payroll_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("payrolls.id", ondelete="CASCADE"),
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"),
    )

    claimable_balance_id: Mapped[str] = mapped_column(
        String(200),
        unique=True,
    )

    status: Mapped[ClaimStatus] = mapped_column(
        Enum(ClaimStatus),
        default=ClaimStatus.PENDING,
    )

    payroll = relationship(
        "Payroll",
        back_populates="claims",
    )

    employee = relationship(
        "Employee",
        back_populates="claims",
    )

    transaction = relationship(
        "Transaction",
        back_populates="claim",
        uselist=False,
        cascade="all, delete-orphan",
    )