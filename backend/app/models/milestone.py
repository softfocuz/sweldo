import uuid

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.models.base import BaseModel


class Milestone(BaseModel):
    __tablename__ = "milestones"

    payroll_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("payrolls.id", ondelete="CASCADE"),
    )

    title: Mapped[str] = mapped_column(
        String(200),
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    order_index: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    payroll = relationship(
        "Payroll",
        back_populates="milestones",
    )