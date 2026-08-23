"""
Sync Service (Sync Engine)
==========================
Primary synchronization engine for replicating SCDP source data into the application database.

Architecture:
```
SQL Server / BDGSM  -->  SCDP Replica (PostgreSQL)  -->  Sync Engine  -->  scdp_db (PostgreSQL)
```

Flows:
1. `trigger_sync`:
   - Iterates through table configurations defined in `SyncConfigService`.
   - Uses `MockSourceAdapter` (if `SYNC_USE_MOCK=true`) or `ScdpSourceAdapter` (real DB).
   - Performs incremental syncing based on `get_latest_successful_sync_time`.
   - Maps source columns to target model fields (`_map_record`).
   - Performs individual record upserts into PostgreSQL `scdp_db`.
   - Logs stats (`records_read`, `records_inserted`, `records_updated`, `records_failed`).
   - Updates `SyncHistory` log records.

2. `get_history`: Paginated history log query.
3. `get_sync_status`: System configuration and adapter readiness status.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.stock_item import StockItem
from app.services.sync_config import SyncConfigService, TableSyncConfig
from app.services.sync_history_service import SyncHistoryService
from app.services.adapters import SourceAdapter, MockSourceAdapter, ScdpSourceAdapter

logger = logging.getLogger(__name__)


class SyncService:
    """Core database synchronization service."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.sync_config_service = SyncConfigService()
        self.sync_history_service = SyncHistoryService(db)

        self.use_mock: bool = settings.SYNC_USE_MOCK
        self.batch_size: int = settings.SYNC_BATCH_SIZE or 100

        self.adapter: SourceAdapter = (
            MockSourceAdapter() if self.use_mock else ScdpSourceAdapter()
        )

    async def trigger_sync(self) -> Dict[str, Any]:
        """
        Manually trigger database synchronization for all configured tables.

        Returns:
            Dict mapping source table names to their execution stats.
        """
        configs = self.sync_config_service.get_configs()
        results: Dict[str, Any] = {}

        logger.info("Starting synchronization process for %d tables...", len(configs))
        await self.adapter.connect()

        try:
            for config in configs:
                results[config.source_table] = await self._sync_table(config)
        finally:
            await self.adapter.disconnect()

        logger.info("Synchronization process completed.")
        return results

    async def _sync_table(self, config: TableSyncConfig) -> Dict[str, Any]:
        """Synchronize a single configured source table to its target model."""
        logger.info(
            "Starting sync for table: %s -> Model: %s",
            config.source_table,
            config.target_model_name,
        )
        history_id = await self.sync_history_service.start_sync(config.source_table)

        stats = {
            "records_read": 0,
            "records_inserted": 0,
            "records_updated": 0,
            "records_failed": 0,
        }

        try:
            # 1. Fetch timestamp of last successful sync for incremental read
            last_synced_at = (
                await self.sync_history_service.get_latest_successful_sync_time(
                    config.source_table
                )
            )

            # 2. Read records from source adapter
            source_records = await self.adapter.read_records(
                config.source_table, self.batch_size, last_synced_at
            )
            stats["records_read"] = len(source_records)

            logger.info(
                "Read %d records from source table %s",
                len(source_records),
                config.source_table,
            )

            # 3. Process and upsert each record
            for record in source_records:
                try:
                    mapped = self._map_record(record, config)
                    pk_val = mapped[config.primary_key_field]

                    # Check if item exists to accurately track inserted vs updated
                    query = select(StockItem).where(
                        getattr(StockItem, config.primary_key_field) == pk_val
                    )
                    existing_res = await self.db.execute(query)
                    existing = existing_res.scalar_one_or_none()

                    if existing:
                        # Update existing entity attributes
                        for k, v in mapped.items():
                            setattr(existing, k, v)
                        stats["records_updated"] += 1
                    else:
                        # Create new entity
                        new_item = StockItem(**mapped)
                        self.db.add(new_item)
                        stats["records_inserted"] += 1

                    await self.db.commit()
                except Exception as record_err:
                    await self.db.rollback()
                    stats["records_failed"] += 1
                    logger.error(
                        "Failed to sync record for table %s (PK: %s): %s",
                        config.source_table,
                        record.get(config.source_primary_key_col),
                        record_err,
                        exc_info=True,
                    )

            # 4. Record completion
            completed_history = await self.sync_history_service.complete_sync(
                history_id, stats
            )
            logger.info(
                "Completed sync for table: %s. Status: %s. Inserts=%d, Updates=%d, Fails=%d",
                config.source_table,
                completed_history.status.value,
                stats["records_inserted"],
                stats["records_updated"],
                stats["records_failed"],
            )

            return {
                "status": completed_history.status.value,
                "durationMs": completed_history.execution_duration_ms,
                "recordsRead": stats["records_read"],
                "recordsInserted": stats["records_inserted"],
                "recordsUpdated": stats["records_updated"],
                "recordsFailed": stats["records_failed"],
            }

        except Exception as fatal_err:
            logger.error(
                "Fatal error synchronizing table %s: %s",
                config.source_table,
                fatal_err,
                exc_info=True,
            )
            await self.sync_history_service.fail_sync(history_id, str(fatal_err), stats)
            return {
                "status": "FAILED",
                "error": str(fatal_err),
                "recordsRead": stats["records_read"],
                "recordsInserted": stats["records_inserted"],
                "recordsUpdated": stats["records_updated"],
                "recordsFailed": stats["records_failed"],
            }

    def _map_record(self, record: Dict[str, Any], config: TableSyncConfig) -> Dict[str, Any]:
        """Map raw source row dictionary to target model attribute dictionary."""
        target: Dict[str, Any] = {}

        # Primary Key
        pk_val = record.get(config.source_primary_key_col)
        if pk_val is None:
            raise ValueError(
                f"Source record is missing primary key column '{config.source_primary_key_col}'"
            )
        target[config.primary_key_field] = str(pk_val)

        # Mapped Columns
        for target_field, source_col in config.mappings.items():
            val = record.get(source_col)
            if val is not None:
                if target_field in config.date_fields and isinstance(val, str):
                    try:
                        val = datetime.fromisoformat(val.replace("Z", "+00:00"))
                    except Exception:
                        raise ValueError(f"Invalid date format for field '{target_field}': {val}")
                elif target_field in config.decimal_fields and not isinstance(val, (int, float)):
                    try:
                        val = float(val)
                    except Exception:
                        raise ValueError(f"Invalid numeric format for field '{target_field}': {val}")
            else:
                val = None

            target[target_field] = val

        target["raw_data"] = record
        target["last_synced_at"] = datetime.utcnow()
        return target

    async def get_history(self, skip: int = 0, take: int = 10) -> Tuple[List[Any], int]:
        """Get paginated sync history records."""
        return await self.sync_history_service.get_history(skip, take)

    async def get_sync_status(self) -> Dict[str, Any]:
        """Get synchronization engine configuration and operational status."""
        return {
            "useMock": self.use_mock,
            "batchSize": self.batch_size,
            "adapter": "MOCK" if self.use_mock else "REAL SCDP DB",
            "configured": settings.scdp_is_configured if not self.use_mock else True,
        }
