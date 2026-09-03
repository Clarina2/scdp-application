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

    # PostgreSQL Target Database
    DATABASE_URL: str = ""
    DATABASE_HOST: Optional[str] = "127.0.0.1"
    DATABASE_PORT: Optional[int] = 5432
    DATABASE_NAME: Optional[str] = "scdp_db"
    DATABASE_USER: Optional[str] = "postgres"
    DATABASE_PASSWORD: Optional[str] = ""
    DATABASE_SCHEMA: str = "scdp"
    DATABASE_SSL: str = "false"

    @property
    def get_database_url(self) -> str:
        """Build DATABASE_URL from components if not set."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"

    # SQL Server SCDP Source Database (BDGSM)
    SCDP_SOURCE_DB_HOST: Optional[str] = None
    SCDP_SOURCE_DB_PORT: int = 1433
    SCDP_SOURCE_DB_NAME: str = "BDGSM"
    SCDP_SOURCE_DB_USER: Optional[str] = None
    SCDP_SOURCE_DB_PASSWORD: Optional[str] = None
    SCDP_SOURCE_DB_SCHEMA: str = "dbo"
    SCDP_SOURCE_DB_DRIVER: str = "ODBC Driver 18 for SQL Server"

    # Backward compatibility fallback env var names for SCDP Source DB
    SCDP_DB_HOST: str = ""
    SCDP_DB_PORT: int = 1433
    SCDP_DB_NAME: str = ""
    SCDP_DB_USER: str = ""
    SCDP_DB_PASSWORD: str = ""
    SCDP_DB_SCHEMA: str = "dbo"

    # JWT
    JWT_SECRET: str = "default-dev-secret-CHANGE-IN-PRODUCTION-min-32-chars"
    JWT_EXPIRES_IN: str = "24h"

    # CORS
    CORS_ORIGIN: str = "http://localhost:5173,http://localhost:5174"

    # Sync
    SYNC_USE_MOCK: bool = True
    SYNC_BATCH_SIZE: int = 100
    SYNC_TIMEOUT_MS: int = 30000

    # Email (SMTP)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None
    SMTP_FROM: str = "SCDP Platform <noreply@scdp.com>"

    # Logging
    LOG_LEVEL: str = "debug"

    # Synchronization
    SYNC_BATCH_SIZE: int = 10000  # Increased from 1000 for better performance with large tables

    # Development
    DEV_SHOW_OTP: bool = True

    # Document Storage
    DOCUMENT_STORAGE_PATH: str = "uploads/stock_documents"
    DOCUMENT_MAX_SIZE_MB: int = 10

    @property
    def source_host(self) -> str:
        return self.SCDP_SOURCE_DB_HOST or self.SCDP_DB_HOST or ""

    @property
    def source_port(self) -> int:
        return self.SCDP_SOURCE_DB_PORT or self.SCDP_DB_PORT or 1433

    @property
    def source_name(self) -> str:
        return self.SCDP_SOURCE_DB_NAME or self.SCDP_DB_NAME or "BDGSM"

    @property
    def source_user(self) -> str:
        return self.SCDP_SOURCE_DB_USER or self.SCDP_DB_USER or ""

    @property
    def source_password(self) -> str:
        return self.SCDP_SOURCE_DB_PASSWORD or self.SCDP_DB_PASSWORD or ""

    @property
    def source_schema(self) -> str:
        return self.SCDP_SOURCE_DB_SCHEMA or self.SCDP_DB_SCHEMA or "dbo"

    @property
    def scdp_is_configured(self) -> bool:
        # For Windows Authentication, user/password can be empty
        return bool(self.source_host and self.source_name)


settings = Settings()
