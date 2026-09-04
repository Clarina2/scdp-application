from datetime import date, datetime
from typing import Optional
from sqlalchemy import String, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, generate_uuid
from app.models.user import User


class StockDocument(Base):
    __tablename__ = "stock_documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    depot_code: Mapped[str] = mapped_column(String, nullable=False, index=True)
    distributor_code: Mapped[str] = mapped_column(String, nullable=False, index=True)
    uploaded_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    file_name: Mapped[str] = mapped_column(String, nullable=False)
    storage_path: Mapped[str] = mapped_column(String, nullable=False)
    mime_type: Mapped[str] = mapped_column(String, nullable=False, default="application/pdf")
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    document_date: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, nullable=True)
    statement_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)
    statement_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    statement_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    uploader: Mapped[User] = relationship("User", foreign_keys=[uploaded_by])
