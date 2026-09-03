"""
Sync History Service
====================
Manages audit logging and execution history for database synchronization runs
in `app.synchronization_runs` and `app.synchronization_tables`.
"""

import logging
from datetime import datetime
from typing import Optional, Tuple, List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.sync_history import SyncHistory, SyncStatus
from app.models.sync_run import SynchronizationRun, SynchronizationTable

logger = logging.getLogger(__name__)


class SyncHistoryService:
    """Async service managing sync run history tracking and analytics."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def start_run(self) -> int:
        """Initialize a new global synchronization run in app.synchronization_runs."""
        run = SynchronizationRun(
            started_at=datetime.utcnow(),
            status="RUNNING",
        )
        self.db.add(run)
        await self.db.commit()
        await self.db.refresh(run)
        return run.id

    async def complete_run(
        self,
        run_id: int,
        overall_stats: Dict[str, int],
        error_message: Optional[str] = None,
    ) -> SynchronizationRun:
        """Complete global synchronization run with aggregate statistics."""
        result = await self.db.execute(
            select(SynchronizationRun).where(SynchronizationRun.id == run_id)
        )
        run = result.scalar_one_or_none()
        if not run:
            raise ValueError(f"SynchronizationRun record with id {run_id} not found")

        failed = overall_stats.get("records_failed", 0)
        inserted = overall_stats.get("records_inserted", 0)
        updated = overall_stats.get("records_updated", 0)

        status = "SUCCESS"
        if failed > 0:
            status = "PARTIAL" if (inserted + updated) > 0 else "FAILED"
        if error_message and (inserted + updated == 0):
            status = "FAILED"

        run.completed_at = datetime.utcnow()
        run.status = status
        run.records_read = overall_stats.get("records_read", 0)
        run.records_inserted = inserted
        run.records_updated = updated
        run.records_failed = failed
        run.error_message = error_message

        await self.db.commit()
        await self.db.refresh(run)
        return run

    async def start_table_sync(
        self,
        run_id: int,
        source_table: str,
        target_table: str,
    ) -> int:
        """Start tracking single table sync in app.synchronization_tables."""
        table_sync = SynchronizationTable(
            synchronization_run_id=run_id,
            source_table=source_table,
            target_table=target_table,
            status="RUNNING",
            started_at=datetime.utcnow(),
        )
        self.db.add(table_sync)
        await self.db.commit()
        await self.db.refresh(table_sync)
        return table_sync.id

    async def complete_table_sync(
        self,
        table_sync_id: int,
        stats: Dict[str, int],
        error_message: Optional[str] = None,
    ) -> SynchronizationTable:
        """Complete single table sync tracking."""
        result = await self.db.execute(
            select(SynchronizationTable).where(SynchronizationTable.id == table_sync_id)
        )
        table_sync = result.scalar_one_or_none()
        if not table_sync:
            raise ValueError(f"SynchronizationTable record with id {table_sync_id} not found")

        failed = stats.get("records_failed", 0)
        inserted = stats.get("records_inserted", 0)
        updated = stats.get("records_updated", 0)

        status = "SUCCESS"
        if failed > 0:
            status = "PARTIAL" if (inserted + updated) > 0 else "FAILED"
        if error_message and (inserted + updated == 0):
            status = "FAILED"

        table_sync.completed_at = datetime.utcnow()
        table_sync.status = status
        table_sync.records_read = stats.get("records_read", 0)
        table_sync.records_inserted = inserted
        table_sync.records_updated = updated
        table_sync.records_failed = failed
        table_sync.error_message = error_message

        await self.db.commit()
        await self.db.refresh(table_sync)
        return table_sync

    # --- Legacy methods for backward compatibility ---
    async def start_sync(self, table_name: str) -> str:
        """Legacy start sync."""
        history = SyncHistory(
            table_name=table_name,
            status=SyncStatus.RUNNING,
            started_at=datetime.utcnow(),
        )
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(history)
        return history.id

    async def complete_sync(
        self,
        history_id: str,
        stats: Dict[str, int],
    ) -> SyncHistory:
        """Legacy complete sync."""
        result = await self.db.execute(
            select(SyncHistory).where(SyncHistory.id == history_id)
        )
        history = result.scalar_one_or_none()
        if not history:
            raise ValueError(f"Sync history record with id {history_id} not found")

        completed_at = datetime.utcnow()
        duration_ms = int((completed_at - history.started_at).total_seconds() * 1000)

        failed = stats.get("records_failed", 0)
        inserted = stats.get("records_inserted", 0)
        updated = stats.get("records_updated", 0)

        status = SyncStatus.SUCCESS
        if failed > 0:
            status = SyncStatus.PARTIAL if (inserted + updated) > 0 else SyncStatus.FAILED

        history.completed_at = completed_at
        history.status = status
        history.records_read = stats.get("records_read", 0)
        history.records_inserted = inserted
        history.records_updated = updated
        history.records_failed = failed
        history.execution_duration_ms = duration_ms

        await self.db.commit()
        await self.db.refresh(history)
        return history

    async def fail_sync(
        self,
        history_id: str,
        error_message: str,
        stats: Optional[Dict[str, int]] = None,
    ) -> SyncHistory:
        """Legacy fail sync."""
        result = await self.db.execute(
            select(SyncHistory).where(SyncHistory.id == history_id)
        )
        history = result.scalar_one_or_none()
        if not history:
            raise ValueError(f"Sync history record with id {history_id} not found")

        completed_at = datetime.utcnow()
        duration_ms = int((completed_at - history.started_at).total_seconds() * 1000)

        history.completed_at = completed_at
        history.status = SyncStatus.FAILED
        history.error_message = error_message
        if stats:
            history.records_read = stats.get("records_read", 0)
            history.records_inserted = stats.get("records_inserted", 0)
            history.records_updated = stats.get("records_updated", 0)
            history.records_failed = stats.get("records_failed", 0)
        history.execution_duration_ms = duration_ms

        await self.db.commit()
        await self.db.refresh(history)
        return history

    async def get_latest_successful_sync_time(self, table_name: str) -> Optional[datetime]:
        """Fetch timestamp of last successful sync."""
        query = (
            select(SynchronizationTable)
            .where(
                and_(
                    SynchronizationTable.source_table == table_name,
                    SynchronizationTable.status.in_(["SUCCESS", "PARTIAL"]),
                )
            )
            .order_by(SynchronizationTable.started_at.desc())
            .limit(1)
        )
        result = await self.db.execute(query)
        last_sync = result.scalar_one_or_none()
        if last_sync:
            return last_sync.started_at
        
        # Fallback to legacy SyncHistory table
        query_legacy = (
            select(SyncHistory)
            .where(
                and_(
                    SyncHistory.table_name == table_name,
                    SyncHistory.status.in_([SyncStatus.SUCCESS, SyncStatus.PARTIAL]),
                )
            )
            .order_by(SyncHistory.started_at.desc())
            .limit(1)
        )
        result_legacy = await self.db.execute(query_legacy)
        last_legacy = result_legacy.scalar_one_or_none()
        return last_legacy.started_at if last_legacy else None

    async def get_history(self, skip: int = 0, take: int = 10) -> Tuple[List[Dict[str, Any]], int]:
        """Retrieve paginated sync runs with table breakdown."""
        count_query = select(func.count()).select_from(SynchronizationRun)
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = (
            select(SynchronizationRun)
            .order_by(SynchronizationRun.started_at.desc())
            .offset(skip)
            .limit(take)
        )
        items_res = await self.db.execute(query)
        runs = list(items_res.scalars().all())

        run_dicts = []
        for run in runs:
            # fetch associated table runs
            tables_res = await self.db.execute(
                select(SynchronizationTable).where(
                    SynchronizationTable.synchronization_run_id == run.id
                )
            )
            tables = list(tables_res.scalars().all())
            run_dicts.append({
                "id": run.id,
                "started_at": run.started_at,
                "completed_at": run.completed_at,
                "status": run.status,
                "records_read": run.records_read,
                "records_inserted": run.records_inserted,
                "records_updated": run.records_updated,
                "records_failed": run.records_failed,
                "error_message": run.error_message,
                "created_at": run.created_at,
                "tables": [
                    {
                        "id": t.id,
                        "source_table": t.source_table,
                        "target_table": t.target_table,
                        "status": t.status,
                        "records_read": t.records_read,
                        "records_inserted": t.records_inserted,
                        "records_updated": t.records_updated,
                        "records_failed": t.records_failed,
                        "started_at": t.started_at,
                        "completed_at": t.completed_at,
                        "error_message": t.error_message,
                    }
                    for t in tables
                ]
            })

        return run_dicts, total
