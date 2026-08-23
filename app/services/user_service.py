"""
User Service
============
Manages User entity database CRUD operations (Marketers and Admins).
"""

import bcrypt
from datetime import datetime
from typing import Optional, List, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.models.user import User, Role
from app.common.exceptions.custom import NotFoundException, ConflictException


class UserService:
    """Async service managing User accounts and Marketer management."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def find_by_id(self, user_id: str) -> Optional[User]:
        """Find user by unique ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def create_marketer(self, name: str, email: str, password: str) -> User:
        """Create a new marketer user."""
        existing = await self.find_by_email(email)
        if existing:
            raise ConflictException("A user with this email already exists")

        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role=Role.MARKETER,
            is_active=True,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def update_last_login(self, user_id: str) -> None:
        """Update user's last login timestamp."""
        user = await self.find_by_id(user_id)
        if user:
            user.last_login_at = datetime.utcnow()
            await self.db.commit()

    async def find_all_marketers(self, skip: int = 0, take: int = 10) -> Tuple[List[User], int]:
        """Get all marketers with pagination."""
        where_clause = and_(User.role == Role.MARKETER)

        count_query = select(func.count()).select_from(User).where(where_clause)
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = (
            select(User)
            .where(where_clause)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(take)
        )
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def update_marketer_status(self, user_id: str, is_active: bool) -> User:
        """Update marketer active status."""
        result = await self.db.execute(
            select(User).where(and_(User.id == user_id, User.role == Role.MARKETER))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("Marketer not found")

        user.is_active = is_active
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def delete_marketer(self, user_id: str) -> None:
        """Delete a marketer."""
        result = await self.db.execute(
            select(User).where(and_(User.id == user_id, User.role == Role.MARKETER))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("Marketer not found")

        await self.db.delete(user)
        await self.db.commit()

    async def update_password(self, user_id: str, new_password: str) -> User:
        """Update user password."""
        user = await self.find_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")

        user.password_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def activate_user(self, user_id: str) -> User:
        """Activate user account."""
        user = await self.find_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")

        user.is_active = True
        await self.db.commit()
        await self.db.refresh(user)

        return user
