"""
Database Seed Script
====================
CLI script to seed initial admin user into the application database.

Usage:
  python -m app.seed
"""

import asyncio
import logging
import bcrypt
from sqlalchemy import select

from app.database import AsyncSessionLocal, engine
from app.models.user import User, Role
from app.models.base import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


async def seed_database() -> None:
    """Create default system administrator if not already existing."""
    logger.info("Initializing database schema if missing...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        admin_email = "admin@scdp.com"
        result = await session.execute(select(User).where(User.email == admin_email))
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            logger.info("Admin user (%s) already exists. Skipping seed.", admin_email)
        else:
            password_hash = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            admin_user = User(
                name="System Administrator",
                email=admin_email,
                password_hash=password_hash,
                role=Role.ADMIN,
                is_active=True,
            )
            session.add(admin_user)
            await session.commit()
            logger.info(
                "Successfully created admin user: %s (Password: admin123)", admin_email
            )

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_database())
