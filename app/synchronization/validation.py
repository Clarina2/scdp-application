"""
Row Data Validation Module
==========================
Validates transformed rows before PostgreSQL insertion/update.
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class RowValidator:
    """Validates transformed record dictionaries."""

    @staticmethod
    def validate(
        mapped_row: Dict[str, Any],
        identity_type: str,
        primary_key_field: Optional[str] = None,
    ) -> bool:
        """
        Validate row requirements.
        Returns True if valid, raises ValueError if invalid.
        """
        if identity_type == "PRIMARY_KEY" and primary_key_field:
            pk_val = mapped_row.get(primary_key_field)
            if pk_val is None or pk_val == "":
                raise ValueError(f"Record is missing mandatory primary key field '{primary_key_field}'")

        if identity_type == "FINGERPRINT":
            fp_val = mapped_row.get("fingerprint")
            if not fp_val:
                raise ValueError("Record is missing mandatory row fingerprint")

        return True
