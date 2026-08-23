"""
Pytest Configuration & Fixtures
===============================
Provides test fixtures for FastAPI TestClient, database sessions, and authenticated tokens.
"""

import pytest
import bcrypt
from typing import AsyncGenerator
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.base import Base
from app.database import get_db
from app.models.user import User, Role
from app.auth.jwt_handler import create_access_token

# In-memory SQLite async engine for unit testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session", autouse=True)
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def async_db() -> AsyncGenerator[AsyncSession, None]:
    """Create clean in-memory database tables for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
def client(async_db: AsyncSession) -> TestClient:
    """FastAPI TestClient with overridden get_db dependency."""
    async def _override_get_db():
        yield async_db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
async def admin_user(async_db: AsyncSession) -> User:
    """Create admin user fixture."""
    pwd_hash = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(
        name="Admin Test User",
        email="admin_test@scdp.com",
        password_hash=pwd_hash,
        role=Role.ADMIN,
        is_active=True,
    )
    async_db.add(user)
    await async_db.commit()
    await async_db.refresh(user)
    return user


@pytest.fixture
async def marketer_user(async_db: AsyncSession) -> User:
    """Create active marketer user fixture."""
    pwd_hash = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(
        name="Marketer Test User",
        email="marketer_test@scdp.com",
        password_hash=pwd_hash,
        role=Role.MARKETER,
        is_active=True,
    )
    async_db.add(user)
    await async_db.commit()
    await async_db.refresh(user)
    return user


@pytest.fixture
def admin_headers(admin_user: User) -> dict:
    """Authorization headers for Admin user."""
    token = create_access_token({"sub": admin_user.id, "email": admin_user.email, "role": admin_user.role.value})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def marketer_headers(marketer_user: User) -> dict:
    """Authorization headers for Marketer user."""
    token = create_access_token({"sub": marketer_user.id, "email": marketer_user.email, "role": marketer_user.role.value})
    return {"Authorization": f"Bearer {token}"}
