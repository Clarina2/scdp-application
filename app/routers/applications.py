from fastapi import APIRouter, Depends, HTTPException, status
from app.common.decorators.current_user import get_current_user
from app.models.user import User, Role

router = APIRouter()


@router.get("/marketer-applications")
async def applications_disabled():
    """Marketer application flow disabled - use admin marketer creation instead."""
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Public marketer application flow has been disabled. Marketer accounts are created by administrators via POST /admin/marketers"
    )


@router.get("/admin/marketer-applications")
async def admin_applications_disabled():
    """Marketer application approval flow disabled - use admin marketer creation instead."""
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Marketer application approval flow has been disabled. Marketer accounts are created by administrators via POST /admin/marketers"
    )
