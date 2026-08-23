import uuid
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy models."""
    pass


def generate_uuid() -> str:
    """Generate a new UUID string for use as a primary key."""
    return str(uuid.uuid4())
