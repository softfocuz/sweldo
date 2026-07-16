from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str
    PROJECT_VERSION: str

    API_V1_PREFIX: str

    DATABASE_URL: str

    FRONTEND_URL: str

    DEBUG: bool = False

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    STELLAR_HORIZON_URL: str
    STELLAR_NETWORK_PASSPHRASE: str
    STELLAR_SECRET_KEY: str

    PLATFORM_PUBLIC_KEY: str

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        case_sensitive=True,
    )

settings = Settings()

