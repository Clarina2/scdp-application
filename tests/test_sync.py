"""
Synchronization Engine Integration Tests
==========================================
Tests Stage 1 sync endpoints:
- POST /api/v1/sync/trigger (trigger Stage 1 sync run for TDEPOT, TPRODUIT, TDISTRIBUTEUR, TSTOCKPHYS)
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
    assert "activeTables" in data
    assert "TDEPOT" in data["activeTables"]


def test_trigger_sync(client: TestClient, admin_headers: dict):
    res = client.post("/api/v1/sync/trigger", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "tables" in data
    tables = data["tables"]
    assert "TDEPOT" in tables
    assert "TPRODUIT" in tables
    assert "TDISTRIBUTEUR" in tables
    assert "TSTOCKPHYS" in tables

    depot_sync = tables["TDEPOT"]
    assert depot_sync["status"] in ["SUCCESS", "PARTIAL"]
    assert depot_sync["recordsInserted"] == 3


def test_sync_history(client: TestClient, admin_headers: dict):
    # Trigger first to populate history
    client.post("/api/v1/sync/trigger", headers=admin_headers)

    res = client.get("/api/v1/sync/history", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    assert data["items"][0]["status"] in ["SUCCESS", "PARTIAL"]
