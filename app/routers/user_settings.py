from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional

from app.database import get_db
from app.common.decorators.current_user import get_current_user
from app.models.user import User, Role
from app.models.user_settings import UserSettings
from sqlalchemy import select

router = APIRouter()


class UserSettingsDto(BaseModel):
    low_stock_threshold: Optional[int] = Field(None, ge=0, description="Low stock threshold for notifications")


class UpdateUserSettingsDto(BaseModel):
    low_stock_threshold: int = Field(..., ge=0, description="Low stock threshold for notifications")


@router.get("/")
async def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user settings."""
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()
    
    if not settings:
        # Create default settings for user
        settings = UserSettings(
            user_id=current_user.id,
            low_stock_threshold=500
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return {
        "low_stock_threshold": settings.low_stock_threshold,
        "created_at": settings.created_at,
        "updated_at": settings.updated_at,
    }


@router.put("/")
async def update_user_settings(
    dto: UpdateUserSettingsDto,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user settings."""
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()
    
    if not settings:
        # Create settings if they don't exist
        settings = UserSettings(
            user_id=current_user.id,
            low_stock_threshold=dto.low_stock_threshold
        )
        db.add(settings)
    else:
        # Update existing settings
        settings.low_stock_threshold = dto.low_stock_threshold
    
    await db.commit()
    await db.refresh(settings)
    
    return {
        "low_stock_threshold": settings.low_stock_threshold,
        "created_at": settings.created_at,
        "updated_at": settings.updated_at,
    }


@router.get("/organization")
async def get_organization_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get organization information for the current user."""
    if current_user.role == Role.ADMIN:
        # Admins don't have organization info
        return {
            "organization": None,
            "message": "Admin users are not associated with a distributor organization"
        }
    
    if current_user.role == Role.MARKETER and current_user.distributor_code:
        # Fetch distributor info from TDistributeur
        from app.models.scdp import TDistributeur
        result = await db.execute(
            select(TDistributeur).where(TDistributeur.code_dis == current_user.distributor_code)
        )
        distributor = result.scalar_one_or_none()
        
        if distributor:
            return {
                "organization": {
                    "code": distributor.code_dis,
                    "name": distributor.dis_nom,
                    "priority": distributor.dis_priorite,
                },
                "read_only": True
            }
    
    return {
        "organization": None,
        "message": "No organization information available"
    }
