import uuid

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Boolean,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.models.base import BaseModel
from app.models.enums import (
    DistributionType,
    PayrollStatus,
)


class Payroll(BaseModel):
    __tablename__ = "payrolls"

    employer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employers.id"),
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employees.id"),
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assets.id"),
    )

    title: Mapped[str] = mapped_column(
        String(200),
    )

    amount: Mapped[float] = mapped_column(
        Numeric(18, 7),
    )

    distribution_type: Mapped[DistributionType] = mapped_column(
        Enum(DistributionType),
    )

    status: Mapped[PayrollStatus] = mapped_column(
        Enum(PayrollStatus),
        default=PayrollStatus.PENDING,
    )

    stellar_transaction_hash: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # Scheduling
    start_date: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
    )

    next_run: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_run: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    day_of_month: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    milestone_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    message: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    #
    # Relationships
    #

    employer = relationship(
        "Employer",
        back_populates="payrolls",
    )

    employee = relationship(
        "Employee",
        back_populates="payrolls",
    )

    asset = relationship(
        "Asset",
        back_populates="payrolls",
    )

    claims = relationship(
        "Claim",
        back_populates="payroll",
        cascade="all, delete-orphan",
    )

    milestones = relationship(
        "Milestone",
        back_populates="payroll",
        cascade="all, delete-orphan",
    )