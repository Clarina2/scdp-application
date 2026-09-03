"""
Core Synchronization Orchestrator Service
==========================================
Main service orchestrating full & incremental database replication from SQL Server BDGSM
to PostgreSQL scdp_db.

Flow:
1. Initialize global run in `app.synchronization_runs`.
2. Iterate through configured tables in `SYNC_TABLE_REGISTRY`.
3. Extract source rows via `SqlServerSourceAdapter`.
4. Transform data & calculate fingerprints via `DataTransformer`.
5. Validate row integrity via `RowValidator`.
6. Perform idempotent upserts (INSERT missing, compare & UPDATE changed, skip unchanged) via `UpsertEngine`.
7. Log statistics and duration to `app.synchronization_tables`.
8. Complete global run in `app.synchronization_runs`.
"""

import logging
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.synchronization.source.sqlserver import SqlServerSourceAdapter
from app.synchronization.target.postgresql import PostgresqlTargetAdapter
from app.synchronization.mapping import SYNC_TABLE_REGISTRY, DEFAULT_SYNC_ORDER
from app.synchronization.transformation import DataTransformer
from app.synchronization.validation import RowValidator
from app.synchronization.upsert import UpsertEngine
from app.synchronization.history import SyncHistoryLogger

logger = logging.getLogger(__name__)


class SynchronizationService:
    """Core synchronization orchestrator engine."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.source_adapter = SqlServerSourceAdapter()
        self.target_adapter = PostgresqlTargetAdapter(db)
        self.upsert_engine = UpsertEngine(self.target_adapter)
        self.history_logger = SyncHistoryLogger(db)
        self.batch_size = settings.SYNC_BATCH_SIZE or 1000

    async def run_synchronization(
        self,
        selected_tables: Optional[List[str]] = None,
        mode: str = "full",
    ) -> Dict[str, Any]:
        """
        Executes database synchronization for selected or all configured tables.
        Supports mode='full' or mode='incremental'.
        """
        tables_to_sync = selected_tables or DEFAULT_SYNC_ORDER
        results: Dict[str, Any] = {}
        overall_stats = {
            "records_read": 0,
            "records_inserted": 0,
            "records_updated": 0,
            "records_failed": 0,
        }

        run_id = await self.history_logger.start_run()
        logger.info("Starting Synchronization Run #%d for %d tables...", run_id, len(tables_to_sync))

        await self.source_adapter.connect()

        try:
            for table_name in tables_to_sync:
                table_config = SYNC_TABLE_REGISTRY.get(table_name)
                if not table_config or not table_config.get("sync", True):
                    logger.info("Skipping excluded/unconfigured table '%s'", table_name)
                    continue

                table_stats = await self._sync_table(run_id, table_name, table_config)
                results[table_name] = table_stats

                overall_stats["records_read"] += table_stats.get("recordsRead", 0)
                overall_stats["records_inserted"] += table_stats.get("recordsInserted", 0)
                overall_stats["records_updated"] += table_stats.get("recordsUpdated", 0)
                overall_stats["records_failed"] += table_stats.get("recordsFailed", 0)

            completed_run = await self.history_logger.complete_run(run_id, overall_stats)
            logger.info(
                "Completed Synchronization Run #%d. Status: %s. Inserts: %d, Updates: %d, Fails: %d",
                run_id,
                completed_run.status,
                overall_stats["records_inserted"],
                overall_stats["records_updated"],
                overall_stats["records_failed"],
            )

            return {
                "runId": run_id,
                "status": completed_run.status,
                "overallStats": overall_stats,
                "tables": results,
            }
        except Exception as fatal_err:
            logger.error("Fatal error during synchronization run #%d: %s", run_id, fatal_err, exc_info=True)
            await self.db.rollback()
            await self.history_logger.complete_run(run_id, overall_stats, error_message=str(fatal_err))
            raise
        finally:
            await self.source_adapter.disconnect()

    async def _sync_table(
        self,
        run_id: int,
        table_name: str,
        table_config: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Synchronize a single source table to PostgreSQL scdp target."""
        target_schema = table_config["target_schema"]
        target_table = table_config["target_table"]
        target_model = table_config["target_model"]
        identity_type = table_config["identity_type"]
        pk_field = table_config.get("primary_key_field")
        source_key = table_config["source_key"]
        columns = table_config["columns"]
        date_fields = table_config.get("date_fields", [])

        full_target_name = f"{target_schema}.{target_table}"
        table_sync_id = await self.history_logger.start_table_sync(run_id, table_name, full_target_name)

        stats = {
            "records_read": 0,
            "records_inserted": 0,
            "records_updated": 0,
            "records_failed": 0,
        }

        try:
            # Read all records with pagination (limit to 50,000 for performance)
            offset = 0
            all_source_rows = []
            max_records = 100000  # Limit to prevent extremely long sync times
            while len(all_source_rows) < max_records:
                source_rows = await self.source_adapter.read_rows(table_name, limit=self.batch_size, offset=offset)
                if not source_rows:
                    break
                all_source_rows.extend(source_rows)
                offset += len(source_rows)
                logger.info("Read %d rows from source %s (offset: %d, total: %d)", len(source_rows), table_name, offset, len(all_source_rows))
                # If we got fewer rows than the batch size, we've reached the end
                if len(source_rows) < self.batch_size:
                    break
            
            stats["records_read"] = len(all_source_rows)
            logger.info("Total read %d rows from source %s", len(all_source_rows), table_name)

            for row in all_source_rows:
                try:
                    mapped = DataTransformer.transform_row(
                        row, columns, date_fields, source_key, identity_type
                    )
                    RowValidator.validate(mapped, identity_type, pk_field)

                    action, success = await self.upsert_engine.execute_upsert(
                        mapped, target_model, identity_type, pk_field
                    )

                    if action == "INSERT":
                        stats["records_inserted"] += 1
                    elif action == "UPDATE":
                        stats["records_updated"] += 1

                except Exception as row_err:
                    await self.db.rollback()
                    stats["records_failed"] += 1
                    logger.error(
                        "Error processing row in table %s: %s",
                        table_name,
                        row_err,
                        exc_info=True
                    )

            table_sync = await self.history_logger.complete_table_sync(table_sync_id, stats)
            return {
                "status": table_sync.status,
                "recordsRead": stats["records_read"],
                "recordsInserted": stats["records_inserted"],
                "recordsUpdated": stats["records_updated"],
                "recordsFailed": stats["records_failed"],
            }
        except Exception as table_err:
            logger.error("Failed table synchronization for %s: %s", table_name, table_err, exc_info=True)
            await self.db.rollback()
            await self.history_logger.complete_table_sync(table_sync_id, stats, error_message=str(table_err))
            return {
                "status": "FAILED",
                "error": str(table_err),
                "recordsRead": stats["records_read"],
                "recordsInserted": stats["records_inserted"],
                "recordsUpdated": stats["records_updated"],
                "recordsFailed": stats["records_failed"],
            }

    async def get_status(self) -> Dict[str, Any]:
        """Get synchronization engine configuration status."""
        return {
            "useMock": settings.SYNC_USE_MOCK,
            "batchSize": self.batch_size,
            "configuredSource": settings.scdp_is_configured,
            "sourceHost": settings.source_host,
            "sourceDatabase": settings.source_name,
            "targetSchema": settings.DATABASE_SCHEMA or "scdp",
            "tableRegistryCount": len([k for k, v in SYNC_TABLE_REGISTRY.items() if v.get("sync", True)]),
            "activeTables": DEFAULT_SYNC_ORDER,
            "syncOrder": DEFAULT_SYNC_ORDER,
        }
