from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.crud.asset import asset_crud

from app.schemas.asset import (
    AssetCreate,
    AssetResponse,
    AssetUpdate,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[AssetResponse],
)
def get_assets(
    db: Session = Depends(get_db),
):
    return asset_crud.get_active(db)


@router.get(
    "/{asset_id}",
    response_model=AssetResponse,
)
def get_asset(
    asset_id: UUID,
    db: Session = Depends(get_db),
):
    asset = asset_crud.get(
        db,
        asset_id,
    )

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )

    return asset


@router.post(
    "/",
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db),
):
    return asset_crud.create(
        db,
        name=asset.name,
        code=asset.code,
        issuer=asset.issuer,
        decimals=asset.decimals,
        is_native=asset.is_native,
        is_active=asset.is_active,
    )


@router.put(
    "/{asset_id}",
    response_model=AssetResponse,
)
def update_asset(
    asset_id: UUID,
    asset_data: AssetUpdate,
    db: Session = Depends(get_db),
):
    asset = asset_crud.get(
        db,
        asset_id,
    )

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )

    return asset_crud.update(
        db,
        asset,
        name=asset_data.name,
        issuer=asset_data.issuer,
        decimals=asset_data.decimals,
        is_native=asset_data.is_native,
        is_active=asset_data.is_active,
    )


@router.delete("/{asset_id}")
def delete_asset(
    asset_id: UUID,
    db: Session = Depends(get_db),
):
    asset = asset_crud.get(
        db,
        asset_id,
    )

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )

    asset_crud.delete(
        db,
        asset,
    )

    return {
        "message": "Asset deleted successfully."
    }