"""
Application Configuration
=========================
Environment-based settings management using pydantic-settings.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Allow extra env fields in .env without raising validation errors
    )

    # Application
    APP_NAME: str = "SCDP Stock Information Platform"
    APP_ENV: str = "development"
    APP_PORT: int = 3000
    API_PREFIX: str = "api/v1"

    # Database
    DATABASE_URL: str = ""
    DATABASE_HOST: Optional[str] = None
    DATABASE_PORT: Optional[int] = None
    DATABASE_NAME: Optional[str] = None
    DATABASE_USER: Optional[str] = None
    DATABASE_PASSWORD: Optional[str] = None
    DATABASE_SSL: str = "false"

    # SCDP Source Database (PostgreSQL replica)
    SCDP_DB_HOST: str = ""
    SCDP_DB_PORT: int = 5432
    SCDP_DB_NAME: str = ""
    SCDP_DB_USER: str = ""
    SCDP_DB_PASSWORD: str = ""
    SCDP_DB_SCHEMA: str = "public"

    # Alternative env var names for SCDP Source DB
    SCDP_SOURCE_DB_HOST: Optional[str] = None
    SCDP_SOURCE_DB_PORT: Optional[int] = None
    SCDP_SOURCE_DB_NAME: Optional[str] = None
    SCDP_SOURCE_DB_USER: Optional[str] = None
    SCDP_SOURCE_DB_PASSWORD: Optional[str] = None

    # JWT
    JWT_SECRET: str = "default-dev-secret-CHANGE-IN-PRODUCTION-min-32-chars"
    JWT_EXPIRES_IN: str = "24h"

    # CORS
    CORS_ORIGIN: str = "http://localhost:5173"

    # Sync
    SYNC_USE_MOCK: bool = True
    SYNC_BATCH_SIZE: int = 100
    SYNC_TIMEOUT_MS: int = 30000
    SCDP_SYNC_TABLE_STOCK: str = "SCDP_STOCK_INVENTORY"

    # Email (SMTP)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None
    SMTP_FROM: str = "SCDP Platform <noreply@scdp.com>"

    # Logging
    LOG_LEVEL: str = "debug"

    @property
    def scdp_is_configured(self) -> bool:
        host = self.SCDP_DB_HOST or self.SCDP_SOURCE_DB_HOST
        name = self.SCDP_DB_NAME or self.SCDP_SOURCE_DB_NAME
        user = self.SCDP_DB_USER or self.SCDP_SOURCE_DB_USER
        pwd = self.SCDP_DB_PASSWORD or self.SCDP_SOURCE_DB_PASSWORD
        return bool(host and name and user and pwd)


settings = Settings()
