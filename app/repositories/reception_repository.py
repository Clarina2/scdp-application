"""
Reception Repository
====================
Encapsulates all PostgreSQL scdp target database queries for petroleum inbound receptions.
"""

from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.models.scdp import TReception, TDepot, TProduit, TDistributeur


class ReceptionRepository:
    """Repository accessing scdp.treception data."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def find_all_receptions(
        self,
        page: int = 1,
        limit: int = 10,
        product_code: Optional[str] = None,
        depot_code: Optional[str] = None,
        distributor_code: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[TReception], int]:
        """Find paginated receptions with optional filters."""
        query = select(TReception)

        filters = []
        if product_code:
            filters.append(TReception.code_prod == product_code)
        if depot_code:
            filters.append(TReception.code_depot == depot_code)
        if distributor_code:
            filters.append(TReception.code_dis == distributor_code)
        if search:
            filters.append(
                or_(
                    TReception.num_rec.ilike(f"%{search}%"),
                    TReception.code_depot.ilike(f"%{search}%"),
                    TReception.code_prod.ilike(f"%{search}%"),
                )
            )

        if filters:
            query = query.where(*filters)

        count_stmt = select(func.count()).select_from(query.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        query = query.order_by(TReception.reception_id.desc()).offset((page - 1) * limit).limit(limit)
        res = await self.db.execute(query)
        items = list(res.scalars().all())

        return items, total

    async def find_by_id(self, reception_id: int) -> Optional[TReception]:
        """Find reception record by local technical reception_id."""
        stmt = select(TReception).where(TReception.reception_id == reception_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()
