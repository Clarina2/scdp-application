from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.stock_service import StockService
from app.common.decorators.current_user import get_current_user, get_effective_user
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
    effective_user: User = Depends(get_effective_user),
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
    
    # Marketer scope enforcement - use effective_user for data scoping
    distributor_code = effective_user.distributor_code if effective_user.role == Role.MARKETER else None
    
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
        removal_end_date=removal_end_date,
        distributor_code=distributor_code
    )
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "items": [
            {
                "id": item.id_pcfp_stk_phys_jour,
                "codeDepot": item.code_depot,
                "codeDis": item.code_dis,
                "codeProd": item.code_prod,
                "dateTrait": item.date_trait,
                "dateJaugeage": item.date_jaugeage,
                "dateVeille": item.date_veille,
                "stockTa": item.stock_ta,
                "stock15": item.stock_15,
                "pgTa": item.pg_ta,
                "pg15": item.pg_15,
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
    db: AsyncSession = Depends(get_db)
):
    """Get list of available storage depots from TDepot (optionally filtered by regionCode)."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER, Role.STOCK_GESTIONNAIRE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    from app.models.scdp import TDepot
    from sqlalchemy import select
    
    query = (
        select(TDepot.code_depot, TDepot.depot_nom)
        .distinct()
        .order_by(TDepot.depot_nom)
    )
    
    # Apply region filter if provided
    if region_code:
        query = query.where(TDepot.code_ville == region_code)
    
    result = await db.execute(query)
    items = result.all()
    
    return [
        {
            "code": item.code_depot,
            "name": item.depot_nom or item.code_depot,
        }
        for item in items
    ]


@router.get("/metadata/products")
async def get_products(
    current_user: User = Depends(get_current_user),
    depot_code: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get list of available petroleum products from TProduit (optionally filtered by depotCode)."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    from app.models.scdp import TProduit
    from sqlalchemy import select
    
    query = (
        select(TProduit.code_prod, TProduit.prod_nom)
        .distinct()
        .order_by(TProduit.prod_nom)
    )
    
    result = await db.execute(query)
    items = result.all()
    
    return [
        {
            "code": item.code_prod,
            "name": item.prod_nom or item.code_prod,
        }
        for item in items
    ]


@router.get("/metadata/cities")
async def get_cities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of available cities from TVille."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    from app.models.scdp import TVille
    from sqlalchemy import select


@router.get("/by-product")
async def get_stock_by_product(
    current_user: User = Depends(get_current_user),
    effective_user: User = Depends(get_effective_user),
    stock_service: StockService = Depends(get_stock_service),
    distributor_code: Optional[str] = Query(None),
    depot_code: Optional[str] = Query(None),
):
    """Get stock aggregated by product for dashboard."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    # Marketer scope enforcement - use effective_user for data scoping
    effective_distributor_code = effective_user.distributor_code if effective_user.role == Role.MARKETER else distributor_code
    
    return await stock_service.get_stock_by_product(
        distributor_code=effective_distributor_code,
        depot_code=depot_code,
    )


@router.get("/metadata/cities")
async def get_cities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of available cities from TVille."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    from app.models.scdp import TVille
    from sqlalchemy import select
    
    query = (
        select(TVille.code_ville, TVille.ville_nom)
        .distinct()
        .order_by(TVille.ville_nom)
    )
    result = await db.execute(query)
    items = result.all()
    
    return [
        {
            "code": item.code_ville,
            "name": item.ville_nom or str(item.code_ville),
        }
        for item in items
    ]


@router.get("/summary")
async def get_stock_summary(
    current_user: User = Depends(get_current_user),
    effective_user: User = Depends(get_effective_user),
    stock_service: StockService = Depends(get_stock_service),
    distributor_code: Optional[str] = Query(None),
):
    """Get stock overview metrics for marketer dashboard."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    # Marketer scope enforcement - use effective_user for data scoping
    effective_distributor_code = effective_user.distributor_code if effective_user.role == Role.MARKETER else distributor_code
    
    _, total_items = await stock_service.find_all(page=1, limit=1, distributor_code=effective_distributor_code)
    regions = await stock_service.get_regions()
    depots = await stock_service.get_depots()
    products = await stock_service.get_products()
    
    return {
        "totalItems": total_items,
        "totalRegions": len(regions),
        "totalDepots": len(depots),
        "totalProducts": len(products)
    }


@router.get("/{scdp_id}")
async def get_stock_by_scdp_id(
    scdp_id: str,
    current_user: User = Depends(get_current_user),
    effective_user: User = Depends(get_effective_user),
    stock_service: StockService = Depends(get_stock_service)
):
    """Get a single stock item by its SCDP ID."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )
    
    distributor_code = None
    if effective_user.role == Role.MARKETER:
        distributor_code = effective_user.distributor_code or "__UNASSIGNED__"

    item = await stock_service.find_by_scdp_id(scdp_id, distributor_code=distributor_code)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock item with SCDP ID {scdp_id} not found"
        )
    
    return {
        "id": item.id_pcfp_stk_phys_jour,
        "codeDepot": item.code_depot,
        "codeDis": item.code_dis,
        "codeProd": item.code_prod,
        "dateTrait": item.date_trait,
        "dateJaugeage": item.date_jaugeage,
        "dateVeille": item.date_veille,
        "stockTa": item.stock_ta,
        "stock15": item.stock_15,
        "pgTa": item.pg_ta,
        "pg15": item.pg_15,
    }
