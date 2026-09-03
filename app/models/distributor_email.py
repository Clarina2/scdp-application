"""
Distributor Email Mapping Model
================================
Maps distributor codes to their operational email addresses.
Since TDistributeur is read-only (replicated from SQL Server),
this table stores the email addresses for marketers.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, generate_uuid


class DistributorEmail(Base):
    __tablename__ = "distributor_emails"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    distributor_code: Mapped[str] = mapped_column(String(3), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
