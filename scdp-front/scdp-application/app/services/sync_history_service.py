"""
Sync History Service
====================
Manages audit logging and execution history for database synchronization runs.

Persists lifecycle states:
- `start_sync`: Records `RUNNING` status with `started_at` timestamp.
- `complete_sync`: Computes execution duration, assigns status (`SUCCESS`, `PARTIAL`, or `FAILED`).
- `fail_sync`: Records failure error details and duration.
- `get_latest_successful_sync_time`: Fetches last successful run timestamp for incremental sync.
- `get_history`: Paginated log retrieval for Admin UI audit views.
"""

import logging
from datetime import datetime
from typing import Optional, Tuple, List, Dict

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.sync_history import SyncHistory, SyncStatus

logger = logging.getLogger(__name__)


class SyncHistoryService:
    """Async service managing sync run history tracking and analytics."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def start_sync(self, table_name: str) -> str:
        """Initialize a new sync run history record. Returns sync history ID."""
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
        """
        Mark sync run as complete and compute statistics.

        Status determination:
        - If `records_failed > 0` and `(records_inserted + records_updated) > 0`: `PARTIAL`
        - If `records_failed > 0` and `(records_inserted + records_updated) == 0`: `FAILED`
        - Otherwise: `SUCCESS`
        """
        result = await self.db.execute(
            select(SyncHistory).where(SyncHistory.id == history_id)
        )
        history = result.scalar_one_or_none()
        if not history:
            raise ValueError(f"Sync history record with id {history_id} not found")

        completed_at = datetime.utcnow()
        duration_ms = int((completed_at - history.started_at).total_seconds() * 1000)

        records_failed = stats.get("records_failed", 0)
        records_inserted = stats.get("records_inserted", 0)
        records_updated = stats.get("records_updated", 0)

        status = SyncStatus.SUCCESS
        if records_failed > 0:
            status = SyncStatus.PARTIAL if (records_inserted + records_updated) > 0 else SyncStatus.FAILED

        history.completed_at = completed_at
        history.status = status
        history.records_read = stats.get("records_read", 0)
        history.records_inserted = records_inserted
        history.records_updated = records_updated
        history.records_failed = records_failed
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
        """Mark sync run as failed with error details."""
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
        """Fetch the timestamp of the last successful/partial sync for incremental syncing."""
        query = (
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
        result = await self.db.execute(query)
        last_sync = result.scalar_one_or_none()
        return last_sync.started_at if last_sync else None

    async def get_history(self, skip: int = 0, take: int = 10) -> Tuple[List[SyncHistory], int]:
        """Retrieve paginated sync history log."""
        count_query = select(func.count()).select_from(SyncHistory)
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = (
            select(SyncHistory)
            .order_by(SyncHistory.started_at.desc())
            .offset(skip)
            .limit(take)
        )
        items_res = await self.db.execute(query)
        items = list(items_res.scalars().all())

        return items, total
