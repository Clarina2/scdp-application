"""
Auth Flow Integration Tests
============================
Tests authentication endpoints:
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- POST /api/v1/auth/password/forgot
"""

import pytest
from fastapi.testclient import TestClient
from app.models.user import User


def test_login_success(client: TestClient, marketer_user: User):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "marketer_test@scdp.com", "password": "password123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "accessToken" in data
    assert data["user"]["email"] == "marketer_test@scdp.com"


def test_login_invalid_password(client: TestClient, marketer_user: User):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "marketer_test@scdp.com", "password": "wrongpassword"},
    )
    assert res.status_code == 401


def test_get_profile(client: TestClient, marketer_headers: dict):
    res = client.get("/api/v1/auth/me", headers=marketer_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "marketer_test@scdp.com"
    assert data["role"] == "MARKETER"


def test_logout(client: TestClient):
    res = client.post("/api/v1/auth/logout")
    assert res.status_code == 200
    assert res.json()["success"] is True


def test_forgot_password_nonexistent_email(client: TestClient):
    res = client.post(
        "/api/v1/auth/password/forgot",
        json={"email": "unknown@example.com"},
    )
    assert res.status_code == 200
    assert "password reset OTP code has been sent" in res.json()["message"]
