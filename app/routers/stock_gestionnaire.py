# -*- coding: utf-8 -*-
import os
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.common.decorators.current_user import get_current_user, get_effective_user
from app.models.user import User, Role
from app.services.storage_service import StorageService
from app.services.stock_document_service import StockDocumentService, VALID_STATEMENT_TYPES, parse_iso_date

router = APIRouter()


def get_stock_document_service(db: AsyncSession = Depends(get_db)) -> StockDocumentService:
    return StockDocumentService(db)


def get_storage_service() -> StorageService:
    return StorageService()


@router.post("/documents")
async def upload_stock_document(
    depot_code: str = Form(..., description="Technical code of the depot (e.g., 'BA', 'YC')"),
    distributor_code: str = Form(..., description="Technical code of the distributor/marketer (e.g., 'AB', 'TF')"),
    statement_type: str = Form(..., description="Statement type: JOURNALIER or MENSUEL"),
    statement_start_date: str = Form(..., description="Statement period start date (YYYY-MM-DD)"),
    statement_end_date: str = Form(..., description="Statement period end date (YYYY-MM-DD)"),
    file: UploadFile = File(..., description="PDF document file"),
    current_user: User = Depends(get_current_user),
    doc_service: StockDocumentService = Depends(get_stock_document_service),
    storage_service: StorageService = Depends(get_storage_service),
):
    """Upload a stock PDF document (Stock Gestionnaire & Admin).

    Validates file type (PDF only), size limit (10MB max), and persists file & metadata.
    """
    if current_user.role not in [Role.STOCK_GESTIONNAIRE, Role.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden (Stock Gestionnaire or Admin only)",
        )

    normalized_statement_type = statement_type.strip().upper()
    if normalized_statement_type not in VALID_STATEMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type d'etat invalide. Valeurs autorisees: JOURNALIER, MENSUEL.",
        )

    parsed_statement_start_date = parse_iso_date(statement_start_date, "Date debut")
    parsed_statement_end_date = parse_iso_date(statement_end_date, "Date fin")

    if not parsed_statement_start_date or not parsed_statement_end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date debut et Date fin de la periode sont obligatoires.",
        )

    if parsed_statement_start_date > parsed_statement_end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date debut ne peut pas etre apres Date fin.",
        )


    orig_name, storage_path, file_size, mime_type = await storage_service.save_pdf_file(file)

    doc = await doc_service.create_document(
        depot_code=depot_code,
        distributor_code=distributor_code,
        uploaded_by=current_user.id,
        file_name=orig_name,
        storage_path=storage_path,
        mime_type=mime_type,
        file_size=file_size,
        statement_type=normalized_statement_type,
        statement_start_date=parsed_statement_start_date,
        statement_end_date=parsed_statement_end_date,
    )

    return {
        "id": doc.id,
        "fileName": doc.file_name,
        "depotCode": doc.depot_code,
        "distributorCode": doc.distributor_code,
        "statementType": doc.statement_type,
        "statementStartDate": doc.statement_start_date.isoformat() if doc.statement_start_date else None,
        "statementEndDate": doc.statement_end_date.isoformat() if doc.statement_end_date else None,
        "uploadedAt": doc.created_at.isoformat() if doc.created_at else None,
        "status": "uploaded",
    }


@router.get("/documents")
async def list_stock_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    depot_code: Optional[str] = Query(None),
    distributor_code: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None, description="Filter upload timestamp from date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter upload timestamp to date inclusive (YYYY-MM-DD)"),
    statement_type: Optional[str] = Query(None, description="Filter by statement type (JOURNALIER or MENSUEL)"),
    statement_start_date: Optional[str] = Query(None, description="Filter statement periods overlapping from this date (YYYY-MM-DD)"),
    statement_end_date: Optional[str] = Query(None, description="Filter statement periods overlapping to this date (YYYY-MM-DD)"),
    effective_user: User = Depends(get_effective_user),
    doc_service: StockDocumentService = Depends(get_stock_document_service),
):
    """List paginated stock documents (Stock Gestionnaire, Admin, and Marketer)."""
    if effective_user.role not in [Role.STOCK_GESTIONNAIRE, Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

    effective_distributor_code = distributor_code
    if effective_user.role == Role.MARKETER:
        if not effective_user.distributor_code:
            return {
                "items": [],
                "total": 0,
                "page": page,
                "limit": limit,
                "totalPages": 1,
                "meta": {
                    "total": 0,
                    "page": page,
                    "limit": limit,
                    "total_pages": 1,
                    "has_next_page": False,
                    "has_previous_page": False,
                },
            }
        effective_distributor_code = effective_user.distributor_code

    items, total = await doc_service.find_documents(
        page=page,
        limit=limit,
        depot_code=depot_code,
        distributor_code=effective_distributor_code,
        start_date=start_date,
        end_date=end_date,
        statement_type=statement_type.strip().upper() if statement_type else None,
        statement_start_date=statement_start_date,
        statement_end_date=statement_end_date,
        current_user=effective_user,
    )

    total_pages = (total + limit - 1) // limit if limit > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": total_pages,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next_page": page < total_pages,
            "has_previous_page": page > 1,
        },
    }


@router.get("/documents/{document_id}/file")
async def download_stock_document_file(
    document_id: str,
    effective_user: User = Depends(get_effective_user),
    doc_service: StockDocumentService = Depends(get_stock_document_service),
    storage_service: StorageService = Depends(get_storage_service),
):
    """Securely download/view PDF file by document ID."""
    if effective_user.role not in [Role.STOCK_GESTIONNAIRE, Role.ADMIN, Role.MARKETER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

    doc = await doc_service.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document introuvable",
        )

    if effective_user.role == Role.MARKETER:
        if not effective_user.distributor_code or doc.distributor_code != effective_user.distributor_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acc�s non autoris� � ce document",
            )

    abs_path = storage_service.get_absolute_path(doc.storage_path)

    return FileResponse(
        path=abs_path,
        media_type=doc.mime_type or "application/pdf",
        filename=doc.file_name,
        headers={
            "Content-Disposition": f'inline; filename="{doc.file_name}"'
        }
    )
