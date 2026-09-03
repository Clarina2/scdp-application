from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SQLEnum
from enum import Enum
from datetime import datetime
from app.models.base import Base, generate_uuid


class SyncStatus(str, Enum):
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PARTIAL = "PARTIAL"


class SyncHistory(Base):
    __tablename__ = "sync_history"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    table_name: Mapped[str] = mapped_column(String, name="table_name", index=True)
    started_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, name="started_at", index=True)
    completed_at: Mapped[datetime | None] = mapped_column(default=None, name="completed_at")
    status: Mapped[SyncStatus] = mapped_column(SQLEnum(SyncStatus), default=SyncStatus.RUNNING, index=True)
    records_read: Mapped[int] = mapped_column(Integer, default=0, name="records_read")
    records_inserted: Mapped[int] = mapped_column(Integer, default=0, name="records_inserted")
    records_updated: Mapped[int] = mapped_column(Integer, default=0, name="records_updated")
    records_failed: Mapped[int] = mapped_column(Integer, default=0, name="records_failed")
    error_message: Mapped[str | None] = mapped_column(String, name="error_message")
    execution_duration_ms: Mapped[int | None] = mapped_column(Integer, name="execution_duration_ms")
