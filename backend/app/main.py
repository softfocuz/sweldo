import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.services.scheduler_service import scheduler_service

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s | %(message)s",
)

logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Sweldo Payroll Backend API",
)

# Global Exception Handlers
register_exception_handlers(app)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routes
app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX,
)

# Root Endpoint
@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to Sweldo API!",
        "version": settings.PROJECT_VERSION,
    }

# Health Check
@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
    }

# Startup
@app.on_event("startup")
def startup():
    logger.info("Starting Sweldo API...")
    scheduler_service.start()
    logger.info("Scheduler started successfully.")

# Shutdown
@app.on_event("shutdown")
def shutdown():
    logger.info("Stopping Sweldo API...")
    scheduler_service.shutdown()
    logger.info("Scheduler stopped.")