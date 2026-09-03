from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from app.config import settings
from app.models.base import Base
from urllib.parse import quote_plus

import logging

logger = logging.getLogger(__name__)


def build_database_url() -> str:
    """Build database URL from environment variables or explicit DATABASE_URL."""
    # Always build from components to avoid URL parsing issues with special characters
    host = settings.DATABASE_HOST or "127.0.0.1"
    port = settings.DATABASE_PORT or 5432
    name = settings.DATABASE_NAME or "scdp_db"
    user = settings.DATABASE_USER or "postgres"
    password = settings.DATABASE_PASSWORD or ""
    
    # URL-encode password to handle special characters like @ and !
    encoded_password = quote_plus(password) if password else ""
    
    if encoded_password:
        return f"postgresql+asyncpg://{user}:{encoded_password}@{host}:{port}/{name}"
    return f"postgresql+asyncpg://{user}@{host}:{port}/{name}"


engine = create_async_engine(
    build_database_url(),
    echo=settings.LOG_LEVEL == "debug",
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """Dependency for getting async database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database connection, create target schemas, and create tables."""
    try:
        async with engine.begin() as conn:
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS app;"))
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS scdp;"))
            await conn.run_sync(Base.metadata.create_all)
            
            # Ensure fingerprint columns exist on tstsecurite and tstkoutil
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
        logger.info("Database schemas ('app', 'scdp') created and tables initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_db():
    """Close database connection."""
    await engine.dispose()
    logger.info("Database connection closed")
