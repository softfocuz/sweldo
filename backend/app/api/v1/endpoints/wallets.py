from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_employee
from app.core.database import get_db

from app.crud.wallet import wallet_crud

from app.schemas.wallet import (
    WalletCreate,
    WalletResponse,
    WalletUpdate,
)

from app.services.stellar import account_exists

router = APIRouter()


@router.get("/", response_model=list[WalletResponse])
def get_wallets(db: Session = Depends(get_db)):
    return wallet_crud.get_all(db)


@router.get("/{wallet_id}", response_model=WalletResponse)
def get_wallet(
    wallet_id: UUID,
    db: Session = Depends(get_db),
):
    wallet = wallet_crud.get(db, wallet_id)

    if wallet is None:
        raise HTTPException(
            status_code=404,
            detail="Wallet not found.",
        )

    return wallet


@router.post(
    "/",
    response_model=WalletResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_wallet(
    wallet: WalletCreate,
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    wallet.public_key = wallet.public_key.strip()

    if wallet.public_key.startswith("S"):
        raise HTTPException(
            status_code=400,
            detail="Please enter your Stellar PUBLIC wallet address, not your Secret Key.",
        )

    if not wallet.public_key.startswith("G"):
        raise HTTPException(
            status_code=400,
            detail="Invalid Stellar wallet address.",
        )

    if not account_exists(wallet.public_key):
        raise HTTPException(
            status_code=400,
            detail="Wallet does not exist on Stellar Testnet.",
        )

    existing_wallet = wallet_crud.get_by_employee(
        db,
        current_employee.id,
    )

    if existing_wallet:
        # Update existing wallet instead of failing
        return wallet_crud.update(
            db,
            existing_wallet,
            wallet.public_key,
            wallet.network,
        )

    return wallet_crud.create(
        db=db,
        employee_id=current_employee.id,
        public_key=wallet.public_key,
        network=wallet.network,
    )


@router.put("/{wallet_id}", response_model=WalletResponse)
def update_wallet(
    wallet_id: UUID,
    wallet_data: WalletUpdate,
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    wallet = wallet_crud.get(db, wallet_id)

    if wallet is None:
        raise HTTPException(
            status_code=404,
            detail="Wallet not found.",
        )

    if wallet.employee_id != current_employee.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this wallet.",
        )

    return wallet_crud.update(
        db,
        wallet,
        wallet_data.public_key,
        wallet_data.network,
    )


@router.delete("/{wallet_id}")
def delete_wallet(
    wallet_id: UUID,
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    wallet = wallet_crud.get(db, wallet_id)

    if wallet is None:
        raise HTTPException(
            status_code=404,
            detail="Wallet not found.",
        )

    if wallet.employee_id != current_employee.id:
        raise HTTPException(
            status_code=403,
            detail="You do not own this wallet.",
        )

    wallet_crud.delete(db, wallet)

    return {
        "message": "Wallet deleted successfully."
    }