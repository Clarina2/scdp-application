"""
AuditLog Model (app schema)
===========================
Model for recording user and system audit trails in the `app` schema.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Text, JSON, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, generate_uuid


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {"schema": "app"}

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    entity_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    metadata_info: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, name="metadata")
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
