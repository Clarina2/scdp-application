"""
Sortie Repository
=================
Encapsulates all PostgreSQL scdp target database queries for petroleum outbound borderaux exits.
"""

from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.models.scdp import TSortie, TDepot, TProduit, TDistributeur


class SortieRepository:
    """Repository accessing scdp.tsortie data."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def find_all_sorties(
        self,
        page: int = 1,
        limit: int = 10,
        product_code: Optional[str] = None,
        depot_code: Optional[str] = None,
        distributor_code: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[TSortie], int]:
        """Find paginated exits with optional filters."""
        query = select(TSortie)

        filters = []
        if product_code:
            filters.append(TSortie.code_prod == product_code)
        if depot_code:
            filters.append(TSortie.code_depot == depot_code)
        if distributor_code:
            filters.append(TSortie.code_dis == distributor_code)
        if search:
            filters.append(
                or_(
                    TSortie.num_bor.ilike(f"%{search}%"),
                    TSortie.code_depot.ilike(f"%{search}%"),
                    TSortie.code_prod.ilike(f"%{search}%"),
                )
            )

        if filters:
            query = query.where(*filters)

        count_stmt = select(func.count()).select_from(query.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        query = query.order_by(TSortie.sortie_id.desc()).offset((page - 1) * limit).limit(limit)
        res = await self.db.execute(query)
        items = list(res.scalars().all())

        return items, total

    async def find_by_id(self, sortie_id: int) -> Optional[TSortie]:
        """Find exit record by local technical sortie_id."""
        stmt = select(TSortie).where(TSortie.sortie_id == sortie_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()
