"""
PostgreSQL Target Adapter
=========================
Handles all PostgreSQL writing operations (insert, update, upsert, query, count)
for target `scdp_db` in `scdp` and `app` schemas.
Does not depend on SQL Server adapter.
"""

import logging
from typing import Optional, List, Dict, Any, Type
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, update, delete

logger = logging.getLogger(__name__)


class PostgresqlTargetAdapter:
    """Target adapter managing async writes and queries in PostgreSQL target scdp_db."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_primary_key(
        self,
        model_cls: Type[Any],
        pk_field: str,
        pk_val: Any,
    ) -> Optional[Any]:
        """Query target record by primary key."""
        query = select(model_cls).where(getattr(model_cls, pk_field) == pk_val)
        res = await self.db.execute(query)
        return res.scalar_one_or_none()

    async def get_by_fingerprint(
        self,
        model_cls: Type[Any],
        fingerprint: str,
    ) -> Optional[Any]:
        """Query target record by fingerprint (for non-PK transactional tables like TRECEPTION, TSORTIE)."""
        query = select(model_cls).where(getattr(model_cls, "fingerprint") == fingerprint)
        res = await self.db.execute(query)
        return res.scalar_one_or_none()

    async def insert_record(self, record_inst: Any) -> None:
        """Insert new model instance into PostgreSQL."""
        self.db.add(record_inst)
        await self.db.commit()

    async def update_record(self, record_inst: Any, mapped_data: Dict[str, Any]) -> bool:
        """
        Compare attributes and update if changed.
        Returns True if changes were applied, False if skipped.
        """
        has_changes = False
        for field_name, new_val in mapped_data.items():
            if field_name == "fingerprint":
                continue
            current_val = getattr(record_inst, field_name, None)
            if current_val != new_val:
                setattr(record_inst, field_name, new_val)
                has_changes = True

        if has_changes:
            await self.db.commit()
        return has_changes

    async def count_records(self, model_cls: Type[Any]) -> int:
        """Count total target records in PostgreSQL model."""
        query = select(func.count()).select_from(model_cls)
        res = await self.db.execute(query)
        return res.scalar() or 0
