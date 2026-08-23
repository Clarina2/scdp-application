"""
Notifications Router
====================
API endpoints for managing user in-app notifications.

Endpoints:
- `GET /api/v1/notifications`: List notifications for current user (paginated)
- `PATCH /api/v1/notifications/{id}/read`: Mark specific notification as read
- `PATCH /api/v1/notifications/read-all`: Mark all user notifications as read
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.notification_service import NotificationService
from app.common.decorators.current_user import get_current_user
from app.models.user import User

router = APIRouter()


async def get_notification_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(db)


@router.get("")
@router.get("/")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Get current user in-app notifications (paginated)."""
    items, unread_count, total = await notification_service.find_all_for_user(
        user=current_user,
        page=page,
        limit=limit,
    )

    total_pages = (total + limit - 1) // limit if total > 0 else 0

    return {
        "items": [
            {
                "id": item.id,
                "title": item.title,
                "message": item.message,
                "isRead": item.is_read,
                "createdAt": item.created_at,
            }
            for item in items
        ],
        "unreadCount": unread_count,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages,
            "hasNextPage": page < total_pages,
            "hasPreviousPage": page > 1,
        },
    }


@router.patch("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Mark all notifications for the authenticated user as read."""
    return await notification_service.mark_all_as_read(current_user)


@router.patch("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    notification_service: NotificationService = Depends(get_notification_service),
):
    """Mark a specific notification as read."""
    item = await notification_service.mark_as_read(notification_id, current_user)
    return {
        "id": item.id,
        "title": item.title,
        "message": item.message,
        "isRead": item.is_read,
        "createdAt": item.created_at,
    }
