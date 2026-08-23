"""
Auth Service
============
Handles user authentication, initial password setup, password reset, token generation, and logout.
"""

import bcrypt
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dto import LoginDto, SetInitialPasswordDto, ForgotPasswordDto, ResetPasswordDto
from app.services.user_service import UserService
from app.services.otp_service import OtpService, OtpType
from app.auth.jwt_handler import create_access_token
from app.common.exceptions.custom import (
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
)


class AuthService:
    """Async service managing authentication and credential lifecycle."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.user_service = UserService(db)
        self.otp_service = OtpService(db)

    async def login(self, login_dto: LoginDto) -> Dict[str, Any]:
        """Authenticate user and return JWT access token."""
        user = await self.user_service.find_by_email(login_dto.email)
        if not user:
            raise UnauthorizedException("Invalid credentials")

        if not user.is_active:
            raise UnauthorizedException("Account is deactivated or pending initial activation")

        if not bcrypt.checkpw(login_dto.password.encode("utf-8"), user.password_hash.encode("utf-8")):
            raise UnauthorizedException("Invalid credentials")

        # Update last login
        await self.user_service.update_last_login(user.id)

        payload = {
            "sub": user.id,
            "email": user.email,
            "role": user.role.value,
        }

        return {
            "accessToken": create_access_token(payload),
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role.value,
            },
        }

    async def set_initial_password(self, dto: SetInitialPasswordDto) -> Dict[str, Any]:
        """Set initial password for newly approved marketer using OTP verification."""
        user = await self.user_service.find_by_email(dto.email)
        if not user:
            raise NotFoundException("No account found for this email address")

        # Verify OTP
        await self.otp_service.verify_otp(dto.email, dto.code, OtpType.ACCOUNT_VERIFICATION)

        # Hash password and activate user
        await self.user_service.update_password(user.id, dto.password)
        updated_user = await self.user_service.activate_user(user.id)

        # Consume OTP
        await self.otp_service.consume_otp(dto.email, OtpType.ACCOUNT_VERIFICATION)

        payload = {
            "sub": updated_user.id,
            "email": updated_user.email,
            "role": updated_user.role.value,
        }

        return {
            "success": True,
            "message": "Initial password set up successfully. Account is now active.",
            "accessToken": create_access_token(payload),
            "user": {
                "id": updated_user.id,
                "name": updated_user.name,
                "email": updated_user.email,
                "role": updated_user.role.value,
            },
        }

    async def forgot_password(self, dto: ForgotPasswordDto) -> Dict[str, Any]:
        """Request password reset OTP code via email."""
        user = await self.user_service.find_by_email(dto.email)
        if not user:
            # Do not leak user existence
            return {
                "success": True,
                "message": "If an account exists for this email address, a password reset OTP code has been sent.",
            }

        await self.otp_service.generate_and_send_otp(dto.email, OtpType.PASSWORD_RESET)

        return {
            "success": True,
            "message": "If an account exists for this email address, a password reset OTP code has been sent.",
        }

    async def reset_password(self, dto: ResetPasswordDto) -> Dict[str, Any]:
        """Reset password using verified OTP code."""
        user = await self.user_service.find_by_email(dto.email)
        if not user:
            raise NotFoundException("No account found for this email address")

        # Verify OTP
        await self.otp_service.verify_otp(dto.email, dto.code, OtpType.PASSWORD_RESET)

        # Update password
        await self.user_service.update_password(user.id, dto.new_password)

        # Consume OTP
        await self.otp_service.consume_otp(dto.email, OtpType.PASSWORD_RESET)

        return {
            "success": True,
            "message": "Password reset successfully. You can now log in with your new password.",
        }

    async def refresh_token(self, user_id: str, email: str, role: str) -> Dict[str, Any]:
        """Refresh JWT access token for active session."""
        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
        }
        return {"accessToken": create_access_token(payload)}

    async def logout(self) -> Dict[str, Any]:
        """Stateless logout."""
        return {"success": True, "message": "Logged out successfully"}
