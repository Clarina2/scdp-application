"""
Receptions, Exits, and Regulations Integration Tests
===================================================
Tests movement query endpoints:
- GET /api/v1/receptions
- GET /api/v1/exits
- GET /api/v1/regulations
"""

import pytest
from fastapi.testclient import TestClient


def test_receptions_unauthorized(client: TestClient):
    res = client.get("/api/v1/receptions/")
    assert res.status_code == 401


def test_receptions_authorized(client: TestClient, marketer_headers: dict):
    res = client.get("/api/v1/receptions/", headers=marketer_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "meta" in data


def test_exits_authorized(client: TestClient, marketer_headers: dict):
    res = client.get("/api/v1/exits/", headers=marketer_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "meta" in data


def test_regulations_authorized(client: TestClient, marketer_headers: dict):
    res = client.get("/api/v1/regulations/", headers=marketer_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "meta" in data
