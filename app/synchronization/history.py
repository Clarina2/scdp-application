"""
Synchronization Execution History Logger Module
===============================================
Manages audit history records in `app.synchronization_runs` and `app.synchronization_tables`.
"""

import logging
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.sync_run import SynchronizationRun, SynchronizationTable

logger = logging.getLogger(__name__)


class SyncHistoryLogger:
    """Manages creation and updates of synchronization run logs in `app` schema."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def start_run(self) -> int:
        """Create global SynchronizationRun."""
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
        """Complete global SynchronizationRun."""
        result = await self.db.execute(
            select(SynchronizationRun).where(SynchronizationRun.id == run_id)
        )
        run = result.scalar_one_or_none()
        if not run:
            raise ValueError(f"SynchronizationRun #{run_id} not found")

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
        """Start single table sync log in app.synchronization_tables."""
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
        """Complete single table sync log."""
        result = await self.db.execute(
            select(SynchronizationTable).where(SynchronizationTable.id == table_sync_id)
        )
        table_sync = result.scalar_one_or_none()
        if not table_sync:
            raise ValueError(f"SynchronizationTable #{table_sync_id} not found")

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
