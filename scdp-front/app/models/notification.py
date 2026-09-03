from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SQLEnum
from enum import Enum
from datetime import datetime
from app.models.base import Base, generate_uuid
from app.models.user import Role


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[str | None] = mapped_column(String, name="user_id", index=True)
    role: Mapped[Role | None] = mapped_column(SQLEnum(Role), index=True)
    title: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(String)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, name="is_read", index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, name="created_at")
