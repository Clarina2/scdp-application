"""
Synchronization Engine Integration Tests
==========================================
Tests sync endpoints:
- POST /api/v1/sync/trigger (trigger sync run using MockSourceAdapter)
- GET /api/v1/sync/history (get execution log)
- GET /api/v1/sync/status (get configuration status)
"""

import pytest
from fastapi.testclient import TestClient


def test_sync_status(client: TestClient, admin_headers: dict):
    res = client.get("/api/v1/sync/status", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "useMock" in data
    assert "batchSize" in data
    assert "adapter" in data


def test_trigger_sync(client: TestClient, admin_headers: dict):
    res = client.post("/api/v1/sync/trigger", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "SCDP_STOCK_INVENTORY" in data
    stock_sync = data["SCDP_STOCK_INVENTORY"]
    assert stock_sync["status"] in ["SUCCESS", "PARTIAL"]
    assert stock_sync["recordsRead"] == 5
    assert stock_sync["recordsInserted"] == 5


def test_sync_history(client: TestClient, admin_headers: dict):
    # Trigger first to populate history
    client.post("/api/v1/sync/trigger", headers=admin_headers)

    res = client.get("/api/v1/sync/history", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    assert data["items"][0]["tableName"] == "SCDP_STOCK_INVENTORY"
