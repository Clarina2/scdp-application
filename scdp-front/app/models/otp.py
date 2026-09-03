from sqlalchemy import String, Integer, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Enum as SQLEnum
from enum import Enum
from datetime import datetime
from app.models.base import Base, generate_uuid


class OtpType(str, Enum):
    ACCOUNT_VERIFICATION = "ACCOUNT_VERIFICATION"
    PASSWORD_RESET = "PASSWORD_RESET"


class Otp(Base):
    __tablename__ = "otps"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String, index=True)
    code: Mapped[str] = mapped_column(String)
    otp_type: Mapped[OtpType] = mapped_column(
        SQLEnum(OtpType, name="otptype"),
        name="otp_type",
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, name="expires_at")
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, name="created_at")

    __table_args__ = (
        # One OTP record per email+type combination (matches Prisma @@unique([email, type]))
        UniqueConstraint("email", "otp_type", name="uq_otp_email_type"),
    )
