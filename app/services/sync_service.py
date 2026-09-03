"""
Sync Service Adapter Wrapper
============================
Adapter linking the FastAPI router to the core `SynchronizationService` in `app/synchronization`.
"""

import logging
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.synchronization.service import SynchronizationService
from app.services.sync_history_service import SyncHistoryService
from app.config import settings

logger = logging.getLogger(__name__)


class SyncService:
    """FastAPI service wrapper delegating to SynchronizationService."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.engine = SynchronizationService(db)
        self.sync_history_service = SyncHistoryService(db)

    async def trigger_sync(self, selected_tables: Optional[List[str]] = None) -> Dict[str, Any]:
        """Manually trigger synchronization run."""
        return await self.engine.run_synchronization(selected_tables)

    async def get_history(self, skip: int = 0, take: int = 10) -> Tuple[List[Any], int]:
        """Retrieve paginated sync run history."""
        return await self.sync_history_service.get_history(skip, take)

    async def get_sync_status(self) -> Dict[str, Any]:
        """Get synchronization configuration and status."""
        return await self.engine.get_status()
