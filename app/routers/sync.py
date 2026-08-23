from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.sync_service import SyncService
from app.common.decorators.current_user import get_current_user
from app.models.user import User, Role

router = APIRouter()


async def get_sync_service(db: AsyncSession = Depends(get_db)) -> SyncService:
    return SyncService(db)


@router.post("/trigger")
async def trigger_sync(
    current_user: User = Depends(get_current_user),
    sync_service: SyncService = Depends(get_sync_service)
):
    """Manually trigger database synchronization (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    return await sync_service.trigger_sync()


@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sync_service: SyncService = Depends(get_sync_service)
):
    """Retrieve synchronization execution history log (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    skip = (page - 1) * limit
    items, total = await sync_service.get_history(skip, limit)
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "items": [
            {
                "id": item.id,
                "tableName": item.table_name,
                "startedAt": item.started_at,
                "completedAt": item.completed_at,
                "status": item.status.value,
                "recordsRead": item.records_read,
                "recordsInserted": item.records_inserted,
                "recordsUpdated": item.records_updated,
                "recordsFailed": item.records_failed,
                "errorMessage": item.error_message,
                "executionDurationMs": item.execution_duration_ms
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


@router.get("/status")
async def get_sync_status(
    current_user: User = Depends(get_current_user),
    sync_service: SyncService = Depends(get_sync_service)
):
    """Get synchronization configuration and status (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    return await sync_service.get_sync_status()
