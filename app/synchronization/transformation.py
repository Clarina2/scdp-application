"""
Data Transformation & Fingerprinting Module
===========================================
Handles data type conversions, NULLs, empty strings, date parsing, and MD5 row fingerprint generation.
"""

import hashlib
import logging
from datetime import datetime, date
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class DataTransformer:
    """Transforms raw source row dictionaries into clean target model attribute dictionaries."""

    @staticmethod
    def transform_row(
        row: Dict[str, Any],
        column_mapping: Dict[str, str],
        date_fields: List[str],
        source_key_cols: List[str],
        identity_type: str,
    ) -> Dict[str, Any]:
        """
        Map and sanitize fields from raw SQL Server row dictionary.
        Also calculates `fingerprint` hash if `identity_type == "FINGERPRINT"`.
        """
        transformed: Dict[str, Any] = {}

        for source_col, target_field in column_mapping.items():
            val = row.get(source_col)
            if val is None:
                # Case-insensitive lookup
                for k, v in row.items():
                    if k.upper() == source_col.upper():
                        val = v
                        break

            # Handle empty strings as NULL for dates/numbers or clean whitespace
            if isinstance(val, str):
                val = val.strip()
                if val == "":
                    val = None

            # Handle date parsing
            if target_field in date_fields and val is not None:
                if isinstance(val, str):
                    try:
                        val = datetime.fromisoformat(val)
                    except ValueError:
                        val = None

            transformed[target_field] = val

        # Calculate row fingerprint if non-PK table
        if identity_type == "FINGERPRINT":
            fingerprint_str = DataTransformer.calculate_fingerprint(row, source_key_cols)
            transformed["fingerprint"] = fingerprint_str

        return transformed

    @staticmethod
    def calculate_fingerprint(row: Dict[str, Any], key_cols: List[str]) -> str:
        """
        Generates a deterministic MD5 hash string representing the row values
        for non-PK tables (e.g. TRECEPTION, TSORTIE).
        """
        parts = []
        for col in key_cols:
            val = row.get(col)
            if val is None:
                for k, v in row.items():
                    if k.upper() == col.upper():
                        val = v
                        break
            if isinstance(val, datetime):
                val_str = val.isoformat()
            elif val is None:
                val_str = "NULL"
            else:
                val_str = str(val).strip()
            parts.append(f"{col}:{val_str}")

        raw_key = "|".join(parts)
        return hashlib.md5(raw_key.encode("utf-8")).hexdigest()
