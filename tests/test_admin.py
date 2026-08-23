"""
Admin Marketer Management Integration Tests
============================================
Tests endpoints:
- POST /api/v1/admin/marketers (create marketer)
- GET /api/v1/admin/marketers (list marketers)
- PATCH /api/v1/admin/marketers/{id}/status (toggle active status)
- DELETE /api/v1/admin/marketers/{id} (delete marketer)
"""

import pytest
from fastapi.testclient import TestClient


def test_create_marketer_admin_only(client: TestClient, admin_headers: dict, marketer_headers: dict):
    payload = {
        "name": "New Marketer",
        "email": "newmarketer@scdp.com",
        "password": "securepassword123",
    }

    # Forbidden for non-admin
    res = client.post("/api/v1/admin/marketers", json=payload, headers=marketer_headers)
    assert res.status_code == 403

    # Success for admin
    res = client.post("/api/v1/admin/marketers", json=payload, headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "newmarketer@scdp.com"
    assert data["role"] == "MARKETER"


def test_list_marketers(client: TestClient, admin_headers: dict, marketer_user):
    res = client.get("/api/v1/admin/marketers?page=1&limit=10", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    assert "meta" in data
    assert data["meta"]["total"] >= 1


def test_update_marketer_status(client: TestClient, admin_headers: dict, marketer_user):
    res = client.patch(
        f"/api/v1/admin/marketers/{marketer_user.id}/status",
        json={"isActive": False},
        headers=admin_headers,
    )
    assert res.status_code == 200
    assert res.json()["is_active"] is False


def test_delete_marketer(client: TestClient, admin_headers: dict, marketer_user):
    res = client.delete(f"/api/v1/admin/marketers/{marketer_user.id}", headers=admin_headers)
    assert res.status_code == 200
