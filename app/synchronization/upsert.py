"""
Upsert & Identity Strategy Module
=================================
Executes idempotent upserts (INSERT or UPDATE) for target PostgreSQL models.
Handles primary-key matching and fingerprint-matching for non-PK tables.
"""

import logging
from typing import Dict, Any, Type, Tuple
from app.synchronization.target.postgresql import PostgresqlTargetAdapter

logger = logging.getLogger(__name__)


class UpsertEngine:
    """Executes idempotent upserts for a target table row."""

    def __init__(self, target_adapter: PostgresqlTargetAdapter) -> None:
        self.target = target_adapter

    async def execute_upsert(
        self,
        mapped_row: Dict[str, Any],
        model_cls: Type[Any],
        identity_type: str,
        primary_key_field: str,
    ) -> Tuple[str, bool]:
        """
        Executes idempotent upsert.
        Returns Tuple of (action: "INSERT" | "UPDATE" | "SKIP", success: True).
        """
        if identity_type == "PRIMARY_KEY":
            pk_val = mapped_row[primary_key_field]
            existing = await self.target.get_by_primary_key(model_cls, primary_key_field, pk_val)
        else:  # FINGERPRINT
            fingerprint = mapped_row["fingerprint"]
            existing = await self.target.get_by_fingerprint(model_cls, fingerprint)

        if not existing:
            # INSERT
            instance = model_cls(**mapped_row)
            await self.target.insert_record(instance)
            return "INSERT", True
        else:
            # UPDATE (if changed)
            has_changes = await self.target.update_record(existing, mapped_row)
            if has_changes:
                return "UPDATE", True
            return "SKIP", True
