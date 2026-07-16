import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Employer(BaseModel):
    __tablename__ = "employers"

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
        back_populates="employer",
    )

    payrolls = relationship(
        "Payroll",
        back_populates="employer",
        cascade="all, delete-orphan",
    )