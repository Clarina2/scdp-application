"""
SCDP Synchronization Package
============================
Generic, multi-stage database synchronization engine reading from SQL Server BDGSM
and replicating to PostgreSQL scdp_db.
"""

from app.synchronization.service import SynchronizationService

__all__ = ["SynchronizationService"]
