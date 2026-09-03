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
from app.routers import auth, admin, stock, health, applications, sync, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - create enum types and tables in PostgreSQL if not present
    try:
        async with engine.begin() as conn:
            await conn.execute(
                text("""
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
                        CREATE TYPE role AS ENUM ('ADMIN', 'MARKETER');
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

            # Then create tables
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
        print("Continuing with existing schema...")
    yield
    # Shutdown
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
    allow_origins=[settings.CORS_ORIGIN],
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
app.include_router(health.router, prefix=f"/{settings.API_PREFIX}/health", tags=["Health"])
app.include_router(applications.router, prefix=f"/{settings.API_PREFIX}", tags=["Applications"])
app.include_router(sync.router, prefix=f"/{settings.API_PREFIX}/sync", tags=["Synchronization"])
app.include_router(
    notifications.router,
    prefix=f"/{settings.API_PREFIX}/notifications",
    tags=["Notifications"],
)


@app.get("/")
async def root():
    return {"message": "SCDP Stock Information Platform API", "version": "1.0"}
