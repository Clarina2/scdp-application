import logging
import random
import string
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.otp import Otp, OtpType
from app.common.exceptions.custom import BadRequestException
from app.config import settings

logger = logging.getLogger(__name__)

# Re-export OtpType so existing code importing from this module still works
__all__ = ["OtpType", "OtpService"]


class OtpService:
    """Service for generating, verifying, and consuming one-time passwords.

    Matches the TypeScript OtpService behavior:
    - 6-digit random numeric code
    - 15-minute expiration
    - Up to 5 verification attempts
    - Upsert (overwrite) existing OTP for same email+type
    - Sends code via EmailService (injected)
    - consume() deletes the OTP record after successful use
    """

    OTP_EXPIRY_MINUTES: int = 15
    MAX_ATTEMPTS: int = 5

    def __init__(self, db: AsyncSession, email_service=None):
        self.db = db
        # email_service is optional to avoid circular imports; callers inject it
        self._email_service = email_service

    @staticmethod
    def _generate_code(length: int = 6) -> str:
        """Generate a secure random 6-digit numeric OTP code."""
        return "".join(random.choices(string.digits, k=length))

    async def generate_and_send_otp(
        self,
        email: str,
        otp_type: str = OtpType.ACCOUNT_VERIFICATION,
    ) -> str:
        """Generate a 6-digit OTP, persist it (upsert), and send via email.

        Returns the generated code (useful for tests and approval flows).
        """
        code = self._generate_code()
        expires_at = datetime.utcnow() + timedelta(minutes=self.OTP_EXPIRY_MINUTES)
        otp_type_enum = OtpType(otp_type) if isinstance(otp_type, str) else otp_type

        # Check if an OTP already exists for this email+type (upsert behaviour)
        result = await self.db.execute(
            select(Otp).where(Otp.email == email, Otp.otp_type == otp_type_enum)
        )
        existing = result.scalar_one_or_none()

        if existing:
            # Overwrite existing record (same semantics as Prisma upsert)
            existing.code = code
            existing.expires_at = expires_at
            existing.attempts = 0
            existing.verified = False
            existing.created_at = datetime.utcnow()
        else:
            otp = Otp(
                email=email,
                code=code,
                otp_type=otp_type_enum,
                expires_at=expires_at,
                attempts=0,
                verified=False,
            )
            self.db.add(otp)

        await self.db.commit()

        logger.info("Generated OTP for %s (%s)", email, otp_type_enum.value)

        # Print OTP to terminal for development only if DEV_SHOW_OTP is enabled
        if settings.DEV_SHOW_OTP:
            print(f"\n{'='*60}")
            print(f"🔐 OTP GENERATED FOR DEVELOPER")
            print(f"{'='*60}")
            print(f"Email: {email}")
            print(f"Type:  {otp_type_enum.value}")
            print(f"Code:  {code}")
            print(f"Expires: {expires_at}")
            print(f"{'='*60}\n")

        # Send via email service if available
        if self._email_service:
            await self._email_service.send_otp_email(email, code, otp_type_enum.value)
        else:
            # Fallback: log the code (development/test mode)
            logger.info("[MOCK EMAIL] OTP for %s: %s", email, code)

        return code

    async def verify_otp(
        self,
        email: str,
        code: str,
        otp_type: str = OtpType.ACCOUNT_VERIFICATION,
    ) -> bool:
        """Verify an OTP code.

        Raises BadRequestException with descriptive messages on failure.
        Returns True on success and marks the OTP as verified.
        """
        otp_type_enum = OtpType(otp_type) if isinstance(otp_type, str) else otp_type

        result = await self.db.execute(
            select(Otp).where(Otp.email == email, Otp.otp_type == otp_type_enum)
        )
        otp = result.scalar_one_or_none()

        if not otp:
            raise BadRequestException(
                "No OTP found for this email address. Please request a new code."
            )

        if otp.attempts >= self.MAX_ATTEMPTS:
            raise BadRequestException(
                "Maximum verification attempts exceeded. Please request a new OTP code."
            )

        if datetime.utcnow() > otp.expires_at:
            raise BadRequestException("OTP code has expired. Please request a new code.")

        if otp.code != code:
            # Increment attempt counter before raising
            otp.attempts += 1
            await self.db.commit()
            remaining = (self.MAX_ATTEMPTS - 1) - otp.attempts
            raise BadRequestException(
                f"Invalid OTP code. {max(0, remaining)} attempts remaining."
            )

        # Mark as verified
        otp.verified = True
        await self.db.commit()

        return True

    async def is_otp_verified(
        self,
        email: str,
        otp_type: str = OtpType.ACCOUNT_VERIFICATION,
    ) -> bool:
        """Check whether an OTP for this email+type is already verified and not expired."""
        otp_type_enum = OtpType(otp_type) if isinstance(otp_type, str) else otp_type

        result = await self.db.execute(
            select(Otp).where(Otp.email == email, Otp.otp_type == otp_type_enum)
        )
        otp = result.scalar_one_or_none()

        return bool(otp and otp.verified and datetime.utcnow() <= otp.expires_at)

    async def consume_otp(
        self,
        email: str,
        otp_type: str = OtpType.ACCOUNT_VERIFICATION,
    ) -> None:
        """Delete the OTP record after successful use (idempotent)."""
        otp_type_enum = OtpType(otp_type) if isinstance(otp_type, str) else otp_type

        result = await self.db.execute(
            select(Otp).where(Otp.email == email, Otp.otp_type == otp_type_enum)
        )
        otp = result.scalar_one_or_none()

        if otp:
            await self.db.delete(otp)
            await self.db.commit()
            logger.debug("Consumed OTP for %s (%s)", email, otp_type_enum.value)
