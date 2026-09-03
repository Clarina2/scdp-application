from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.user_service import UserService
from app.common.decorators.current_user import get_current_user
from app.models.user import User, Role
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

router = APIRouter()


class CreateMarketerDto(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=8)


class UpdateMarketerStatusDto(BaseModel):
    isActive: bool


async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


@router.post("/marketers")
async def create_marketer(
    dto: CreateMarketerDto,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Create a new marketer user (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    user = await user_service.create_marketer(dto.name, dto.email, dto.password)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active,
        "created_at": user.created_at
    }


@router.get("/marketers")
async def list_marketers(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user_service: UserService = Depends(get_user_service)
):
    """List all marketer users (paginated) (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    skip = (page - 1) * limit
    items, total = await user_service.find_all_marketers(skip, limit)
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "items": [
            {
                "id": item.id,
                "name": item.name,
                "email": item.email,
                "role": item.role.value,
                "is_active": item.is_active,
                "created_at": item.created_at,
                "last_login_at": item.last_login_at
            }
            for item in items
        ],
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1
        }
    }


@router.patch("/marketers/{marketer_id}/status")
async def update_marketer_status(
    marketer_id: str,
    dto: UpdateMarketerStatusDto,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Update a marketer's active status (activate/deactivate) (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    user = await user_service.update_marketer_status(marketer_id, dto.isActive)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active
    }


@router.delete("/marketers/{marketer_id}")
async def delete_marketer(
    marketer_id: str,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Delete a marketer user (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    await user_service.delete_marketer(marketer_id)
    
    return None
