"""
Source Adapter Abstract Base Class
==================================
Defines the interface that all sync source adapters must implement.
The SyncEngine depends on this abstraction, not on concrete implementations.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional, List, Dict, Any


class SourceAdapter(ABC):
    """Abstract base class for SCDP source database adapters."""

    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to the data source."""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to the data source."""
        pass

    @abstractmethod
    async def read_records(
        self,
        table_name: str,
        batch_size: int,
        last_synced_at: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """
        Read records from the source table.

        If `last_synced_at` is provided, only return records updated after that time
        (incremental sync). Otherwise return all records up to `batch_size`.
        """
        pass
