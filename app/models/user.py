from sqlalchemy import String, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SQLEnum
from enum import Enum
from datetime import datetime
from typing import Optional
from app.models.base import Base, generate_uuid


class Role(str, Enum):
    ADMIN = "ADMIN"
    MARKETER = "MARKETER"
    STOCK_GESTIONNAIRE = "STOCK_GESTIONNAIRE"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, name="phone")
    password_hash: Mapped[str] = mapped_column(String, name="password_hash")
    role: Mapped[Role] = mapped_column(SQLEnum(Role, name="Role", values_callable=lambda x: [e.value for e in x]), default=Role.MARKETER, index=True)
    distributor_code: Mapped[Optional[str]] = mapped_column(String(3), nullable=True, index=True, name="distributor_code")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, name="is_active", index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, name="created_at")
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, name="updated_at")
    last_login_at: Mapped[Optional[datetime]] = mapped_column(default=None, name="last_login_at")
