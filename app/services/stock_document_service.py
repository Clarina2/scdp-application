from datetime import date, datetime
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.stock_document import StockDocument
from app.models.scdp import TDepot, TDistributeur
from app.models.user import User, Role
from app.common.exceptions.custom import BadRequestException


VALID_STATEMENT_TYPES = {"JOURNALIER", "MENSUEL"}


def parse_iso_date(value: Optional[str], field_label: str) -> Optional[date]:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        raise BadRequestException(f"{field_label} doit etre au format YYYY-MM-DD.")


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
        statement_type: Optional[str] = None,
        statement_start_date: Optional[date] = None,
        statement_end_date: Optional[date] = None,
    ) -> StockDocument:
        """Create and persist a stock document record."""
        if not statement_type:
            raise BadRequestException("Type d'etat obligatoire.")
        if statement_type not in VALID_STATEMENT_TYPES:
            raise BadRequestException("Type d'etat invalide. Valeurs autorisees: JOURNALIER, MENSUEL.")
        if not statement_start_date or not statement_end_date:
            raise BadRequestException("Date debut et Date fin de la periode sont obligatoires.")
        if statement_start_date > statement_end_date:
            raise BadRequestException("Date debut ne peut pas etre apres Date fin.")

        depot_res = await self.db.execute(
            select(TDepot).where(TDepot.code_depot == depot_code)
        )
        depot = depot_res.scalar_one_or_none()
        if not depot:
            raise BadRequestException(f"Depot invalide (code: '{depot_code}')")

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
            statement_type=statement_type,
            statement_start_date=statement_start_date,
            statement_end_date=statement_end_date,
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
        statement_type: Optional[str] = None,
        statement_start_date: Optional[str] = None,
        statement_end_date: Optional[str] = None,
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
                StockDocument.statement_type,
                StockDocument.statement_start_date,
                StockDocument.statement_end_date,
                StockDocument.created_at,
            )
            .outerjoin(TDepot, StockDocument.depot_code == TDepot.code_depot)
            .outerjoin(TDistributeur, StockDocument.distributor_code == TDistributeur.code_dis)
            .outerjoin(User, StockDocument.uploaded_by == User.id)
        )

        filters = []

        if current_user and current_user.role == Role.MARKETER:
            if current_user.distributor_code:
                filters.append(StockDocument.distributor_code == current_user.distributor_code)
            else:
                filters.append(StockDocument.distributor_code == "__UNASSIGNED__")
        elif distributor_code:
            filters.append(StockDocument.distributor_code == distributor_code)

        if depot_code:
            filters.append(StockDocument.depot_code == depot_code)

        upload_start_day = parse_iso_date(start_date, "Date d'upload debut")
        upload_end_day = parse_iso_date(end_date, "Date d'upload fin")
        if upload_start_day and upload_end_day and upload_start_day > upload_end_day:
            raise BadRequestException("Date d'upload debut ne peut pas etre apres Date d'upload fin.")
        if upload_start_day:
            filters.append(StockDocument.created_at >= datetime.combine(upload_start_day, datetime.min.time()))
        if upload_end_day:
            filters.append(StockDocument.created_at <= datetime.combine(upload_end_day, datetime.max.time()))

        if statement_type:
            if statement_type not in VALID_STATEMENT_TYPES:
                raise BadRequestException("Type d'etat invalide. Valeurs autorisees: JOURNALIER, MENSUEL.")
            filters.append(StockDocument.statement_type == statement_type)

        statement_start_day = parse_iso_date(statement_start_date, "Date debut de l'etat")
        statement_end_day = parse_iso_date(statement_end_date, "Date fin de l'etat")
        if statement_start_day and statement_end_day and statement_start_day > statement_end_day:
            raise BadRequestException("Date debut de l'etat ne peut pas etre apres Date fin de l'etat.")
        if statement_start_day:
            filters.append(StockDocument.statement_end_date >= statement_start_day)
        if statement_end_day:
            filters.append(StockDocument.statement_start_date <= statement_end_day)

        if filters:
            stmt = stmt.where(*filters)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

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
                "statementType": r.statement_type,
                "statementStartDate": r.statement_start_date.isoformat() if r.statement_start_date else None,
                "statementEndDate": r.statement_end_date.isoformat() if r.statement_end_date else None,
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
