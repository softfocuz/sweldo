from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.scheduler import (
    scheduler,
)

router = APIRouter()


@router.post("/run")
def run_scheduler(
    db: Session = Depends(get_db),
):
    result = scheduler.run(db)

    return {
        "processed": len(result),
        "jobs": result,
    }