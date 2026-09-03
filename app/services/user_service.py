"""
User Service
============
Manages User entity database CRUD operations (Marketers and Admins).
"""

import bcrypt
from datetime import datetime
from typing import Optional, List, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func

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

    async def create_marketer(self, name: str, email: str, distributor_code: Optional[str] = None, phone: Optional[str] = None) -> User:
        """Create a new marketer user (inactive) and send initial activation OTP."""
        existing = await self.find_by_email(email)
        if existing:
            raise ConflictException("A user with this email already exists")

        # Create inactive marketer with dummy password hash
        import random, string
        rand_str = "".join(random.choices(string.ascii_letters + string.digits, k=16))
        dummy_hash = bcrypt.hashpw(rand_str.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user = User(
            name=name,
            email=email,
            phone=phone,
            password_hash=dummy_hash,
            role=Role.MARKETER,
            distributor_code=distributor_code,
            is_active=False,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # Generate & Send initial OTP for account verification / password setup
        from app.services.otp_service import OtpService, OtpType
        from app.services.email_service import EmailService
        otp_service = OtpService(self.db, email_service=EmailService())
        await otp_service.generate_and_send_otp(email, OtpType.ACCOUNT_VERIFICATION)

        return user

    async def create_stock_gestionnaire(self, name: str, email: str, phone: Optional[str] = None) -> User:
        """Create a new stock gestionnaire user (inactive) and send initial activation OTP."""
        existing = await self.find_by_email(email)
        if existing:
            raise ConflictException("A user with this email already exists")

        import random, string
        rand_str = "".join(random.choices(string.ascii_letters + string.digits, k=16))
        dummy_hash = bcrypt.hashpw(rand_str.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user = User(
            name=name,
            email=email,
            phone=phone,
            password_hash=dummy_hash,
            role=Role.STOCK_GESTIONNAIRE,
            is_active=False,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        from app.services.otp_service import OtpService, OtpType
        from app.services.email_service import EmailService
        otp_service = OtpService(self.db, email_service=EmailService())
        await otp_service.generate_and_send_otp(email, OtpType.ACCOUNT_VERIFICATION)

        return user

    async def update_last_login(self, user_id: str) -> None:
        """Update user's last login timestamp."""
        user = await self.find_by_id(user_id)
        if user:
            user.last_login_at = datetime.utcnow()
            await self.db.commit()

    async def find_all_marketers(self, skip: int = 0, take: int = 10, search: Optional[str] = None) -> Tuple[List[User], int]:
        """Get all marketers with pagination and optional search."""
        conditions = [User.role == Role.MARKETER]
        if search:
            search_pattern = f"%{search}%"
            conditions.append(
                (User.name.ilike(search_pattern)) | (User.email.ilike(search_pattern))
            )
        where_clause = and_(*conditions)

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

    async def find_all_stock_gestionnaires(self, skip: int = 0, take: int = 10, search: Optional[str] = None) -> Tuple[List[User], int]:
        """Get all stock gestionnaires with pagination and optional search."""
        conditions = [User.role == Role.STOCK_GESTIONNAIRE]
        if search:
            search_pattern = f"%{search}%"
            conditions.append(
                (User.name.ilike(search_pattern)) | (User.email.ilike(search_pattern))
            )
        where_clause = and_(*conditions)

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

    async def update_stock_gestionnaire_status(self, user_id: str, is_active: bool) -> User:
        """Update stock gestionnaire active status."""
        result = await self.db.execute(
            select(User).where(and_(User.id == user_id, User.role == Role.STOCK_GESTIONNAIRE))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("Stock Gestionnaire not found")

        user.is_active = is_active
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def delete_stock_gestionnaire(self, user_id: str) -> None:
        """Delete a stock gestionnaire."""
        result = await self.db.execute(
            select(User).where(and_(User.id == user_id, User.role == Role.STOCK_GESTIONNAIRE))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("Stock Gestionnaire not found")

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

    async def create_admin(self, name: str, email: str, password: str) -> User:
        """Create a new admin user with the provided password."""
        existing = await self.find_by_email(email)
        if existing:
            raise ConflictException("A user with this email already exists")

        # Hash the provided password
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role=Role.ADMIN,
            is_active=True,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def create_admin_with_otp(self, name: str, email: str) -> User:
        """Create a new admin user with OTP activation (inactive until activated)."""
        existing = await self.find_by_email(email)
        if existing:
            raise ConflictException("A user with this email already exists")

        # Create inactive admin with temporary password hash
        temp_password = bcrypt.hashpw("TEMP_PASSWORD".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user = User(
            name=name,
            email=email,
            password_hash=temp_password,
            role=Role.ADMIN,
            is_active=False,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def find_all_admins(self, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> tuple[List[User], int]:
        """List all admin users with pagination and search."""
        conditions = [User.role == Role.ADMIN]
        
        if search:
            conditions.append(or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            ))
        
        where_clause = and_(*conditions) if conditions else True
        
        result = await self.db.execute(
            select(User).where(where_clause).order_by(User.created_at.desc()).offset(skip).limit(limit)
        )
        items = list(result.scalars().all())
        
        count_result = await self.db.execute(
            select(func.count()).select_from(User).where(where_clause)
        )
        total = count_result.scalar() or 0
        
        return items, total

    async def update_admin_status(self, user_id: str, is_active: bool) -> User:
        """Update admin active status."""
        result = await self.db.execute(
            select(User).where(and_(User.id == user_id, User.role == Role.ADMIN))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("Admin not found")

        user.is_active = is_active
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def delete_admin(self, user_id: str) -> None:
        """Delete an admin."""
        result = await self.db.execute(
            select(User).where(and_(User.id == user_id, User.role == Role.ADMIN))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise NotFoundException("Admin not found")

        await self.db.delete(user)
        await self.db.commit()
