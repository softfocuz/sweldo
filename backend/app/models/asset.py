from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Asset(BaseModel):
    __tablename__ = "assets"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        unique=True,
    )

    issuer: Mapped[str | None] = mapped_column(
        String(56),
        nullable=True,
    )

    decimals: Mapped[int] = mapped_column(
        Integer,
        default=7,
    )

    is_native: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    payrolls = relationship(
        "Payroll",
        back_populates="asset",
    )