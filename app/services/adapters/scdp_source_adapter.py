"""
SCDP Source Adapter (SQL Server BDGSM Master)
==============================================
Connects to the SQL Server BDGSM source database to read records.

Configuration (from .env):
  SCDP_SOURCE_DB_HOST, SCDP_SOURCE_DB_PORT, SCDP_SOURCE_DB_NAME,
  SCDP_SOURCE_DB_USER, SCDP_SOURCE_DB_PASSWORD, SCDP_SOURCE_DB_SCHEMA,
  SCDP_SOURCE_DB_DRIVER

The adapter is read-only — it never writes to the SCDP source database.
"""

import logging
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.config import settings
from app.services.adapters.source_adapter import SourceAdapter

logger = logging.getLogger(__name__)


class ScdpSourceAdapter(SourceAdapter):
    """
    Connects to the SQL Server BDGSM source database via pyodbc / SQLAlchemy.
    Read-only: strictly reads source tables.
    """

    def __init__(self) -> None:
        self._connected: bool = False

    async def connect(self) -> None:
        """Verify connection capability to SQL Server BDGSM."""
        if not settings.scdp_is_configured:
            logger.warning(
                "ScdpSourceAdapter: SQL Server source credentials not configured. "
                "Reads will return empty."
            )
            return

        try:
            # Test connection in background thread to avoid blocking loop
            await asyncio.to_thread(self._test_connection)
            self._connected = True
            logger.info(
                "ScdpSourceAdapter: connected to SQL Server %s:%s/%s (schema: %s)",
                settings.source_host,
                settings.source_port,
                settings.source_name,
                settings.source_schema,
            )
        except Exception as exc:
            logger.error("ScdpSourceAdapter: failed to connect — %s", exc)
            self._connected = False
            raise

    def _test_connection() -> None:
        import pyodbc
        conn_str = (
            f"DRIVER={{{settings.SCDP_SOURCE_DB_DRIVER}}};"
            f"SERVER={settings.source_host},{settings.source_port};"
            f"DATABASE={settings.source_name};"
            f"UID={settings.source_user};"
            f"PWD={settings.source_password};"
            f"TrustServerCertificate=yes;"
        )
        conn = pyodbc.connect(conn_str, timeout=10)
        conn.close()

    async def disconnect(self) -> None:
        """Disconnect from SQL Server source."""
        self._connected = False
        logger.info("ScdpSourceAdapter: disconnected")

    async def read_records(
        self,
        table_name: str,
        batch_size: int,
        last_synced_at: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Read records from the SQL Server source table."""
        if not settings.scdp_is_configured or not self._connected:
            logger.warning("ScdpSourceAdapter: not connected — returning empty record set")
            return []

        return await asyncio.to_thread(
            self._sync_read_records, table_name, batch_size, last_synced_at
        )

    def _sync_read_records(
        self,
        table_name: str,
        batch_size: int,
        last_synced_at: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        import pyodbc
        schema = settings.source_schema or "dbo"
        conn_str = (
            f"DRIVER={{{settings.SCDP_SOURCE_DB_DRIVER}}};"
            f"SERVER={settings.source_host},{settings.source_port};"
            f"DATABASE={settings.source_name};"
            f"UID={settings.source_user};"
            f"PWD={settings.source_password};"
            f"TrustServerCertificate=yes;"
        )

        query = f"SELECT TOP {batch_size} * FROM [{schema}].[{table_name}]"
        
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]
