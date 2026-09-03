"""
Regul Repository
================
Encapsulates all PostgreSQL scdp target database queries for stock regulation definitions and adjustments.
"""

from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.models.scdp import TRegul, TRegularisation, TDepot, TProduit


class RegulRepository:
    """Repository accessing scdp.tregul and scdp.tregularisation data."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def find_all_reguls(
        self,
        page: int = 1,
        limit: int = 10,
        product_code: Optional[str] = None,
        depot_code: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[TRegul], int]:
        """Find paginated regulation definitions."""
        query = select(TRegul)

        filters = []
        if product_code:
            filters.append(TRegul.code_prod == product_code)
        if depot_code:
            filters.append(TRegul.code_depot == depot_code)
        if search:
            filters.append(
                or_(
                    TRegul.code_regul.ilike(f"%{search}%"),
                    TRegul.regul_nom.ilike(f"%{search}%"),
                    TRegul.code_depot.ilike(f"%{search}%"),
                )
            )

        if filters:
            query = query.where(*filters)

        count_stmt = select(func.count()).select_from(query.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        query = query.order_by(TRegul.code_regul.asc()).offset((page - 1) * limit).limit(limit)
        res = await self.db.execute(query)
        items = list(res.scalars().all())

        return items, total

    async def find_by_code(self, code_regul: str) -> Optional[TRegul]:
        """Find regulation definition by unique CODEREGUL business key."""
        stmt = select(TRegul).where(TRegul.code_regul == code_regul)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()
