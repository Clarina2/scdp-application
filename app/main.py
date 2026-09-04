"""
SCDP Stock Information Platform API
===================================
Main FastAPI application entry point. Configures lifespan handlers, middlewares,
CORS, exception handling, and includes all API routers.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.models.base import Base
from app.common.exceptions.global_exception import global_exception_handler
from app.common.middleware.response_middleware import response_middleware
from app.routers import (
    auth,
    admin,
    stock,
    health,
    applications,
    sync,
    notifications,
    receptions,
    exits,
    regulations,
    user_settings,
    stock_gestionnaire,
)
from app.services.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - create schemas and tables in PostgreSQL if not present
    try:
        async with engine.begin() as conn:
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS app;"))
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS scdp;"))
            await conn.execute(
                text("""
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
                        CREATE TYPE role AS ENUM ('ADMIN', 'MARKETER', 'STOCK_GESTIONNAIRE');
                    ELSE
                        ALTER TYPE role ADD VALUE IF NOT EXISTS 'STOCK_GESTIONNAIRE';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'syncstatus') THEN
                        CREATE TYPE syncstatus AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketerapplicationstatus') THEN
                        CREATE TYPE marketerapplicationstatus AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'otptype') THEN
                        CREATE TYPE otptype AS ENUM ('ACCOUNT_VERIFICATION', 'PASSWORD_RESET');
                    END IF;
                END $$;
            """)
            )

            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(text("ALTER TABLE scdp.tstsecurite ADD COLUMN IF NOT EXISTS fingerprint VARCHAR(64);"))
            await conn.execute(text("ALTER TABLE scdp.tstkoutil ADD COLUMN IF NOT EXISTS fingerprint VARCHAR(64);"))
            # Ensure otptype enum and otp_type column exist on otps table
            await conn.execute(text("""
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'otptype') THEN
                        CREATE TYPE otptype AS ENUM ('ACCOUNT_VERIFICATION', 'PASSWORD_RESET');
                    END IF;
                END $$;
            """))
            await conn.execute(text("ALTER TABLE otps ADD COLUMN IF NOT EXISTS otp_type otptype;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_otps_otp_type ON otps (otp_type);"))

        # Start periodic sync scheduler task (every 30 mins) if not running in test mode
        if not settings.SYNC_USE_MOCK:
            start_scheduler(interval_minutes=30)
    except Exception as e:
        print(f"Warning: Could not initialize database or scheduler: {e}")
        print("Continuing with application lifecycle...")

    yield

    # Shutdown
    stop_scheduler()
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="REST API endpoints for synchronization, stock querying, marketer management, and authentication.",
    version="1.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

# Custom Response Middleware
app.middleware("http")(response_middleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGIN.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Include routers
app.include_router(auth.router, prefix=f"/{settings.API_PREFIX}/auth", tags=["Authentication"])
app.include_router(admin.router, prefix=f"/{settings.API_PREFIX}/admin", tags=["Admin"])
app.include_router(stock.router, prefix=f"/{settings.API_PREFIX}/stock", tags=["Stock Items"])
app.include_router(receptions.router, prefix=f"/{settings.API_PREFIX}/receptions", tags=["Receptions"])
app.include_router(exits.router, prefix=f"/{settings.API_PREFIX}/exits", tags=["Exits"])
app.include_router(regulations.router, prefix=f"/{settings.API_PREFIX}/regulations", tags=["Regulations"])
app.include_router(health.router, prefix=f"/{settings.API_PREFIX}/health", tags=["Health"])
app.include_router(applications.router, prefix=f"/{settings.API_PREFIX}", tags=["Applications"])
app.include_router(sync.router, prefix=f"/{settings.API_PREFIX}/sync", tags=["Synchronization"])
app.include_router(
    notifications.router,
    prefix=f"/{settings.API_PREFIX}/notifications",
    tags=["Notifications"],
)
app.include_router(user_settings.router, prefix=f"/{settings.API_PREFIX}/user/settings", tags=["User Settings"])
app.include_router(stock_gestionnaire.router, prefix=f"/{settings.API_PREFIX}/stock-gestionnaire", tags=["Stock Gestionnaire"])


@app.get("/")
async def root():
    return {"message": "SCDP Stock Information Platform API", "version": "1.0"}
