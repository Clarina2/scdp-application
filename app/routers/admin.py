from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.user_service import UserService
from app.services.sync_service import SyncService
from app.common.decorators.current_user import get_current_user
from app.models.user import User, Role
from app.models.audit_log import AuditLog
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from app.auth.jwt_handler import create_access_token
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class CreateMarketerDto(BaseModel):
    distributor_code: str = Field(..., min_length=2, max_length=3, description="Distributor code from TDistributeur")
    email: EmailStr
    phone: Optional[str] = Field(None, description="Phone number for OTP SMS backup")


class UpdateMarketerStatusDto(BaseModel):
    isActive: bool


class TriggerSyncDto(BaseModel):
    tables: Optional[List[str]] = None


class CreateAdminDto(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: Optional[str] = Field(None, description="Password for direct admin creation (not used for OTP-based creation)")


class CreateAdminWithOtpDto(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nom complet de l'administrateur")
    email: EmailStr


class CreateStockGestionnaireDto(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nom complet du gestionnaire de stock")
    email: EmailStr
    phone: Optional[str] = Field(None, description="Phone number")


async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


async def get_sync_service(db: AsyncSession = Depends(get_db)) -> SyncService:
    return SyncService(db)


import logging
from sqlalchemy import select

logger = logging.getLogger(__name__)


@router.get("/distributors")
async def list_available_distributors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of authorized marketers/distributors directly from scdp.tdistributeur database table."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    try:
        from app.models.scdp import TDistributeur
        result = await db.execute(select(TDistributeur).distinct().order_by(TDistributeur.dis_nom))
        distributors = list(result.scalars().all())

        if not distributors:
            return []

        items = [
            {
                "code": d.code_dis,
                "name": d.dis_nom,
            }
            for d in distributors if d.dis_nom
        ]
        return items if items else []
    except Exception as err:
        logger.error("Could not query scdp.tdistributeur table directly: %s", err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve distributors from database"
        )


@router.post("/marketers")
async def create_marketer(
    dto: CreateMarketerDto,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    db: AsyncSession = Depends(get_db)
):
    """Create a new marketer user (Admin only). Validates distributor, creates inactive account, and sends OTP for password setup."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    # Validate distributor exists in TDistributeur
    from app.models.scdp import TDistributeur
    from sqlalchemy import select
    result = await db.execute(
        select(TDistributeur).where(TDistributeur.code_dis == dto.distributor_code)
    )
    distributor = result.scalar_one_or_none()
    
    if not distributor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Distributor with code '{dto.distributor_code}' not found"
        )
    
    # Create marketer using distributor name and provided email
    user = await user_service.create_marketer(distributor.dis_nom or dto.distributor_code, dto.email, distributor_code=dto.distributor_code, phone=dto.phone)
    
    # Store distributor email mapping (skip if table doesn't exist)
    try:
        from app.models.distributor_email import DistributorEmail
        existing_email = await db.execute(
            select(DistributorEmail).where(DistributorEmail.email == dto.email)
        )
        if not existing_email.scalar_one_or_none():
            dist_email = DistributorEmail(
                distributor_code=dto.distributor_code,
                email=dto.email
            )
            db.add(dist_email)
            await db.commit()
    except Exception:
        # Table might not exist yet, skip this step
        pass
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "message": "Marketer account created. An activation OTP has been sent to the marketer's email."
    }


@router.post("/stock-gestionnaires")
async def create_stock_gestionnaire(
    dto: CreateStockGestionnaireDto,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Create a new Stock Gestionnaire user (Admin only). Creates inactive account and sends OTP for password setup."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    user = await user_service.create_stock_gestionnaire(name=dto.name, email=dto.email, phone=dto.phone)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "message": "Stock Gestionnaire account created. An activation OTP has been sent to the user's email."
    }


@router.get("/stock-gestionnaires")
async def list_stock_gestionnaires(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    user_service: UserService = Depends(get_user_service)
):
    """List all stock gestionnaire users (paginated and searchable) (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    skip = (page - 1) * limit
    items, total = await user_service.find_all_stock_gestionnaires(skip, limit, search=search)
    
    return {
        "items": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role.value,
                "is_active": u.is_active,
                "created_at": u.created_at,
            }
            for u in items
        ],
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/marketers")
async def list_marketers(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    user_service: UserService = Depends(get_user_service)
):
    """List all marketer users (paginated and searchable) (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    skip = (page - 1) * limit
    items, total = await user_service.find_all_marketers(skip, limit, search=search)
    
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    
    return {
        "items": [
            {
                "id": item.id,
                "name": item.name,
                "email": item.email,
                "phone": item.phone,
                "role": item.role.value,
                "is_active": item.is_active,
                "created_at": item.created_at,
                "last_login_at": item.last_login_at
            }
            for item in items
        ],
        "total": total,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1
        }
    }


@router.get("/dashboard/summary")
async def get_admin_dashboard_summary(
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    sync_service: SyncService = Depends(get_sync_service),
    db: AsyncSession = Depends(get_db),
    marketer_id: Optional[str] = Query(None, description="Filter by marketer/distributor code"),
    city_id: Optional[int] = Query(None, description="Filter by city code"),
    depot_code: Optional[str] = Query(None, description="Filter by depot code"),
    product_code: Optional[str] = Query(None, description="Filter by product code"),
    start_date: Optional[str] = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter end date (YYYY-MM-DD)")
):
    """Get aggregated statistics for Admin Dashboard with optional filters."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden (Admin only)")

    # Marketer statistics
    _, total_marketers = await user_service.find_all_marketers(0, 1)
    active_marketers_items, _ = await user_service.find_all_marketers(0, 1000)
    active_marketers_count = sum(1 for m in active_marketers_items if m.is_active)

    # Build filter conditions
    from app.models.scdp import TStockPhys, TReception, TSortie, TDepot, TVille, TDistributeur
    from sqlalchemy import select, func, and_
    from datetime import datetime, timedelta

    stock_conditions = []
    reception_conditions = []
    exit_conditions = []

    # Apply marketer filter
    if marketer_id:
        stock_conditions.append(TStockPhys.code_dis == marketer_id)
        reception_conditions.append(TReception.code_dis == marketer_id)
        exit_conditions.append(TSortie.code_dis == marketer_id)

    # Apply depot filter
    if depot_code:
        stock_conditions.append(TStockPhys.code_depot == depot_code)
        reception_conditions.append(TReception.code_depot == depot_code)
        exit_conditions.append(TSortie.code_depot == depot_code)

    # Apply product filter
    if product_code:
        stock_conditions.append(TStockPhys.code_prod == product_code)
        reception_conditions.append(TReception.code_prod == product_code)
        exit_conditions.append(TSortie.code_prod == product_code)

    # Apply city filter (via depot relationship)
    if city_id:
        from app.models.scdp import TDepot
        depot_subquery = select(TDepot.code_depot).where(TDepot.code_ville == city_id)
        stock_conditions.append(TStockPhys.code_depot.in_(depot_subquery))
        reception_conditions.append(TReception.code_depot.in_(depot_subquery))
        exit_conditions.append(TSortie.code_depot.in_(depot_subquery))

    # Stock statistics from scdp.tstockphys
    stock_where = and_(*stock_conditions) if stock_conditions else True
    
    stock_result = await db.execute(
        select(func.count()).select_from(TStockPhys).where(stock_where)
    )
    total_stock_records = stock_result.scalar() or 0
    
    # Calculate total stock volume (stock_ta + stock_15)
    total_volume_result = await db.execute(
        select(func.sum(TStockPhys.stock_ta + TStockPhys.stock_15)).select_from(TStockPhys).where(stock_where)
    )
    total_volume = total_volume_result.scalar() or 0

    # Movement statistics from scdp.treception and scdp.tsortie
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Build movement date conditions
    reception_date_conditions = reception_conditions.copy()
    exit_date_conditions = exit_conditions.copy()
    
    # Add date-specific conditions
    if start_date or end_date:
        if start_date:
            try:
                start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
                reception_date_conditions.append(TReception.date_rec >= start_datetime)
                exit_date_conditions.append(TSortie.date_sortie >= start_datetime)
            except ValueError:
                pass
        if end_date:
            try:
                end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
                reception_date_conditions.append(TReception.date_rec <= end_datetime)
                exit_date_conditions.append(TSortie.date_sortie <= end_datetime)
            except ValueError:
                pass
    else:
        # Default to current month if no date filter specified
        reception_date_conditions.append(TReception.date_rec >= current_month_start)
        exit_date_conditions.append(TSortie.date_sortie >= current_month_start)
    
    reception_where = and_(*reception_date_conditions) if reception_date_conditions else True
    exit_where = and_(*exit_date_conditions) if exit_date_conditions else True
    
    # Monthly receptions
    receptions_result = await db.execute(
        select(func.sum(TReception.qte_rec)).select_from(TReception).where(reception_where)
    )
    monthly_receptions = receptions_result.scalar() or 0
    
    # Monthly exits
    exits_result = await db.execute(
        select(func.sum(TSortie.qte_sortie)).select_from(TSortie).where(exit_where)
    )
    monthly_exits = exits_result.scalar() or 0

    # Depot statistics (filtered by city if specified)
    depot_conditions = []
    if city_id:
        depot_conditions.append(TDepot.code_ville == city_id)
    
    depot_where = and_(*depot_conditions) if depot_conditions else True
    depot_result = await db.execute(
        select(func.count()).select_from(TDepot).where(depot_where)
    )
    total_depots = depot_result.scalar() or 0

    # Synchronization status
    sync_history, _ = await sync_service.get_history(0, 1)
    last_sync = sync_history[0] if sync_history else None

    # Top marketers by stock volume (with filters)
    top_marketers_query = (
        select(
            TStockPhys.code_dis,
            func.sum(TStockPhys.stock_ta + TStockPhys.stock_15).label('total_stock')
        )
        .where(TStockPhys.code_dis.isnot(None))
    )
    
    # Apply filters to top marketers query
    if stock_conditions:
        top_marketers_query = top_marketers_query.where(and_(*stock_conditions))
    
    top_marketers_query = top_marketers_query.group_by(TStockPhys.code_dis).order_by(
        func.sum(TStockPhys.stock_ta + TStockPhys.stock_15).desc()
    ).limit(5)
    
    top_marketers_result = await db.execute(top_marketers_query)
    top_marketers = [
        {"code": row.code_dis, "stock": row.total_stock or 0}
        for row in top_marketers_result
    ]

    # Recent movements (last 10) with filters
    recent_receptions_query = select(TReception)
    
    from sqlalchemy import desc, nullslast

    recent_receptions_query = (
        select(TReception, TDistributeur.dis_nom, TDepot.depot_nom)
        .outerjoin(TDistributeur, TReception.code_dis == TDistributeur.code_dis)
        .outerjoin(TDepot, TReception.code_depot == TDepot.code_depot)
    )
    
    # Apply movement filters to recent receptions
    if reception_conditions:
        recent_receptions_query = recent_receptions_query.where(and_(*reception_conditions))
    
    # Only apply date filters to recent movements if explicitly provided
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
            recent_receptions_query = recent_receptions_query.where(TReception.date_rec >= start_datetime)
        except ValueError:
            pass
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            recent_receptions_query = recent_receptions_query.where(TReception.date_rec <= end_datetime)
        except ValueError:
            pass
    
    recent_receptions_query = recent_receptions_query.order_by(nullslast(desc(TReception.date_rec)), desc(TReception.reception_id)).limit(5)
    recent_receptions_result = await db.execute(recent_receptions_query)
    recent_receptions_rows = recent_receptions_result.all()
    
    recent_exits_query = (
        select(TSortie, TDistributeur.dis_nom, TDepot.depot_nom)
        .outerjoin(TDistributeur, TSortie.code_dis == TDistributeur.code_dis)
        .outerjoin(TDepot, TSortie.code_depot == TDepot.code_depot)
    )
    
    # Apply movement filters to recent exits
    if exit_conditions:
        recent_exits_query = recent_exits_query.where(and_(*exit_conditions))
    
    # Only apply date filters to recent movements if explicitly provided
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
            recent_exits_query = recent_exits_query.where(TSortie.date_sortie >= start_datetime)
        except ValueError:
            pass
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            recent_exits_query = recent_exits_query.where(TSortie.date_sortie <= end_datetime)
        except ValueError:
            pass
    
    recent_exits_query = recent_exits_query.order_by(nullslast(desc(TSortie.date_sortie)), desc(TSortie.sortie_id)).limit(5)
    recent_exits_result = await db.execute(recent_exits_query)
    recent_exits_rows = recent_exits_result.all()

    # Combine and format recent movements
    combined_items = []
    for rec, dis_nom, depot_nom in recent_receptions_rows:
        raw_dt = rec.date_rec
        qty_val = rec.qte_rec or 0
        combined_items.append({
            "raw_date": raw_dt,
            "date": raw_dt.strftime("%d/%m/%Y") if raw_dt else "—",
            "marketer": dis_nom or rec.code_dis or "N/A",
            "depot": depot_nom or rec.code_depot or "N/A",
            "type": "Réception",
            "qty": f"{qty_val:,.0f} L".replace(",", " ") if qty_val else "0 L"
        })
    for exit, dis_nom, depot_nom in recent_exits_rows:
        raw_dt = exit.date_sortie
        qty_val = exit.qte_sortie or 0
        combined_items.append({
            "raw_date": raw_dt,
            "date": raw_dt.strftime("%d/%m/%Y") if raw_dt else "—",
            "marketer": dis_nom or exit.code_dis or "N/A",
            "depot": depot_nom or exit.code_depot or "N/A",
            "type": "Sortie",
            "qty": f"{qty_val:,.0f} L".replace(",", " ") if qty_val else "0 L"
        })
    
    # Sort by raw datetime object (nulls last) descending and take top 5
    combined_items.sort(key=lambda x: (x["raw_date"] is not None, x["raw_date"]), reverse=True)
    recent_movements = []
    for item in combined_items[:5]:
        item_copy = dict(item)
        del item_copy["raw_date"]
        recent_movements.append(item_copy)

    return {
        "totalMarketers": total_marketers,
        "activeMarketers": active_marketers_count,
        "totalStockRecords": total_stock_records,
        "totalStockVolume": total_volume,
        "totalDepots": total_depots,
        "monthlyReceptions": monthly_receptions,
        "monthlyExits": monthly_exits,
        "monthlyConsumption": monthly_exits,  # Assuming consumption = exits for now
        "lastSync": last_sync,
        "topMarketers": top_marketers,
        "recentMovements": recent_movements,
            "total": total_marketers  # Added total for consistency
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


@router.patch("/stock-gestionnaires/{gestionnaire_id}/status")
async def update_stock_gestionnaire_status(
    gestionnaire_id: str,
    dto: UpdateMarketerStatusDto,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Update a stock gestionnaire's active status (activate/deactivate) (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    user = await user_service.update_stock_gestionnaire_status(gestionnaire_id, dto.isActive)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active
    }


@router.delete("/stock-gestionnaires/{gestionnaire_id}")
async def delete_stock_gestionnaire(
    gestionnaire_id: str,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Delete a stock gestionnaire user (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    await user_service.delete_stock_gestionnaire(gestionnaire_id)
    
    return None


@router.post("/admins")
async def create_admin(
    dto: CreateAdminDto,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    db: AsyncSession = Depends(get_db)
):
    """Create a new admin user with provided password (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    # Check if admin with this email already exists
    from sqlalchemy import select
    existing_admin = await db.execute(
        select(User).where(User.email == dto.email)
    )
    if existing_admin.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create admin user with provided password
    if not dto.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required for direct admin creation"
        )
    
    admin = await user_service.create_admin(dto.name, dto.email, dto.password)
    
    return {
        "id": admin.id,
        "name": admin.name,
        "email": admin.email,
        "role": admin.role.value,
        "is_active": admin.is_active,
        "created_at": admin.created_at,
    }


@router.post("/admins-otp")
async def create_admin_with_otp(
    dto: CreateAdminWithOtpDto,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    db: AsyncSession = Depends(get_db)
):
    """Create a new admin user with OTP activation (Admin only). Creates inactive account and sends OTP for password setup."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    # Create admin with OTP
    admin = await user_service.create_admin_with_otp(dto.name, dto.email)
    
    # Send OTP for activation
    from app.services.otp_service import OtpService
    from app.services.email_service import EmailService
    from app.models.otp import OtpType
    otp_service = OtpService(db, email_service=EmailService())
    await otp_service.generate_and_send_otp(dto.email, OtpType.ACCOUNT_VERIFICATION)
    
    return {
        "id": admin.id,
        "name": admin.name,
        "email": admin.email,
        "role": admin.role.value,
        "is_active": admin.is_active,
        "created_at": admin.created_at,
        "message": "Admin account created. An activation OTP has been sent to the admin's email."
    }


@router.get("/admins")
async def list_admins(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    user_service: UserService = Depends(get_user_service)
):
    """List all admin users (paginated and searchable) (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    skip = (page - 1) * limit
    items, total = await user_service.find_all_admins(skip, limit, search=search)
    
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    
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
        "total": total,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1
        }
    }


@router.patch("/admins/{admin_id}/status")
async def update_admin_status(
    admin_id: str,
    dto: UpdateMarketerStatusDto,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Update an admin's active status (activate/deactivate) (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )

    if admin_id == current_user.id and not dto.isActive:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate the current administrator")
    
    user = await user_service.update_admin_status(admin_id, dto.isActive)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active
    }


@router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: str,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Delete an admin user (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )

    if admin_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete the current administrator")
    
    await user_service.delete_admin(admin_id)
    
    return None


# Administration Synchronization Monitoring APIs
@router.post("/synchronization/run")
async def trigger_admin_synchronization(
    dto: Optional[TriggerSyncDto] = None,
    current_user: User = Depends(get_current_user),
    sync_service: SyncService = Depends(get_sync_service),
):
    """Trigger manual synchronization run for all or selected tables (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden (Admin only)")

    tables = dto.tables if dto else None
    return await sync_service.trigger_sync(tables)


@router.get("/synchronization/runs")
async def list_admin_synchronization_runs(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sync_service: SyncService = Depends(get_sync_service),
):
    """List paginated synchronization run execution history (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden (Admin only)")

    skip = (page - 1) * limit
    items, total = await sync_service.get_history(skip, limit)
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


@router.get("/synchronization/runs/{run_id}")
async def get_admin_synchronization_run_by_id(
    run_id: int,
    current_user: User = Depends(get_current_user),
    sync_service: SyncService = Depends(get_sync_service),
):
    """Get single synchronization run details and table breakdown by run ID (Admin only)."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden (Admin only)")

    items, _ = await sync_service.get_history(0, 100)
    for run in items:
        run_dict = run if isinstance(run, dict) else run.__dict__
        if run_dict.get("id") == run_id:
            return run_dict

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Synchronization Run #{run_id} not found")


@router.get("/dashboard/statistics/cities")
async def get_city_statistics(
    marketer_id: Optional[str] = Query(None, description="Filter by distributor code"),
    city_id: Optional[str] = Query(None, description="Filter by city code"),
    depot_code: Optional[str] = Query(None, description="Filter by depot code"),
    product_code: Optional[str] = Query(None, description="Filter by product code"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get consumption statistics by city from real database data."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden (Admin only)")
    
    from app.models.scdp import TStockPhys, TDepot, TVille
    from sqlalchemy import func, and_
    
    # Build base query with city relationship
    query = (
        select(
            TVille.code_ville,
            TVille.ville_nom,
            func.sum(TStockPhys.stock_ta + TStockPhys.stock_15).label('total_stock')
        )
        .join(TDepot, TStockPhys.code_depot == TDepot.code_depot)
        .join(TVille, TDepot.code_ville == TVille.code_ville)
        .group_by(TVille.code_ville, TVille.ville_nom)
        .order_by(func.sum(TStockPhys.stock_ta + TStockPhys.stock_15).desc())
    )
    
    # Build conditions
    conditions = []
    
    if marketer_id:
        conditions.append(TStockPhys.code_dis == marketer_id)
    
    if depot_code:
        conditions.append(TStockPhys.code_depot == depot_code)
    
    if product_code:
        conditions.append(TStockPhys.code_prod == product_code)
    
    if city_id:
        conditions.append(TVille.code_ville == city_id)
    
    # Apply conditions
    if conditions:
        query = query.where(and_(*conditions))
    
    result = await db.execute(query)
    city_stats = result.all()
    
    # Calculate total for percentage calculation
    total_volume = sum(stat.total_stock or 0 for stat in city_stats)
    
    # Format response
    response = [
        {
            "city": stat.ville_nom or stat.code_ville,
            "code": stat.code_ville,
            "volume": stat.total_stock or 0,
            "percentage": round((stat.total_stock or 0) / total_volume * 100, 1) if total_volume > 0 else 0
        }
        for stat in city_stats
    ]
    
    return response


@router.get("/dashboard/statistics/marketers")
async def get_marketer_statistics(
    marketer_id: Optional[str] = Query(None, description="Filter by distributor code"),
    city_id: Optional[str] = Query(None, description="Filter by city code"),
    depot_code: Optional[str] = Query(None, description="Filter by depot code"),
    product_code: Optional[str] = Query(None, description="Filter by product code"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get consumption statistics by marketer from real database data."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden (Admin only)")
    
    from app.models.scdp import TStockPhys, TDistributeur
    from sqlalchemy import func, and_
    
    # Build base query with distributor relationship
    query = (
        select(
            TStockPhys.code_dis,
            TDistributeur.dis_nom,
            func.sum(TStockPhys.stock_ta + TStockPhys.stock_15).label('total_stock')
        )
        .join(TDistributeur, TStockPhys.code_dis == TDistributeur.code_dis)
        .group_by(TStockPhys.code_dis, TDistributeur.dis_nom)
        .order_by(func.sum(TStockPhys.stock_ta + TStockPhys.stock_15).desc())
    )
    
    # Build conditions
    conditions = []
    
    if marketer_id:
        conditions.append(TStockPhys.code_dis == marketer_id)
    
    if depot_code:
        conditions.append(TStockPhys.code_depot == depot_code)
    
    if product_code:
        conditions.append(TStockPhys.code_prod == product_code)
    
    if city_id:
        # Filter by city via depot relationship
        from app.models.scdp import TDepot
        subquery = select(TDepot.code_depot).where(TDepot.code_ville == city_id)
        conditions.append(TStockPhys.code_depot.in_(subquery))
    
    # Apply conditions
    if conditions:
        query = query.where(and_(*conditions))
    
    result = await db.execute(query)
    marketer_stats = result.all()
    
    # Calculate total for percentage calculation
    total_volume = sum(stat.total_stock or 0 for stat in marketer_stats)
    
    # Format response
    response = [
        {
            "code": stat.code_dis,
            "name": stat.dis_nom or stat.code_dis,
            "volume": stat.total_stock or 0,
            "percentage": round((stat.total_stock or 0) / total_volume * 100, 1) if total_volume > 0 else 0
        }
        for stat in marketer_stats
    ]
    
    return response


@router.get("/dashboard/stock/depots")
async def get_depot_stock_statistics(
    marketer_id: Optional[str] = Query(None, description="Filter by distributor code"),
    city_id: Optional[int] = Query(None, description="Filter by city code"),
    depot_code: Optional[str] = Query(None, description="Filter by depot code"),
    product_code: Optional[str] = Query(None, description="Filter by product code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get stock statistics by depot with city mapping from real database data."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden (Admin only)")
    
    from app.models.scdp import TStockPhys, TDepot, TVille
    from sqlalchemy import func, and_
    
    # Build base query with depot and city relationships
    query = (
        select(
            TDepot.code_depot,
            TDepot.depot_nom,
            TVille.code_ville,
            TVille.ville_nom,
            func.sum(TStockPhys.stock_ta + TStockPhys.stock_15).label('total_stock')
        )
        .join(TDepot, TStockPhys.code_depot == TDepot.code_depot)
        .join(TVille, TDepot.code_ville == TVille.code_ville)
        .group_by(TDepot.code_depot, TDepot.depot_nom, TVille.code_ville, TVille.ville_nom)
        .order_by(func.sum(TStockPhys.stock_ta + TStockPhys.stock_15).desc())
    )
    
    # Build conditions
    conditions = []
    
    if marketer_id:
        conditions.append(TStockPhys.code_dis == marketer_id)
    
    if depot_code:
        conditions.append(TDepot.code_depot == depot_code)
    
    if product_code:
        conditions.append(TStockPhys.code_prod == product_code)
    
    if city_id:
        conditions.append(TVille.code_ville == city_id)
    
    # Apply conditions
    if conditions:
        query = query.where(and_(*conditions))
    
    result = await db.execute(query)
    depot_stats = result.all()
    
    # Format response with capacity estimation (default 7000L if not available in DB)
    response = [
        {
            "depot_code": stat.code_depot,
            "depot_name": stat.depot_nom or stat.code_depot,
            "city_code": stat.code_ville,
            "city_name": stat.ville_nom or stat.code_ville,
            "stock_volume": stat.total_stock or 0,
            "capacity": 7000,  # Default capacity - could be enhanced with real capacity data
            "percentage": round((stat.total_stock or 0) / 7000 * 100, 1) if stat.total_stock else 0
        }
        for stat in depot_stats
    ]
    
    return response


# View-As User Context APIs
@router.post("/view-as/{user_id}")
async def view_as_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    db: AsyncSession = Depends(get_db)
):
    """Allow Admin to view the application as a specific Marketer or Stock Gestionnaire."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    # Get target user
    target_user = await user_service.find_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found"
        )
    
    # Validate target user role
    if target_user.role not in [Role.MARKETER, Role.STOCK_GESTIONNAIRE]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only view as Marketer or Stock Gestionnaire"
        )
    
    # Validate target user is active
    if not target_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target user account is not active"
        )
    
    # Log the view-as action to audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="VIEW_AS_USER",
        entity_type="User",
        entity_id=target_user.id,
        metadata_info={
            "admin_email": current_user.email,
            "admin_name": current_user.name,
            "target_user_email": target_user.email,
            "target_user_name": target_user.name,
            "target_user_role": target_user.role.value,
            "target_user_distributor_code": target_user.distributor_code
        }
    )
    db.add(audit_log)
    await db.commit()
    
    # Also log to application logger
    logger.info(
        f"Admin {current_user.email} (ID: {current_user.id}) is viewing as "
        f"{target_user.role.value} {target_user.email} (ID: {target_user.id})"
    )
    
    # Create new token with view-as context
    # The real admin identity is preserved in the token, but we add view-as context
    payload = {
        "sub": current_user.id,  # Real admin ID
        "email": current_user.email,
        "role": current_user.role.value,  # Real admin role
        "view_as_user_id": target_user.id,  # Target user ID
        "view_as_role": target_user.role.value,  # Target user role
        "view_as_email": target_user.email,
        "view_as_name": target_user.name,
    }
    
    access_token = create_access_token(payload)
    
    return {
        "accessToken": access_token,
        "viewAsUser": {
            "id": target_user.id,
            "name": target_user.name,
            "email": target_user.email,
            "role": target_user.role.value,
            "distributor_code": target_user.distributor_code
        },
        "realAdmin": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }


@router.post("/exit-view-as")
async def exit_view_as(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Exit view-as mode and return to Admin context."""
    # This endpoint can be called regardless of view-as state
    # It will issue a clean admin token
    
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Admin only)"
        )
    
    # Log the exit action to audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="EXIT_VIEW_AS",
        entity_type="User",
        entity_id=current_user.id,
        metadata_info={
            "admin_email": current_user.email,
            "admin_name": current_user.name
        }
    )
    db.add(audit_log)
    await db.commit()
    
    # Also log to application logger
    logger.info(f"Admin {current_user.email} (ID: {current_user.id}) exited view-as mode")
    
    # Create clean admin token without view-as context
    payload = {
        "sub": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
    }
    
    access_token = create_access_token(payload)
    
    return {
        "accessToken": access_token,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role.value
        }
    }
