"""
Authentication DTOs
===================
Pydantic schemas for authentication and OTP request/response validation.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginDto(BaseModel):
    email: str
    password: str


class SetInitialPasswordDto(BaseModel):
    email: str
    code: str
    password: str = Field(..., min_length=8)


class ForgotPasswordDto(BaseModel):
    email: str


class ResetPasswordDto(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class ChangePasswordDto(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)


class SendOtpDto(BaseModel):
    email: str
    type: Optional[str] = "ACCOUNT_VERIFICATION"


class VerifyOtpDto(BaseModel):
    email: str
    code: str
    type: Optional[str] = "ACCOUNT_VERIFICATION"


class TokenResponse(BaseModel):
    accessToken: str
    user: dict


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
