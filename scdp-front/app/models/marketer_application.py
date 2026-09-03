from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SQLEnum
from enum import Enum
from datetime import datetime
from app.models.base import Base, generate_uuid


class MarketerApplicationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class MarketerApplication(Base):
    __tablename__ = "marketer_applications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, index=True)
    company_name: Mapped[str] = mapped_column(String, name="company_name")
    status: Mapped[MarketerApplicationStatus] = mapped_column(
        SQLEnum(MarketerApplicationStatus), 
        default=MarketerApplicationStatus.PENDING, 
        index=True
    )
    rejection_reason: Mapped[str | None] = mapped_column(String, name="rejection_reason")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, name="created_at")
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, name="updated_at")
