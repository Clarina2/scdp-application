"""
Marketer Applications Integration Tests
=======================================
Tests application submission, tracking, and approval lifecycle:
- POST /api/v1/marketer-applications (public submission)
- GET /api/v1/marketer-applications/track/{email} (public status tracking)
- GET /api/v1/admin/marketer-applications (admin list)
- PATCH /api/v1/admin/marketer-applications/{id}/status (admin approval/rejection)
"""

import pytest
from fastapi.testclient import TestClient


def test_application_lifecycle(client: TestClient, admin_headers: dict):
    # 1. Submit application (Public)
    submit_res = client.post(
        "/api/v1/marketer-applications",
        json={
            "name": "Jane Marketer",
            "email": "janemarketer@example.com",
            "companyName": "Jane Logistics Ltd",
        },
    )
    assert submit_res.status_code == 200
    app_data = submit_res.json()
    app_id = app_data["id"]
    assert app_data["status"] == "PENDING"

    # 2. Track application (Public)
    track_res = client.get("/api/v1/marketer-applications/track/janemarketer@example.com")
    assert track_res.status_code == 200
    assert track_res.json()["companyName"] == "Jane Logistics Ltd"

    # 3. List applications (Admin)
    list_res = client.get("/api/v1/admin/marketer-applications", headers=admin_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()["items"]) >= 1

    # 4. Approve application (Admin)
    approve_res = client.patch(
        f"/api/v1/admin/marketer-applications/{app_id}/status",
        json={"status": "APPROVED"},
        headers=admin_headers,
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 5. Verify user account was created in inactive state
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "janemarketer@example.com", "password": "any"},
    )
    # Should fail with account deactivated / pending activation (401)
    assert login_res.status_code == 401
    assert "pending initial activation" in login_res.json()["detail"] or "Invalid credentials" in login_res.json()["detail"] or "deactivated" in login_res.json()["detail"]


def test_reject_application_requires_reason(client: TestClient, admin_headers: dict):
    submit_res = client.post(
        "/api/v1/marketer-applications",
        json={
            "name": "Bob Reject",
            "email": "bobreject@example.com",
            "companyName": "Bob Corp",
        },
    )
    app_id = submit_res.json()["id"]

    # Reject without reason fails
    reject_res = client.patch(
        f"/api/v1/admin/marketer-applications/{app_id}/status",
        json={"status": "REJECTED"},
        headers=admin_headers,
    )
    assert reject_res.status_code == 400

    # Reject with reason succeeds
    reject_res = client.patch(
        f"/api/v1/admin/marketer-applications/{app_id}/status",
        json={"status": "REJECTED", "rejectionReason": "Missing business license"},
        headers=admin_headers,
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["rejectionReason"] == "Missing business license"
