from uuid import UUID

from pydantic import BaseModel


class AssetCreate(BaseModel):
    name: str
    code: str
    issuer: str | None = None
    decimals: int = 7
    is_native: bool = False
    is_active: bool = True


class AssetUpdate(BaseModel):
    name: str
    issuer: str | None = None
    decimals: int
    is_native: bool
    is_active: bool


class AssetResponse(BaseModel):
    id: UUID

    name: str
    code: str
    issuer: str | None

    decimals: int

    is_native: bool
    is_active: bool

    class Config:
        from_attributes = True