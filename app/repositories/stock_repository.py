"""
Stock Repository
================
Encapsulates all PostgreSQL scdp target database queries for physical stock inventory.
"""

from typing import Optional, List, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.models.scdp import TStockPhys, TDepot, TProduit, TDistributeur


class StockRepository:
    """Repository accessing scdp.tstockphys data."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def find_all_stocks(
        self,
        page: int = 1,
        limit: int = 10,
        product_code: Optional[str] = None,
        depot_code: Optional[str] = None,
        distributor_code: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[TStockPhys], int]:
        """Find paginated stock items with optional filters and text search."""
        query = select(TStockPhys)

        filters = []
        if product_code:
            filters.append(TStockPhys.code_prod == product_code)
        if depot_code:
            filters.append(TStockPhys.code_depot == depot_code)
        if distributor_code:
            filters.append(TStockPhys.code_dis == distributor_code)
        if search:
            filters.append(
                or_(
                    TStockPhys.code_depot.ilike(f"%{search}%"),
                    TStockPhys.code_prod.ilike(f"%{search}%"),
                    TStockPhys.code_dis.ilike(f"%{search}%"),
                )
            )

        if filters:
            query = query.where(*filters)

        count_stmt = select(func.count()).select_from(query.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        query = query.order_by(TStockPhys.id_pcfp_stk_phys_jour.desc()).offset((page - 1) * limit).limit(limit)
        res = await self.db.execute(query)
        items = list(res.scalars().all())

        return items, total

    async def find_by_id(self, stock_id: int) -> Optional[TStockPhys]:
        """Find stock record by IDPCFPSTKPHYSJOUR."""
        stmt = select(TStockPhys).where(TStockPhys.id_pcfp_stk_phys_jour == stock_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()
