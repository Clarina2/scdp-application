from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings
from app.models.base import Base
import logging

logger = logging.getLogger(__name__)


def build_database_url() -> str:
    """Build database URL from environment variables or explicit DATABASE_URL."""
    if settings.DATABASE_URL:
        # Handle prisma+postgres:// prefix and ensure async driver
        url = settings.DATABASE_URL.replace("prisma+postgres://", "postgresql+asyncpg://")
        url = url.replace("postgresql://", "postgresql+asyncpg://")
        return url
    
    # Build from individual components
    host = settings.DATABASE_HOST or "localhost"
    port = settings.DATABASE_PORT or 5432
    name = settings.DATABASE_NAME or "scdp_db"
    user = settings.DATABASE_USER or "postgres"
    password = settings.DATABASE_PASSWORD or ""
    
    if password:
        return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"
    return f"postgresql+asyncpg://{user}@{host}:{port}/{name}"


# Create async engine
engine = create_async_engine(
    build_database_url(),
    echo=settings.LOG_LEVEL == "debug",
    pool_pre_ping=True,
)

# Create async session factory
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
    """Initialize database connection and create tables."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connection established and tables created")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_db():
    """Close database connection."""
    await engine.dispose()
    logger.info("Database connection closed")
