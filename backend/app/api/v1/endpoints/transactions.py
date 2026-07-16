from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.transaction import transaction_crud
from app.schemas.transaction import TransactionResponse

router = APIRouter()


@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
):
    return transaction_crud.get_all(db)
