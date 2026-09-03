"""
Sync Source Adapters
====================
Adapters for reading records from the SCDP source database.

The SyncEngine uses an adapter to abstract the data source:
- `MockSourceAdapter`: Returns hardcoded sample data for development/testing
- `ScdpSourceAdapter`: Connects to the real PostgreSQL SCDP replica database
"""

from app.services.adapters.source_adapter import SourceAdapter
from app.services.adapters.mock_source_adapter import MockSourceAdapter
from app.services.adapters.scdp_source_adapter import ScdpSourceAdapter

__all__ = ["SourceAdapter", "MockSourceAdapter", "ScdpSourceAdapter"]
