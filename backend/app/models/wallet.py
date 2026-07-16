import uuid
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


from app.models.base import BaseModel


class Wallet(BaseModel):
    __tablename__ = "wallets"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"),
        unique=True,
    )

    public_key: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
    )

    network: Mapped[str] = mapped_column(
        String(20),
        default="TESTNET",
    )

    employee = relationship(
        "Employee",
        back_populates="wallet",
    )