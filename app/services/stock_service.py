from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, distinct
from sqlalchemy.orm import selectinload
from app.models.stock_item import StockItem
from app.common.exceptions.custom import NotFoundException
from typing import Optional, List
from datetime import datetime


class StockService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_all(
        self,
        page: int = 1,
        limit: int = 10,
        product_code: Optional[str] = None,
        depot_code: Optional[str] = None,
        region_code: Optional[str] = None,
        location_code: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        deposit_start_date: Optional[datetime] = None,
        deposit_end_date: Optional[datetime] = None,
        removal_start_date: Optional[datetime] = None,
        removal_end_date: Optional[datetime] = None,
    ) -> tuple[List[StockItem], int]:
        """Get stock items with filtering and pagination."""
        skip = (page - 1) * limit
        
        # Build where conditions
        conditions = []
        
        if product_code:
            conditions.append(StockItem.product_code == product_code)
        if depot_code:
            conditions.append(StockItem.depot_code == depot_code)
        if region_code:
            conditions.append(StockItem.region_code == region_code)
        if location_code:
            conditions.append(StockItem.location_code == location_code)
        if status:
            conditions.append(StockItem.status == status)
        
        # Date range filters
        if deposit_start_date or deposit_end_date:
            if deposit_start_date and deposit_end_date:
                conditions.append(
                    and_(
                        StockItem.deposit_date >= deposit_start_date,
                        StockItem.deposit_date <= deposit_end_date
                    )
                )
            elif deposit_start_date:
                conditions.append(StockItem.deposit_date >= deposit_start_date)
            elif deposit_end_date:
                conditions.append(StockItem.deposit_date <= deposit_end_date)
        
        if removal_start_date or removal_end_date:
            if removal_start_date and removal_end_date:
                conditions.append(
                    and_(
                        StockItem.removal_date >= removal_start_date,
                        StockItem.removal_date <= removal_end_date
                    )
                )
            elif removal_start_date:
                conditions.append(StockItem.removal_date >= removal_start_date)
            elif removal_end_date:
                conditions.append(StockItem.removal_date <= removal_end_date)
        
        # Text search
        if search:
            search_condition = or_(
                StockItem.product_name.ilike(f"%{search}%"),
                StockItem.depot_name.ilike(f"%{search}%")
            )
            conditions.append(search_condition)
        
        # Build query
        where_clause = and_(*conditions) if conditions else True
        
        # Get total count
        count_query = select(func.count()).select_from(StockItem).where(where_clause)
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Get items
        query = (
            select(StockItem)
            .where(where_clause)
            .order_by(StockItem.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        items = result.scalars().all()
        
        return list(items), total

    async def find_by_scdp_id(self, scdp_id: str) -> Optional[StockItem]:
        """Find stock item by SCDP ID."""
        result = await self.db.execute(
            select(StockItem).where(StockItem.scdp_id == scdp_id)
        )
        return result.scalar_one_or_none()

    async def get_regions(self) -> List[dict]:
        """Get distinct regions."""
        query = (
            select(
                StockItem.region_code,
                StockItem.region_name,
            )
            .where(StockItem.region_code.isnot(None))
            .distinct()
            .order_by(StockItem.region_code)
        )
        result = await self.db.execute(query)
        items = result.all()

        return [
            {
                "code": item.region_code,
                "name": item.region_name or item.region_code,
            }
            for item in items
            if item.region_code
        ]

    async def get_depots(self, region_code: Optional[str] = None) -> List[dict]:
        """Get distinct depots, optionally filtered by region."""
        conditions = [StockItem.depot_code.isnot(None)]
        if region_code:
            conditions.append(StockItem.region_code == region_code)

        query = (
            select(
                StockItem.depot_code,
                StockItem.depot_name,
                StockItem.region_code,
            )
            .where(and_(*conditions))
            .distinct()
            .order_by(StockItem.depot_code)
        )
        result = await self.db.execute(query)
        items = result.all()

        return [
            {
                "code": item.depot_code,
                "name": item.depot_name or item.depot_code,
                "regionCode": item.region_code,
            }
            for item in items
            if item.depot_code
        ]

    async def get_products(self, depot_code: Optional[str] = None) -> List[dict]:
        """Get distinct products, optionally filtered by depot."""
        conditions = [StockItem.product_code.isnot(None)]
        if depot_code:
            conditions.append(StockItem.depot_code == depot_code)

        query = (
            select(
                StockItem.product_code,
                StockItem.product_name,
                StockItem.unit_of_measure,
            )
            .where(and_(*conditions))
            .distinct()
            .order_by(StockItem.product_code)
        )
        result = await self.db.execute(query)
        items = result.all()

        return [
            {
                "code": item.product_code,
                "name": item.product_name or item.product_code,
                "unitOfMeasure": item.unit_of_measure,
            }
            for item in items
            if item.product_code
        ]

