"""
Email Service
=============
Asynchronous email delivery service for the SCDP Stock Information Platform.

Provides functionality for sending transactional emails:
- Application submission confirmation
- Application approval notification with account verification OTP
- Application rejection notification with reason
- Security OTP verification and password reset emails

Configuration:
Reads SMTP configuration from `app.config.settings`:
- `SMTP_HOST`
- `SMTP_PORT` (default: 587)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (default: 'SCDP Platform <noreply@scdp.com>')

Fallback Mode:
If SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) are not provided,
the service operates in MOCK / LOGGER mode, logging outgoing emails without failing.
"""

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Async service for sending platform notification and transaction emails."""

    def __init__(self) -> None:
        self.host: Optional[str] = settings.SMTP_HOST
        self.port: int = settings.SMTP_PORT or 587
        self.user: Optional[str] = settings.SMTP_USER
        self.password: Optional[str] = settings.SMTP_PASS
        self.from_address: str = settings.SMTP_FROM or "SCDP Platform <noreply@scdp.com>"

        self.is_configured: bool = bool(self.host and self.user and self.password)
        if self.is_configured:
            logger.info("EmailService initialized with SMTP server %s:%s", self.host, self.port)
        else:
            logger.warning("SMTP credentials not provided. EmailService running in MOCK / LOGGER mode.")

    async def send_email(
        self,
        to: str,
        subject: str,
        text: str,
        html: Optional[str] = None,
    ) -> bool:
        """
        Send an email asynchronously via SMTP or log it in mock mode.

        Returns:
            bool: True if sent (or logged) successfully, False otherwise.
        """
        if not self.is_configured:
            logger.info(
                "[MOCK EMAIL SENT]\nTo: %s\nFrom: %s\nSubject: %s\nContent:\n%s",
                to,
                self.from_address,
                subject,
                text,
            )
            return True

        message = MIMEMultipart("alternative")
        message["From"] = self.from_address
        message["To"] = to
        message["Subject"] = subject

        message.attach(MIMEText(text, "plain"))
        if html:
            message.attach(MIMEText(html, "html"))

        try:
            await aiosmtplib.send(
                message,
                hostname=self.host,
                port=self.port,
                username=self.user,
                password=self.password,
                start_tls=(self.port == 587),
                use_tls=(self.port == 465),
            )
            logger.info("Email successfully sent to %s with subject '%s'", to, subject)
            return True
        except Exception as error:
            logger.error("Failed to send email to %s: %s", to, error, exc_info=True)
            return False

    async def send_application_submitted_email(self, email: str, name: str) -> bool:
        """Send application receipt confirmation to a prospective marketer."""
        subject = "SCDP Marketer Application Received"
        text = (
            f"Hello {name},\n\n"
            "Your application to become a registered SCDP Marketer has been received "
            "and is currently under administrator review.\n\n"
            "You will receive a notification once your application is verified.\n\n"
            "Best regards,\n"
            "SCDP Platform Team"
        )
        return await self.send_email(email, subject, text)

    async def send_application_approved_email(self, email: str, name: str, otp_code: str) -> bool:
        """Send approval email containing initial OTP verification code to applicant."""
        subject = "SCDP Marketer Application Approved — Verification Code"
        text = (
            f"Hello {name},\n\n"
            "Congratulations! Your marketer application has been approved by the administrator.\n\n"
            f"Your one-time verification code (OTP) is: {otp_code}\n"
            "This code expires in 15 minutes.\n\n"
            "Please enter this code on the activation screen to set up your password "
            "and complete account activation.\n\n"
            "Best regards,\n"
            "SCDP Platform Team"
        )
        return await self.send_email(email, subject, text)

    async def send_application_rejected_email(
        self, email: str, name: str, reason: Optional[str] = None
    ) -> bool:
        """Send rejection notice to applicant, optionally including feedback/reason."""
        subject = "SCDP Marketer Application Status Update"
        reason_text = f"\nReason: {reason}" if reason else ""
        text = (
            f"Hello {name},\n\n"
            "We regret to inform you that your application to become a registered SCDP Marketer "
            f"was not approved.{reason_text}\n\n"
            "If you have any questions, please contact platform administration.\n\n"
            "Best regards,\n"
            "SCDP Platform Team"
        )
        return await self.send_email(email, subject, text)

    async def send_otp_email(self, email: str, otp_code: str, type_str: str) -> bool:
        """Send standard security OTP code (Password Reset or Account Verification)."""
        is_reset = type_str == "PASSWORD_RESET"
        subject = f"SCDP {'Password Reset' if is_reset else 'Account Verification'} Code"
        text = (
            "Hello,\n\n"
            f"Your one-time security verification code is: {otp_code}\n"
            "This code expires in 15 minutes.\n\n"
            "If you did not request this code, please ignore this email.\n\n"
            "Best regards,\n"
            "SCDP Platform Team"
        )
        return await self.send_email(email, subject, text)
