from fastapi import APIRouter

from app.services.stellar import test_connection

router = APIRouter()


@router.get("/ping")
def ping():
    return test_connection()