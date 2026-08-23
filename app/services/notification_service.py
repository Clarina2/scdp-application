"""
Notification Service
====================
Manages in-app notifications for users and roles in the SCDP Stock Information Platform.

Allows creating notifications targetting either a specific user (`user_id`)
or an entire role (`role` e.g. ADMIN or MARKETER). Provides methods to query,
count unread items, and mark notifications as read.
"""

from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from app.models.notification import Notification
from app.models.user import User, Role
from app.common.exceptions.custom import NotFoundException


class NotificationService:
    """Async service for managing in-app user and role notifications."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_notification(
        self,
        title: str,
        message: str,
        user_id: Optional[str] = None,
        role: Optional[Role] = None,
    ) -> Notification:
        """
        Create a new in-app notification.

        Args:
            title: Short subject/title
            message: Body text
            user_id: Specific user recipient ID (optional)
            role: Target role recipient enum (optional)
        """
        notification = Notification(
            user_id=user_id,
            role=role,
            title=title,
            message=message,
            is_read=False,
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def find_all_for_user(
        self,
        user: User,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Notification], int, int]:
        """
        Fetch notifications applicable to a user (direct or role-targeted).

        Returns:
            Tuple[items, unread_count, total_count]
        """
        skip = (page - 1) * limit
        where_clause = or_(
            Notification.user_id == user.id,
            Notification.role == user.role,
        )

        # Count total
        count_query = select(func.count()).select_from(Notification).where(where_clause)
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        # Count unread
        unread_query = (
            select(func.count())
            .select_from(Notification)
            .where(and_(where_clause, Notification.is_read.is_(False)))
        )
        unread_res = await self.db.execute(unread_query)
        unread_count = unread_res.scalar() or 0

        # Query items
        query = (
            select(Notification)
            .where(where_clause)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items_res = await self.db.execute(query)
        items = list(items_res.scalars().all())

        return items, unread_count, total

    async def mark_as_read(self, notification_id: str, user: User) -> Notification:
        """Mark a single notification as read if it belongs to the user or their role."""
        where_clause = and_(
            Notification.id == notification_id,
            or_(
                Notification.user_id == user.id,
                Notification.role == user.role,
            ),
        )
        result = await self.db.execute(select(Notification).where(where_clause))
        notification = result.scalar_one_or_none()

        if not notification:
            raise NotFoundException("Notification not found")

        notification.is_read = True
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def mark_all_as_read(self, user: User) -> dict:
        """Mark all notifications for this user/role as read."""
        from sqlalchemy import update

        where_clause = and_(
            or_(
                Notification.user_id == user.id,
                Notification.role == user.role,
            ),
            Notification.is_read.is_(False),
        )
        stmt = update(Notification).where(where_clause).values(is_read=True)
        await self.db.execute(stmt)
        await self.db.commit()

        return {"success": True, "message": "All notifications marked as read"}
