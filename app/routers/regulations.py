from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.services.movement_service import MovementService
from app.common.decorators.current_user import get_current_user
from app.models.user import User, Role

router = APIRouter()


async def get_movement_service(db: AsyncSession = Depends(get_db)) -> MovementService:
    return MovementService(db)


@router.get("/")
async def get_regulations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    movement_service: MovementService = Depends(get_movement_service),
):
    """Get paginated list of stock regulations (TREGUL)."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    items, total = await movement_service.find_regulations(page=page, limit=limit)
    total_pages = (total + limit - 1) // limit if limit > 0 else 1

    return {
        "items": items,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        },
    }
