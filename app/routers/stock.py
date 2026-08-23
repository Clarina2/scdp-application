from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.stock_service import StockService
from app.common.decorators.current_user import get_current_user
from app.models.user import User, Role
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

router = APIRouter()


async def get_stock_service(db: AsyncSession = Depends(get_db)) -> StockService:
    return StockService(db)


@router.get("/")
async def get_stock(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    product_code: Optional[str] = Query(None),
    depot_code: Optional[str] = Query(None),
    region_code: Optional[str] = Query(None),
    location_code: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    deposit_start_date: Optional[datetime] = Query(None),
    deposit_end_date: Optional[datetime] = Query(None),
    removal_start_date: Optional[datetime] = Query(None),
    removal_end_date: Optional[datetime] = Query(None),
    stock_service: StockService = Depends(get_stock_service)
):
    """Get list of stock items with pagination, filtering, and text search."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    items, total = await stock_service.find_all(
        page=page,
        limit=limit,
        product_code=product_code,
        depot_code=depot_code,
        region_code=region_code,
        location_code=location_code,
        status=status,
        search=search,
        deposit_start_date=deposit_start_date,
        deposit_end_date=deposit_end_date,
        removal_start_date=removal_start_date,
        removal_end_date=removal_end_date
    )
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "items": [
            {
                "id": item.id,
                "scdpId": item.scdp_id,
                "productCode": item.product_code,
                "productName": item.product_name,
                "depotCode": item.depot_code,
                "depotName": item.depot_name,
                "regionCode": item.region_code,
                "regionName": item.region_name,
                "locationCode": item.location_code,
                "availableQuantity": str(item.available_quantity) if item.available_quantity else None,
                "unitOfMeasure": item.unit_of_measure,
                "depositDate": item.deposit_date,
                "removalDate": item.removal_date,
                "status": item.status,
                "lastSyncedAt": item.last_synced_at,
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


@router.get("/metadata/regions")
async def get_regions(
    current_user: User = Depends(get_current_user),
    stock_service: StockService = Depends(get_stock_service)
):
    """Get list of available geographical regions."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    return await stock_service.get_regions()


@router.get("/metadata/depots")
async def get_depots(
    current_user: User = Depends(get_current_user),
    region_code: Optional[str] = Query(None),
    stock_service: StockService = Depends(get_stock_service)
):
    """Get list of available storage depots (optionally filtered by regionCode)."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    return await stock_service.get_depots(region_code)


@router.get("/metadata/products")
async def get_products(
    current_user: User = Depends(get_current_user),
    depot_code: Optional[str] = Query(None),
    stock_service: StockService = Depends(get_stock_service)
):
    """Get list of available petroleum products (optionally filtered by depotCode)."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    return await stock_service.get_products(depot_code)


@router.get("/{scdp_id}")
async def get_stock_by_scdp_id(
    scdp_id: str,
    current_user: User = Depends(get_current_user),
    stock_service: StockService = Depends(get_stock_service)
):
    """Get a single stock item by its SCDP ID."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    item = await stock_service.find_by_scdp_id(scdp_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock item with SCDP ID {scdp_id} not found"
        )
    
    return {
        "id": item.id,
        "scdpId": item.scdp_id,
        "productCode": item.product_code,
        "productName": item.product_name,
        "depotCode": item.depot_code,
        "depotName": item.depot_name,
        "regionCode": item.region_code,
        "regionName": item.region_name,
        "locationCode": item.location_code,
        "availableQuantity": str(item.available_quantity) if item.available_quantity else None,
        "unitOfMeasure": item.unit_of_measure,
        "depositDate": item.deposit_date,
        "removalDate": item.removal_date,
        "status": item.status,
        "raw_data": item.raw_data,
        "lastSyncedAt": item.last_synced_at,
        "createdAt": item.created_at,
        "updatedAt": item.updated_at
    }
