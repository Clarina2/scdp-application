"""
StockItem Model
===============
SQLAlchemy model representing stock inventory items in PostgreSQL database (`scdp_db`).
Synchronized from the SCDP source database.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import String, Numeric, DateTime, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, generate_uuid


class StockItem(Base):
    __tablename__ = "stock_items"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    scdp_id: Mapped[str] = mapped_column(String, unique=True, index=True, name="scdp_id")
    product_code: Mapped[Optional[str]] = mapped_column(String, name="product_code", index=True)
    product_name: Mapped[Optional[str]] = mapped_column(String, name="product_name")
    depot_code: Mapped[Optional[str]] = mapped_column(String, name="depot_code", index=True)
    depot_name: Mapped[Optional[str]] = mapped_column(String, name="depot_name")
    region_code: Mapped[Optional[str]] = mapped_column(String, name="region_code", index=True)
    region_name: Mapped[Optional[str]] = mapped_column(String, name="region_name")
    location_code: Mapped[Optional[str]] = mapped_column(String, name="location_code", index=True)
    distributor_code: Mapped[Optional[str]] = mapped_column(String, name="distributor_code", index=True)
    available_quantity: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 4), name="available_quantity")
    unit_of_measure: Mapped[Optional[str]] = mapped_column(String, name="unit_of_measure")
    deposit_date: Mapped[Optional[datetime]] = mapped_column(DateTime, name="deposit_date", index=True)
    removal_date: Mapped[Optional[datetime]] = mapped_column(DateTime, name="removal_date")
    status: Mapped[Optional[str]] = mapped_column(String, default="ACTIVE", index=True)
    raw_data: Mapped[Optional[dict]] = mapped_column(JSON, name="raw_data")
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, name="last_synced_at", index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, name="created_at")
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, name="updated_at")
