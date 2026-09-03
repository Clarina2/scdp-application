"""
SCDP Source Adapter
===================
Connects to the real SCDP PostgreSQL replica database to read source records.

This adapter is used when `SYNC_USE_MOCK=false`. It connects to the PostgreSQL
database that replicates the actual BDGSM source of truth, using the
`SCDP_DB_*` environment variables.

The adapter is read-only — it never writes to the SCDP source database.

Configuration (from .env):
  SCDP_DB_HOST, SCDP_DB_PORT, SCDP_DB_NAME, SCDP_DB_USER, SCDP_DB_PASSWORD
  SCDP_DB_SCHEMA (default: 'public')

Incremental sync:
  If `last_synced_at` is provided, the query adds a WHERE clause:
    WHERE UPDATED_AT > last_synced_at OR updated_at > last_synced_at
  This allows efficient incremental synchronization.
"""

import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

import asyncpg

from app.config import settings
from app.services.adapters.source_adapter import SourceAdapter

logger = logging.getLogger(__name__)


class ScdpSourceAdapter(SourceAdapter):
    """
    Connects to the PostgreSQL SCDP replica database using asyncpg.
    Read-only: never writes to the SCDP source.
    """

    def __init__(self) -> None:
        self._pool: Optional[asyncpg.Pool] = None

    async def connect(self) -> None:
        """Create asyncpg connection pool to the SCDP source DB."""
        if not settings.scdp_is_configured:
            logger.warning(
                "ScdpSourceAdapter: SCDP credentials not configured. "
                "Running in unconfigured state — reads will return empty."
            )
            return

        try:
            self._pool = await asyncpg.create_pool(
                host=settings.SCDP_DB_HOST,
                port=settings.SCDP_DB_PORT,
                database=settings.SCDP_DB_NAME,
                user=settings.SCDP_DB_USER,
                password=settings.SCDP_DB_PASSWORD,
                min_size=1,
                max_size=5,
            )
            logger.info(
                "ScdpSourceAdapter: connected to %s:%s/%s",
                settings.SCDP_DB_HOST,
                settings.SCDP_DB_PORT,
                settings.SCDP_DB_NAME,
            )
        except Exception as exc:
            logger.error("ScdpSourceAdapter: failed to connect — %s", exc)
            raise

    async def disconnect(self) -> None:
        """Close the asyncpg connection pool."""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("ScdpSourceAdapter: disconnected")

    async def read_records(
        self,
        table_name: str,
        batch_size: int,
        last_synced_at: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Read records from the SCDP source table. Returns empty list if not connected."""
        if not settings.scdp_is_configured or not self._pool:
            logger.warning("ScdpSourceAdapter: not connected — returning empty record set")
            return []

        schema = settings.SCDP_DB_SCHEMA or "public"
        full_table = f'"{schema}"."{table_name}"'

        try:
            async with self._pool.acquire() as conn:
                if last_synced_at:
                    # Incremental: fetch only records updated since last sync
                    query = (
                        f'SELECT * FROM {full_table} '
                        f'WHERE "UPDATED_AT" > $1 OR "updated_at" > $1 '
                        f'ORDER BY "UPDATED_AT" ASC NULLS LAST '
                        f'LIMIT $2'
                    )
                    rows = await conn.fetch(query, last_synced_at, batch_size)
                else:
                    # Full initial load
                    query = f'SELECT * FROM {full_table} LIMIT $1'
                    rows = await conn.fetch(query, batch_size)

                # Convert asyncpg Record objects to plain dicts
                return [dict(row) for row in rows]
        except Exception as exc:
            logger.error(
                "ScdpSourceAdapter: error reading from '%s' — %s", table_name, exc
            )
            raise
