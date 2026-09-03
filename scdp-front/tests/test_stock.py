"""
Stock API Integration Tests
===========================
Tests stock endpoints:
- GET /api/v1/stock/
- GET /api/v1/stock/metadata/regions
- GET /api/v1/stock/metadata/depots
- GET /api/v1/stock/metadata/products
- GET /api/v1/stock/{scdp_id}
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.stock_item import StockItem


@pytest.fixture
async def sample_stock_items(async_db: AsyncSession):
    item1 = StockItem(
        scdp_id="STOCK_001",
        product_code="PROD_STEEL_01",
        product_name="Steel Rods",
        depot_code="DEP_CENTRAL",
        depot_name="Central Hub",
        region_code="REG_CENTER",
        region_name="Central Region",
        available_quantity=500.0,
        status="ACTIVE",
    )
    item2 = StockItem(
        scdp_id="STOCK_002",
        product_code="PROD_COPPER_02",
        product_name="Copper Wire",
        depot_code="DEP_EAST",
        depot_name="East Hub",
        region_code="REG_EAST",
        region_name="Eastern Region",
        available_quantity=250.0,
        status="ACTIVE",
    )
    async_db.add_all([item1, item2])
    await async_db.commit()
    return [item1, item2]


def test_get_stock_unauthorized(client: TestClient):
    res = client.get("/api/v1/stock/")
    assert res.status_code == 401


def test_get_stock_authorized(client: TestClient, marketer_headers: dict, sample_stock_items):
    res = client.get("/api/v1/stock/", headers=marketer_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 2
    assert data["meta"]["total"] == 2


def test_stock_metadata(client: TestClient, marketer_headers: dict, sample_stock_items):
    # Regions
    res = client.get("/api/v1/stock/metadata/regions", headers=marketer_headers)
    assert res.status_code == 200
    regions = res.json()
    assert len(regions) == 2

    # Depots
    res = client.get("/api/v1/stock/metadata/depots", headers=marketer_headers)
    assert res.status_code == 200
    depots = res.json()
    assert len(depots) == 2

    # Products
    res = client.get("/api/v1/stock/metadata/products", headers=marketer_headers)
    assert res.status_code == 200
    products = res.json()
    assert len(products) == 2


def test_get_stock_by_scdp_id(client: TestClient, marketer_headers: dict, sample_stock_items):
    res = client.get("/api/v1/stock/STOCK_001", headers=marketer_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["scdpId"] == "STOCK_001"
    assert data["productName"] == "Steel Rods"
