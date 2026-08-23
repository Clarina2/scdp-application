"""
Authentication & OTP Router
============================
API endpoints for user authentication, password management, session handling, and OTP verification.

Endpoints:
- `POST /auth/login`: Authenticate user & return JWT token
- `GET /auth/me`: Get profile of authenticated user
- `POST /auth/password/set-initial`: Activate account & set initial password via OTP
- `POST /auth/password/forgot`: Request password reset OTP email
- `POST /auth/password/reset`: Reset password using OTP
- `POST /auth/otp/send`: Request a 6-digit OTP code to email
- `POST /auth/otp/verify`: Verify a 6-digit OTP code
- `POST /auth/refresh`: Refresh JWT access token
- `POST /auth/logout`: Stateless logout
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.dto import (
    LoginDto,
    SetInitialPasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    SendOtpDto,
    VerifyOtpDto,
)
from app.services.auth_service import AuthService
from app.services.otp_service import OtpService, OtpType
from app.services.email_service import EmailService
from app.common.decorators.current_user import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/login")
async def login(
    login_dto: LoginDto,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user and return JWT access token."""
    auth_service = AuthService(db)
    return await auth_service.login(login_dto)


@router.get("/me")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
    }


@router.post("/password/set-initial")
async def set_initial_password(
    dto: SetInitialPasswordDto,
    db: AsyncSession = Depends(get_db),
):
    """Set initial password for newly approved marketer using OTP verification code."""
    auth_service = AuthService(db)
    return await auth_service.set_initial_password(dto)


@router.post("/password/forgot")
async def forgot_password(
    dto: ForgotPasswordDto,
    db: AsyncSession = Depends(get_db),
):
    """Request password reset OTP code via email."""
    auth_service = AuthService(db)
    return await auth_service.forgot_password(dto)


@router.post("/password/reset")
async def reset_password(
    dto: ResetPasswordDto,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using verified OTP code."""
    auth_service = AuthService(db)
    return await auth_service.reset_password(dto)


@router.post("/otp/send")
async def send_otp(
    dto: SendOtpDto,
    db: AsyncSession = Depends(get_db),
):
    """Generate and send a 6-digit OTP code to user email."""
    otp_service = OtpService(db, email_service=EmailService())
    otp_type = dto.type or OtpType.ACCOUNT_VERIFICATION.value
    await otp_service.generate_and_send_otp(dto.email, otp_type)
    return {
        "success": True,
        "message": f"OTP code sent successfully to {dto.email}",
        "expiresInMinutes": 15,
    }


@router.post("/otp/verify")
async def verify_otp(
    dto: VerifyOtpDto,
    db: AsyncSession = Depends(get_db),
):
    """Verify a 6-digit OTP code."""
    otp_service = OtpService(db)
    otp_type = dto.type or OtpType.ACCOUNT_VERIFICATION.value
    await otp_service.verify_otp(dto.email, dto.code, otp_type)
    return {
        "success": True,
        "message": "OTP verified successfully. You may proceed to password creation.",
    }


@router.post("/refresh")
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Refresh JWT access token for active session."""
    auth_service = AuthService(db)
    return await auth_service.refresh_token(
        current_user.id,
        current_user.email,
        current_user.role.value,
    )


@router.post("/logout")
async def logout():
    """Stateless logout."""
    return {"success": True, "message": "Logged out successfully"}
