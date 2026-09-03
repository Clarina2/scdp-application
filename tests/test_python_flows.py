import pytest
from fastapi.testclient import TestClient
from app.auth.jwt_handler import create_access_token
from app.models.user import User, Role
from app.common.decorators.current_user import get_current_user


def mock_admin_user():
    return User(
        id="admin-1",
        name="Admin User",
        email="admin@example.com",
        role=Role.ADMIN,
        is_active=True
    )


def test_root_endpoint(client: TestClient):
    """Test API root metadata endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "SCDP Stock Information Platform API"
    assert data["version"] == "1.0"


def test_health_endpoints(client: TestClient):
    """Test health check flow."""
    # General health check
    res = client.get("/api/v1/health/")
    assert res.status_code == 200
    assert res.json()["status"] == "up"

    # SCDP Health check
    res = client.get("/api/v1/health/scdp")
    assert res.status_code == 200
    assert res.json()["details"]["scdp"]["status"] in ["up", "unconfigured"]


def test_unauthenticated_protected_routes(client: TestClient):
    """Test security guard on unauthenticated access."""
    res = client.get("/api/v1/sync/status")
    assert res.status_code == 401

    res = client.get("/api/v1/stock/")
    assert res.status_code == 401


def test_authenticated_sync_status(client: TestClient, admin_headers: dict):
    """Test sync status endpoint with authenticated admin headers."""
    res = client.get("/api/v1/sync/status", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "useMock" in data
    assert "configuredSource" in data
