from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import csv
import io

from app.database import get_db
from app.services.movement_service import MovementService
from app.common.decorators.current_user import get_current_user, get_effective_user
from app.models.user import User, Role

router = APIRouter()


async def get_movement_service(db: AsyncSession = Depends(get_db)) -> MovementService:
    return MovementService(db)


@router.get("/")
async def get_exits(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=10000),
    depot_code: Optional[str] = Query(None),
    product_code: Optional[str] = Query(None),
    distributor_code: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    effective_user: User = Depends(get_effective_user),
    movement_service: MovementService = Depends(get_movement_service),
):
    """Get paginated list of product exits/removals (TSORTIE) with search and filters."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER, Role.STOCK_GESTIONNAIRE]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    # Marketer scope enforcement - use effective_user for data scoping
    effective_distributor_code = effective_user.distributor_code if effective_user.role == Role.MARKETER else distributor_code
    
    items, total = await movement_service.find_exits(
        page=page,
        limit=limit,
        depot_code=depot_code,
        product_code=product_code,
        distributor_code=effective_distributor_code,
        search=search,
        start_date=start_date,
        end_date=end_date,
    )

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


@router.get("/metadata/depots")
async def get_exit_depots(
    current_user: User = Depends(get_current_user),
    movement_service: MovementService = Depends(get_movement_service),
):
    """Get list of available depots for exit filtering."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER, Role.STOCK_GESTIONNAIRE]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    return await movement_service.get_movement_depots()


@router.get("/metadata/products")
async def get_exit_products(
    current_user: User = Depends(get_current_user),
    movement_service: MovementService = Depends(get_movement_service),
):
    """Get list of available products for exit filtering."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    return await movement_service.get_movement_products()


@router.get("/metadata/distributors")
async def get_exit_distributors(
    current_user: User = Depends(get_current_user),
    movement_service: MovementService = Depends(get_movement_service),
):
    """Get list of available distributors for exit filtering."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    return await movement_service.get_movement_distributors()


@router.get("/metadata/destinations")
async def get_exit_destinations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get list of available destinations for exit filtering from TDestination."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    from app.models.scdp import TDestination
    from sqlalchemy import select
    
    query = (
        select(TDestination.code_dest, TDestination.dest_nom)
        .order_by(TDestination.dest_nom)
    )
    result = await db.execute(query)
    items = result.all()
    
    return [
        {
            "code": item.code_dest,
            "name": item.dest_nom or item.code_dest,
        }
        for item in items
    ]


@router.get("/export/preview")
async def preview_exits_export(
    depot_code: Optional[str] = Query(None),
    product_code: Optional[str] = Query(None),
    distributor_code: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    effective_user: User = Depends(get_effective_user),
    movement_service: MovementService = Depends(get_movement_service),
    db: AsyncSession = Depends(get_db),
):
    """Preview export data for exits with filters applied."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    # Marketer scope enforcement - use effective_user for data scoping
    effective_distributor_code = effective_user.distributor_code if effective_user.role == Role.MARKETER else distributor_code
    
    # Get all matching records (no pagination for export)
    items, total = await movement_service.find_exits(
        page=1,
        limit=10000,  # Large limit for export
        depot_code=depot_code,
        product_code=product_code,
        distributor_code=effective_distributor_code,
        search=search,
        start_date=start_date,
        end_date=end_date,
    )
    
    # Calculate totals
    total_quantity = sum(item.get("quantity", 0) for item in items)
    
    # Get marketer name
    marketer_name = current_user.email
    if current_user.distributor_code:
        from app.models.scdp import TDistributeur
        from sqlalchemy import select
        result = await db.execute(
            select(TDistributeur.dis_nom).where(TDistributeur.code_dis == current_user.distributor_code)
        )
        marketer_row = result.first()
        if marketer_row:
            marketer_name = marketer_row[0] or current_user.email
    
    # Get depot name if selected
    depot_name = "Tous les dépôts"
    if depot_code:
        from app.models.scdp import TDepot
        from sqlalchemy import select
        result = await db.execute(
            select(TDepot.depot_nom).where(TDepot.code_depot == depot_code)
        )
        depot_row = result.first()
        if depot_row:
            depot_name = depot_row[0] or depot_code
    
    # Get product name if selected
    product_name = "Tous les produits"
    if product_code:
        from app.models.scdp import TProduit
        from sqlalchemy import select
        result = await db.execute(
            select(TProduit.prod_nom).where(TProduit.code_prod == product_code)
        )
        product_row = result.first()
        if product_row:
            product_name = product_row[0] or product_code
    
    from datetime import datetime
    
    return {
        "document": {
            "title": "Bordereau de Sortie de Stock",
            "marketer": marketer_name,
            "generated_at": datetime.now().isoformat(),
            "reference": f"EXP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        },
        "filters": {
            "marketer": marketer_name,
            "depot": depot_name,
            "product": product_name,
            "distributor": effective_distributor_code or "Tous les distributeurs",
        },
        "rows": items,
        "totals": {
            "total_operations": len(items),
            "total_quantity": total_quantity,
        },
    }


@router.get("/export/csv")
async def export_exits_csv(
    depot_code: Optional[str] = Query(None),
    product_code: Optional[str] = Query(None),
    distributor_code: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    effective_user: User = Depends(get_effective_user),
    movement_service: MovementService = Depends(get_movement_service),
):
    """Export exits to CSV with filters applied."""
    if current_user.role not in [Role.ADMIN, Role.MARKETER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    
    # Marketer scope enforcement - use effective_user for data scoping
    effective_distributor_code = effective_user.distributor_code if effective_user.role == Role.MARKETER else distributor_code
    
    # Get all matching records (no pagination for export)
    items, total = await movement_service.find_exits(
        page=1,
        limit=10000,  # Large limit for export
        depot_code=depot_code,
        product_code=product_code,
        distributor_code=effective_distributor_code,
        search=search,
    )
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Date",
        "Référence",
        "Dépôt",
        "Produit",
        "Distributeur",
        "Quantité (L)",
    ])
    
    # Write data
    for item in items:
        writer.writerow([
            item.get("exitDate", "") if item.get("exitDate") else "",
            item.get("borderauNumber", "") or f"SOR-{item.get('id', '')}",
            item.get("depotName", "") or item.get("depotCode", ""),
            item.get("productName", "") or item.get("productCode", ""),
            item.get("distributorName", "") or item.get("distributorCode", ""),
            item.get("quantity", 0),
        ])
    
    # Create response
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename="sorties_{current_user.email}.csv"'
        }
    )
