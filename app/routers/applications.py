from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.application_service import ApplicationService
from app.common.decorators.current_user import get_current_user
from app.models.user import User, Role
from app.models.marketer_application import MarketerApplicationStatus
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()


class CreateApplicationDto(BaseModel):
    name: str
    email: str
    companyName: str


class UpdateApplicationStatusDto(BaseModel):
    status: MarketerApplicationStatus
    rejectionReason: Optional[str] = None


@router.post("/marketer-applications")
async def create_application(
    dto: CreateApplicationDto,
    db: AsyncSession = Depends(get_db)
):
    """Submit a new marketer registration request (Public)."""
    application_service = ApplicationService(db)
    application = await application_service.create_application(
        dto.name,
        dto.email,
        dto.companyName
    )
    
    return {
        "id": application.id,
        "name": application.name,
        "email": application.email,
        "companyName": application.company_name,
        "status": application.status.value,
        "createdAt": application.created_at
    }


@router.get("/marketer-applications/track/{email}")
async def track_application(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """Track marketer application status by email (Public)."""
    application_service = ApplicationService(db)
    application = await application_service.track_application(email)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No application found"
        )
    
    return {
        "id": application.id,
        "name": application.name,
        "email": application.email,
        "companyName": application.company_name,
        "status": application.status.value,
        "rejectionReason": application.rejection_reason,
        "createdAt": application.created_at,
        "updatedAt": application.updated_at
    }


@router.get("/admin/marketer-applications")
async def list_applications(
    current_user: User = Depends(get_current_user),
    status: Optional[MarketerApplicationStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List all marketer applications (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    application_service = ApplicationService(db)
    items, total = await application_service.find_all_applications(status, page, limit)
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "items": [
            {
                "id": item.id,
                "name": item.name,
                "email": item.email,
                "companyName": item.company_name,
                "status": item.status.value,
                "rejectionReason": item.rejection_reason,
                "createdAt": item.created_at,
                "updatedAt": item.updated_at
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


@router.patch("/admin/marketer-applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    dto: UpdateApplicationStatusDto,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject a marketer application (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    if dto.status == MarketerApplicationStatus.REJECTED and not dto.rejectionReason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason is required when rejecting an application"
        )
    
    application_service = ApplicationService(db)
    application = await application_service.update_application_status(
        application_id,
        dto.status,
        dto.rejectionReason
    )
    
    return {
        "id": application.id,
        "name": application.name,
        "email": application.email,
        "companyName": application.company_name,
        "status": application.status.value,
        "rejectionReason": application.rejection_reason,
        "createdAt": application.created_at,
        "updatedAt": application.updated_at
    }
