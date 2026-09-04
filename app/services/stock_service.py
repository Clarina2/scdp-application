from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, distinct
from sqlalchemy.orm import selectinload
from app.models.scdp import TStockPhys, TDepot, TProduit, TVille
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
        distributor_code: Optional[str] = None,
    ) -> tuple[List[TStockPhys], int]:
        """Get stock items with filtering and pagination."""
        skip = (page - 1) * limit
        
        # Build where conditions
        conditions = []
        
        # Marketer scope enforcement
        if distributor_code:
            conditions.append(TStockPhys.code_dis == distributor_code)
        
        if product_code:
            conditions.append(TStockPhys.code_prod == product_code)
        if depot_code:
            conditions.append(TStockPhys.code_depot == depot_code)
        
        # Build query
        where_clause = and_(*conditions) if conditions else True
        
        # Get total count
        count_query = select(func.count()).select_from(TStockPhys).where(where_clause)
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Get items with joins
        query = (
            select(TStockPhys)
            .where(where_clause)
            .order_by(TStockPhys.date_trait.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        items = result.scalars().all()
        
        return list(items), total

    async def find_by_scdp_id(
        self, scdp_id: str, distributor_code: Optional[str] = None
    ) -> Optional[TStockPhys]:
        """Find stock item by SCDP ID."""
        conditions = [TStockPhys.id_pcfp_stk_phys_jour == int(scdp_id)]
        if distributor_code:
            conditions.append(TStockPhys.code_dis == distributor_code)
        elif distributor_code == "__UNASSIGNED__":
            return None

        result = await self.db.execute(select(TStockPhys).where(*conditions))
        return result.scalar_one_or_none()

    async def get_regions(self) -> List[dict]:
        """Get distinct regions from TVille."""
        query = (
            select(
                TVille.code_ville,
                TVille.ville_nom,
            )
            .distinct()
            .order_by(TVille.ville_nom)
        )
        result = await self.db.execute(query)
        items = result.all()

        return [
            {
                "code": str(item.code_ville),
                "name": item.ville_nom or str(item.code_ville),
            }
            for item in items
        ]

    async def get_depots(self, region_code: Optional[str] = None) -> List[dict]:
        """Get distinct depots from TDepot, optionally filtered by region."""
        conditions = []
        if region_code:
            conditions.append(TDepot.code_ville == int(region_code))

        query = (
            select(
                TDepot.code_depot,
                TDepot.depot_nom,
                TDepot.code_ville,
            )
            .where(and_(*conditions) if conditions else True)
            .distinct()
            .order_by(TDepot.code_depot)
        )
        result = await self.db.execute(query)
        items = result.all()

        return [
            {
                "code": item.code_depot,
                "name": item.depot_nom or item.code_depot,
                "regionCode": str(item.code_ville) if item.code_ville else None,
            }
            for item in items
            if item.code_depot
        ]

    async def get_products(self, depot_code: Optional[str] = None) -> List[dict]:
        """Get distinct products from TProduit."""
        query = (
            select(
                TProduit.code_prod,
                TProduit.prod_nom,
            )
            .distinct()
            .order_by(TProduit.prod_nom)
        )
        result = await self.db.execute(query)
        items = result.all()

        return [
            {
                "code": item.code_prod,
                "name": item.prod_nom or item.code_prod,
                "unitOfMeasure": "L",
            }
            for item in items
            if item.code_prod
        ]

    async def get_stock_by_product(
        self,
        distributor_code: Optional[str] = None,
        depot_code: Optional[str] = None,
    ) -> List[dict]:
        """Get stock aggregated by product from TStockPhys."""
        conditions = [TStockPhys.code_prod.isnot(None)]
        
        if distributor_code:
            conditions.append(TStockPhys.code_dis == distributor_code)
        if depot_code:
            conditions.append(TStockPhys.code_depot == depot_code)

        # Join with TProduit to get product names
        query = (
            select(
                TStockPhys.code_prod,
                TProduit.prod_nom,
                func.sum(TStockPhys.stock_ta).label('total_quantity'),
            )
            .select_from(TStockPhys)
            .join(TProduit, TStockPhys.code_prod == TProduit.code_prod)
            .where(and_(*conditions))
            .group_by(TStockPhys.code_prod, TProduit.prod_nom)
            .order_by(func.sum(TStockPhys.stock_ta).desc())
        )
        result = await self.db.execute(query)
        items = result.all()

        # Calculate total from positive values only for percentage calculation
        positive_stock = sum(max(0, item.total_quantity or 0) for item in items) if items else 0

        return [
            {
                "code": item.code_prod,
                "name": item.prod_nom or item.code_prod,
                "unitOfMeasure": "L",
                "quantity": float(item.total_quantity or 0),
                "percentage": round((max(0, float(item.total_quantity or 0)) / positive_stock * 100), 1) if positive_stock > 0 else 0,
            }
            for item in items
            if item.code_prod
        ]

