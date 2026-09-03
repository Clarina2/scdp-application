from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from sqlalchemy.orm import selectinload

from app.models.stock_document import StockDocument
from app.models.scdp import TDepot, TDistributeur
from app.models.user import User, Role
from app.common.exceptions.custom import NotFoundException, BadRequestException, ForbiddenException


class StockDocumentService:
    """Service managing stock document metadata and database queries."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_document(
        self,
        depot_code: str,
        distributor_code: str,
        uploaded_by: str,
        file_name: str,
        storage_path: str,
        mime_type: str,
        file_size: int,
        document_date: Optional[datetime] = None,
    ) -> StockDocument:
        """Create and persist a stock document record."""
        # Verify depot exists
        depot_res = await self.db.execute(
            select(TDepot).where(TDepot.code_depot == depot_code)
        )
        depot = depot_res.scalar_one_or_none()
        if not depot:
            raise BadRequestException(f"Dépôt invalide (code: '{depot_code}')")

        # Verify distributor exists
        dist_res = await self.db.execute(
            select(TDistributeur).where(TDistributeur.code_dis == distributor_code)
        )
        distributor = dist_res.scalar_one_or_none()
        if not distributor:
            raise BadRequestException(f"Marketer/Distributeur invalide (code: '{distributor_code}')")

        doc = StockDocument(
            depot_code=depot_code,
            distributor_code=distributor_code,
            uploaded_by=uploaded_by,
            file_name=file_name,
            storage_path=storage_path,
            mime_type=mime_type,
            file_size=file_size,
            document_date=document_date or datetime.utcnow(),
        )

        self.db.add(doc)
        await self.db.commit()
        await self.db.refresh(doc)
        return doc

    async def find_documents(
        self,
        page: int = 1,
        limit: int = 10,
        depot_code: Optional[str] = None,
        distributor_code: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        current_user: Optional[User] = None,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Find paginated stock documents with JOIN on depot and distributor."""
        stmt = (
            select(
                StockDocument.id,
                StockDocument.depot_code,
                TDepot.depot_nom,
                StockDocument.distributor_code,
                TDistributeur.dis_nom,
                StockDocument.uploaded_by,
                User.name.label("uploader_name"),
                StockDocument.file_name,
                StockDocument.storage_path,
                StockDocument.mime_type,
                StockDocument.file_size,
                StockDocument.document_date,
                StockDocument.created_at,
            )
            .outerjoin(TDepot, StockDocument.depot_code == TDepot.code_depot)
            .outerjoin(TDistributeur, StockDocument.distributor_code == TDistributeur.code_dis)
            .outerjoin(User, StockDocument.uploaded_by == User.id)
        )

        filters = []

        # Role-based restriction if marketer
        if current_user and current_user.role == Role.MARKETER:
            if current_user.distributor_code:
                filters.append(StockDocument.distributor_code == current_user.distributor_code)
            else:
                filters.append(StockDocument.distributor_code == "__UNASSIGNED__")
        elif distributor_code:
            filters.append(StockDocument.distributor_code == distributor_code)

        if depot_code:
            filters.append(StockDocument.depot_code == depot_code)

        # Date filtering on created_at (upload timestamp)
        if start_date:
            try:
                from datetime import datetime
                start_dt = datetime.strptime(start_date, "%Y-%m-%d")
                filters.append(StockDocument.created_at >= start_dt)
            except ValueError:
                pass
        if end_date:
            try:
                from datetime import datetime
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                # Include entire end day by setting to 23:59:59.999999
                end_dt = end_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
                filters.append(StockDocument.created_at <= end_dt)
            except ValueError:
                pass

        if filters:
            stmt = stmt.where(*filters)

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        # Paginate order by created_at DESC
        stmt = stmt.order_by(StockDocument.created_at.desc()).offset((page - 1) * limit).limit(limit)
        res = await self.db.execute(stmt)
        rows = res.fetchall()

        items = [
            {
                "id": r.id,
                "depotCode": r.depot_code,
                "depotName": r.depot_nom or r.depot_code,
                "distributorCode": r.distributor_code,
                "distributorName": r.dis_nom or r.distributor_code,
                "uploadedBy": r.uploaded_by,
                "uploaderName": r.uploader_name or "Stock Gestionnaire",
                "fileName": r.file_name,
                "mimeType": r.mime_type,
                "fileSize": r.file_size,
                "documentDate": r.document_date.isoformat() if r.document_date else None,
                "uploadedAt": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]

        return items, total

    async def get_document_by_id(self, document_id: str) -> Optional[StockDocument]:
        """Find stock document record by ID."""
        result = await self.db.execute(
            select(StockDocument).where(StockDocument.id == document_id)
        )
        return result.scalar_one_or_none()
