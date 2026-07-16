from uuid import UUID

from pydantic import BaseModel


class WalletCreate(BaseModel):
    public_key: str
    network: str = "TESTNET"


class WalletUpdate(BaseModel):
    public_key: str
    network: str


class WalletResponse(BaseModel):
    id: UUID
    employee_id: UUID
    public_key: str
    network: str

    class Config:
        from_attributes = True