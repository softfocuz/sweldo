from uuid import UUID

from pydantic import BaseModel

from app.models.enums import TransactionStatus


class TransactionSubmit(BaseModel):
    transaction_hash: str


class TransactionResponse(BaseModel):
    id: UUID
    claim_id: UUID
    stellar_tx_hash: str
    ledger: int
    status: TransactionStatus

    class Config:
        from_attributes = True