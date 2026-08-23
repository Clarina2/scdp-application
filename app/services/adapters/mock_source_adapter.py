"""
Mock Source Adapter
===================
Returns hardcoded sample data for development and testing.

When `SYNC_USE_MOCK=true` (default), the SyncEngine uses this adapter instead
of connecting to the real SCDP database. This allows local development and
testing without needing real database credentials.

The mock data matches the column names expected by the stock sync config:
STOCK_ID, PROD_CODE, PROD_NAME, DEPOT_CODE, DEPOT_NAME, REGION_CODE,
REGION_NAME, LOC_CODE, AVAIL_QTY, UOM, DEP_DATE, REM_DATE, STATUS, UPDATED_AT
"""

import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.services.adapters.source_adapter import SourceAdapter

logger = logging.getLogger(__name__)


class MockSourceAdapter(SourceAdapter):
    """Returns hardcoded sample stock records for development and testing."""

    MOCK_RECORDS: List[Dict[str, Any]] = [
        {
            "STOCK_ID": "STOCK_001",
            "PROD_CODE": "PROD_STEEL_01",
            "PROD_NAME": "Reinforced Steel Rods 12mm",
            "DEPOT_CODE": "DEP_CENTRAL",
            "DEPOT_NAME": "Central Logistics Hub",
            "REGION_CODE": "REG_CENTER",
            "REGION_NAME": "Central Region",
            "LOC_CODE": "AISLE_A_SEC_3",
            "AVAIL_QTY": 2500.5,
            "UOM": "KG",
            "DEP_DATE": datetime(2026, 8, 1, 8, 0, 0),
            "REM_DATE": None,
            "STATUS": "ACTIVE",
            "UPDATED_AT": datetime(2026, 8, 10, 12, 0, 0),
        },
        {
            "STOCK_ID": "STOCK_002",
            "PROD_CODE": "PROD_COPPER_02",
            "PROD_NAME": "Industrial Copper Cabling",
            "DEPOT_CODE": "DEP_EAST",
            "DEPOT_NAME": "Eastern Regional Depot",
            "REGION_CODE": "REG_EAST",
            "REGION_NAME": "Eastern Region",
            "LOC_CODE": "AISLE_B_SEC_1",
            "AVAIL_QTY": 480.0,
            "UOM": "METER",
            "DEP_DATE": datetime(2026, 8, 5, 9, 30, 0),
            "REM_DATE": None,
            "STATUS": "ACTIVE",
            "UPDATED_AT": datetime(2026, 8, 11, 14, 30, 0),
        },
        {
            "STOCK_ID": "STOCK_003",
            "PROD_CODE": "PROD_CEMENT_03",
            "PROD_NAME": "Portland Cement Bag 50kg",
            "DEPOT_CODE": "DEP_CENTRAL",
            "DEPOT_NAME": "Central Logistics Hub",
            "REGION_CODE": "REG_CENTER",
            "REGION_NAME": "Central Region",
            "LOC_CODE": "AISLE_C_SEC_5",
            "AVAIL_QTY": 120.0,
            "UOM": "BAG",
            "DEP_DATE": datetime(2026, 8, 10, 11, 0, 0),
            "REM_DATE": None,
            "STATUS": "ACTIVE",
            "UPDATED_AT": datetime(2026, 8, 12, 9, 0, 0),
        },
        {
            "STOCK_ID": "STOCK_004",
            "PROD_CODE": "PROD_STEEL_01",
            "PROD_NAME": "Reinforced Steel Rods 12mm",
            "DEPOT_CODE": "DEP_EAST",
            "DEPOT_NAME": "Eastern Regional Depot",
            "REGION_CODE": "REG_EAST",
            "REGION_NAME": "Eastern Region",
            "LOC_CODE": "AISLE_A_SEC_1",
            "AVAIL_QTY": 50.0,
            "UOM": "KG",
            "DEP_DATE": datetime(2026, 8, 12, 14, 0, 0),
            "REM_DATE": None,
            "STATUS": "ACTIVE",
            "UPDATED_AT": datetime(2026, 8, 12, 14, 0, 0),
        },
        {
            "STOCK_ID": "STOCK_005",
            "PROD_CODE": "PROD_ALUMINUM_04",
            "PROD_NAME": "Aluminum Sheets 4x8",
            "DEPOT_CODE": "DEP_WEST",
            "DEPOT_NAME": "Western Storage Facility",
            "REGION_CODE": "REG_WEST",
            "REGION_NAME": "Western Region",
            "LOC_CODE": "AISLE_D_SEC_2",
            "AVAIL_QTY": 35.0,
            "UOM": "SHEET",
            "DEP_DATE": datetime(2026, 8, 13, 10, 0, 0),
            "REM_DATE": datetime(2026, 8, 15, 16, 0, 0),
            "STATUS": "REMOVED",
            "UPDATED_AT": datetime(2026, 8, 15, 16, 0, 0),
        },
    ]

    async def connect(self) -> None:
        logger.info("MockSourceAdapter: connected (simulated)")

    async def disconnect(self) -> None:
        logger.info("MockSourceAdapter: disconnected (simulated)")

    async def read_records(
        self,
        table_name: str,
        batch_size: int,
        last_synced_at: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        logger.info(
            "MockSourceAdapter: reading from '%s' (batch=%d, since=%s)",
            table_name,
            batch_size,
            last_synced_at.isoformat() if last_synced_at else "never",
        )
        if last_synced_at:
            # Incremental: return records updated after last_synced_at
            return [r for r in self.MOCK_RECORDS if r["UPDATED_AT"] > last_synced_at]
        return self.MOCK_RECORDS[:batch_size]
