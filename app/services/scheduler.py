"""
Background Synchronization Scheduler
====================================
Periodic background service running database synchronization every `SYNC_INTERVAL_MINUTES` (default: 30 minutes).
Uses the same `SynchronizationService` engine to avoid logic duplication.
"""

import asyncio
import logging
from typing import Optional

from app.config import settings
from app.database import AsyncSessionLocal
from app.synchronization.service import SynchronizationService

logger = logging.getLogger(__name__)

_scheduler_task: Optional[asyncio.Task] = None


async def _periodic_sync_loop(interval_seconds: int):
    """Background task loop calling SynchronizationService periodically."""
    logger.info("Background synchronization scheduler loop started (interval: %d seconds).", interval_seconds)
    while True:
        try:
            await asyncio.sleep(interval_seconds)
            logger.info("Triggering scheduled database synchronization run...")
            async with AsyncSessionLocal() as session:
                sync_service = SynchronizationService(session)
                res = await sync_service.run_synchronization()
                logger.info(
                    "Scheduled sync run #%d finished with status: %s (Read: %d, Inserts: %d, Updates: %d)",
                    res["runId"],
                    res["status"],
                    res["overallStats"]["records_read"],
                    res["overallStats"]["records_inserted"],
                    res["overallStats"]["records_updated"],
                )
        except asyncio.CancelledError:
            logger.info("Background synchronization scheduler loop cancelled.")
            break
        except Exception as exc:
            logger.error("Error during scheduled background synchronization: %s", exc, exc_info=True)


def start_scheduler(interval_minutes: int = 30) -> None:
    """Start the periodic background scheduler task."""
    global _scheduler_task
    if _scheduler_task is not None and not _scheduler_task.done():
        logger.warning("Synchronization scheduler is already running.")
        return

    interval_seconds = max(60, interval_minutes * 60)
    _scheduler_task = asyncio.create_task(_periodic_sync_loop(interval_seconds))
    logger.info(f"Started background synchronization scheduler task (interval: {interval_minutes} minutes = {interval_seconds} seconds).")


def stop_scheduler() -> None:
    """Stop the periodic background scheduler task."""
    global _scheduler_task
    if _scheduler_task and not _scheduler_task.done():
        _scheduler_task.cancel()
        logger.info("Background synchronization scheduler task stopped.")
