from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.logger import logger


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request,
        exc: HTTPException,
    ):
        logger.warning(
            f"{request.method} {request.url.path} -> {exc.detail}"
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request,
        exc: Exception,
    ):
        # Keep the full traceback in the backend logs
        logger.exception(
            f"Unhandled exception during {request.method} {request.url.path}"
        )

        # Friendly messages for common backend errors
        error_message = str(exc).lower()

        if "employee wallet not found" in error_message:
            message = (
                "This employee hasn't connected a Stellar wallet yet. "
                "Please ask the employee to connect their wallet before processing payroll."
            )

        elif "invalid ed25519 public key" in error_message:
            message = (
                "The employee's wallet address is invalid. "
                "Please reconnect the employee's Stellar wallet and try again."
            )

        elif "wallet does not exist" in error_message:
            message = (
                "We couldn't verify the wallet on the Stellar Testnet. "
                "Please check the wallet address and try again."
            )

        elif "connection" in error_message or "timeout" in error_message:
            message = (
                "We're having trouble connecting to the Stellar network right now. "
                "Please try again in a few moments."
            )

        else:
            message = (
                "Something went wrong while processing your request. "
                "Please try again. If the problem continues, contact support."
            )

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": message,
            },
        )