from sqlalchemy import String, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SQLEnum
from enum import Enum
from datetime import datetime
from app.models.base import Base, generate_uuid


class Role(str, Enum):
    ADMIN = "ADMIN"
    MARKETER = "MARKETER"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String, name="password_hash")
    role: Mapped[Role] = mapped_column(SQLEnum(Role, name="role"), default=Role.MARKETER, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, name="is_active", index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, name="created_at")
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, name="updated_at")
    last_login_at: Mapped[datetime | None] = mapped_column(default=None, name="last_login_at")
