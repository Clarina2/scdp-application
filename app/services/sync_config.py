"""
Sync Configuration Service
==========================
Defines table mapping configurations between the SCDP source database
and target application database models.

Configuration parameters per table:
- `source_table`: Name of table in SCDP database (e.g. 'SCDP_STOCK_INVENTORY')
- `target_model_name`: Target SQLAlchemy model class name ('StockItem')
- `primary_key_field`: Target field name used as unique identifier ('scdp_id')
- `source_primary_key_col`: Source column name matching primary_key_field ('STOCK_ID')
- `mappings`: Dictionary mapping target field names to source column names
- `date_fields`: Target fields requiring Date parsing
- `decimal_fields`: Target fields requiring Numeric/Decimal parsing
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict

from app.config import settings


@dataclass
class TableSyncConfig:
    """Mapping specification for synchronizing a source table to a target model."""

    source_table: str
    target_model_name: str
    primary_key_field: str
    source_primary_key_col: str
    mappings: Dict[str, str]
    date_fields: List[str] = field(default_factory=list)
    decimal_fields: List[str] = field(default_factory=list)


class SyncConfigService:
    """Provides table synchronization configuration settings."""

    def get_configs(self) -> List[TableSyncConfig]:
        """Get list of active table sync configurations."""
        return [
            TableSyncConfig(
                source_table=settings.SCDP_SYNC_TABLE_STOCK or "SCDP_STOCK_INVENTORY",
                target_model_name="StockItem",
                primary_key_field="scdp_id",
                source_primary_key_col="STOCK_ID",
                mappings={
                    "product_code": "PROD_CODE",
                    "product_name": "PROD_NAME",
                    "depot_code": "DEPOT_CODE",
                    "depot_name": "DEPOT_NAME",
                    "region_code": "REGION_CODE",
                    "region_name": "REGION_NAME",
                    "location_code": "LOC_CODE",
                    "available_quantity": "AVAIL_QTY",
                    "unit_of_measure": "UOM",
                    "deposit_date": "DEP_DATE",
                    "removal_date": "REM_DATE",
                    "status": "STATUS",
                },
                date_fields=["deposit_date", "removal_date"],
                decimal_fields=["available_quantity"],
            )
        ]

    def get_config_for_table(self, source_table: str) -> Optional[TableSyncConfig]:
        """Find sync configuration by source table name."""
        for config in self.get_configs():
            if config.source_table == source_table:
                return config
        return None
