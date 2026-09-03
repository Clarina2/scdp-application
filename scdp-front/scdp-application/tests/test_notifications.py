"""
Notifications Router Integration Tests
======================================
Tests in-app notification endpoints:
- GET /api/v1/notifications
- PATCH /api/v1/notifications/{id}/read
- PATCH /api/v1/notifications/read-all
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.models.user import Role, User


@pytest.fixture
async def sample_notifications(async_db: AsyncSession, marketer_user: User):
    n1 = Notification(
        user_id=marketer_user.id,
        title="Welcome Marketer",
        message="Welcome to the SCDP platform",
        is_read=False,
    )
    n2 = Notification(
        role=Role.MARKETER,
        title="System Notice",
        message="Scheduled maintenance tonight",
        is_read=False,
    )
    async_db.add_all([n1, n2])
    await async_db.commit()
    await async_db.refresh(n1)
    await async_db.refresh(n2)
    return [n1, n2]


def test_get_notifications(client: TestClient, marketer_headers: dict, sample_notifications):
    res = client.get("/api/v1/notifications", headers=marketer_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 2
    assert data["unreadCount"] == 2


def test_mark_notification_as_read(client: TestClient, marketer_headers: dict, sample_notifications):
    n_id = sample_notifications[0].id
    res = client.patch(f"/api/v1/notifications/{n_id}/read", headers=marketer_headers)
    assert res.status_code == 200
    assert res.json()["isRead"] is True


def test_mark_all_notifications_as_read(client: TestClient, marketer_headers: dict, sample_notifications):
    res = client.patch("/api/v1/notifications/read-all", headers=marketer_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Verify unreadCount is now 0
    get_res = client.get("/api/v1/notifications", headers=marketer_headers)
    assert get_res.json()["unreadCount"] == 0
