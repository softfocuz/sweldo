import uuid
from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.enums import TransactionStatus


class Transaction(BaseModel):
    __tablename__ = "transactions"

    claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claims.id", ondelete="CASCADE"),
        unique=True,
    )

    stellar_tx_hash: Mapped[str] = mapped_column(
        String(150),
        unique=True,
    )

    ledger: Mapped[int] = mapped_column(
        Integer,
    )

    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus),
    )

    claim = relationship(
        "Claim",
        back_populates="transaction",
    )