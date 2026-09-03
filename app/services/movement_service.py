"""
Movement & Transaction Query Service
====================================
Service for querying receptions (TRECEPTION), exits (TSORTIE), and regulations (TREGUL).
Uses SQL joins on scdp reference tables (tdepot, tproduit, tdistributeur).
"""

from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, text
from datetime import datetime

from app.models.scdp import (
    TReception, TSortie, TRegul, TDepot, TProduit, TDistributeur,
    TModeTrans, TOrigine, TTypeBor
)


class MovementService:
    """Service querying replicated movements and transactions from scdp schema."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def find_receptions(
        self,
        page: int = 1,
        limit: int = 10,
        depot_code: Optional[str] = None,
        product_code: Optional[str] = None,
        distributor_code: Optional[str] = None,
        search: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Find paginated receptions with JOIN on depot, product, distributeur."""
        stmt = (
            select(
                TReception.reception_id,
                TReception.num_rec,
                TReception.code_depot,
                TDepot.depot_nom,
                TReception.code_prod,
                TProduit.prod_nom,
                TReception.code_dis,
                TDistributeur.dis_nom,
                TReception.date_rec,
                TReception.qte_rec,
                TReception.code_mode_trans,
                TModeTrans.mode_nom,
                TReception.qte_rec_15,
                TReception.num_matricule,
                TReception.num_be,
                TReception.heure_chargement,
                TReception.date_depart,
                TReception.temp_ech_arr,
                TReception.dse_ech,
                TReception.coul_ar_ta,
                TReception.coul_ar_15,
                TReception.created_at,
            )
            .outerjoin(TDepot, TReception.code_depot == TDepot.code_depot)
            .outerjoin(TProduit, TReception.code_prod == TProduit.code_prod)
            .outerjoin(TDistributeur, TReception.code_dis == TDistributeur.code_dis)
            .outerjoin(TModeTrans, TReception.code_mode_trans == TModeTrans.code_mode)
        )

        filters = []
        # Marketer scope enforcement
        if distributor_code:
            filters.append(TReception.code_dis == distributor_code)
        
        if depot_code:
            filters.append(TReception.code_depot == depot_code)
        if product_code:
            filters.append(TReception.code_prod == product_code)
        if search:
            filters.append(
                or_(
                    TReception.num_rec.ilike(f"%{search}%"),
                    TDepot.depot_nom.ilike(f"%{search}%"),
                    TProduit.prod_nom.ilike(f"%{search}%"),
                )
            )

        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                filters.append(TReception.date_rec >= start_dt)
            except ValueError:
                pass

        if end_date:
            try:
                from datetime import timedelta
                end_dt = datetime.fromisoformat(end_date)
                # Make end_date inclusive: capture all records up through end of that day
                end_dt_inclusive = end_dt + timedelta(days=1)
                filters.append(TReception.date_rec < end_dt_inclusive)
            except ValueError:
                pass

        if filters:
            stmt = stmt.where(*filters)

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        # Order by date_rec DESC (nulls last), then reception_id DESC for stable ordering
        from sqlalchemy import nullslast, desc
        stmt = stmt.order_by(
            nullslast(desc(TReception.date_rec)),
            TReception.reception_id.desc()
        ).offset((page - 1) * limit).limit(limit)
        res = await self.db.execute(stmt)
        rows = res.fetchall()

        items = [
            {
                # Primary identifiers
                "id": r.reception_id,
                # Bordereau / reception number (num_rec maps to BDGSM NUMREC)
                "numBor": r.num_rec,
                "receptionNumber": r.num_rec,
                # Depot
                "depotCode": r.code_depot,
                "depotName": r.depot_nom or r.code_depot,
                # Product
                "productCode": r.code_prod,
                "productName": r.prod_nom or r.code_prod,
                # Distributor (marketer)
                "distributorCode": r.code_dis,
                "distributorName": r.dis_nom,
                # Date — date_rec is the ENTRÉE/reception date (DATEREC from BDGSM)
                "date": r.date_rec.isoformat() if r.date_rec else None,
                "receptionDate": r.date_rec.isoformat() if r.date_rec else None,
                # Quantities — qte_rec is the received quantity TA
                "qteTA": r.qte_rec,
                "quantity": r.qte_rec,
                # Additional fields from BDGSM TRECEPTION
                "qte15": r.qte_rec_15,
                "modeTransfert": r.mode_nom if r.code_mode_trans else None,
                "numMatricule": r.num_matricule,
                "numBE": r.num_be,
                "heureChargement": r.heure_chargement.isoformat() if r.heure_chargement else None,
                # Additional TRECEPTION fields
                "dateDepart": r.date_depart.isoformat() if r.date_depart else None,
                "tempEchArr": r.temp_ech_arr,
                "dseEch": r.dse_ech,
                "coulArTA": r.coul_ar_ta,
                "coulAr15": r.coul_ar_15,
                # Metadata
                "createdAt": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]

        return items, total

    async def find_exits(
        self,
        page: int = 1,
        limit: int = 10,
        depot_code: Optional[str] = None,
        product_code: Optional[str] = None,
        distributor_code: Optional[str] = None,
        search: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Find paginated exits (TSORTIE) with JOIN on depot, product, distributeur."""
        stmt = (
            select(
                TSortie.sortie_id,
                TSortie.num_bor,
                TSortie.code_depot,
                TDepot.depot_nom,
                TSortie.code_prod,
                TProduit.prod_nom,
                TSortie.code_dis,
                TDistributeur.dis_nom,
                TSortie.date_sortie,
                TSortie.qte_sortie,
                TSortie.code_type_bor,
                TTypeBor.type_bor_nom,
                TSortie.code_orig,
                TOrigine.orig_nom,
                TSortie.code_mode_trans,
                TModeTrans.mode_nom,
                TSortie.qte_ch_15,
                TSortie.num_matricule,
                TSortie.num_be,
                TSortie.date_be,
                TSortie.dse_ech_ta,
                TSortie.dse_ech_15,
                TSortie.heure_chargement,
                TSortie.created_at,
            )
            .outerjoin(TDepot, TSortie.code_depot == TDepot.code_depot)
            .outerjoin(TProduit, TSortie.code_prod == TProduit.code_prod)
            .outerjoin(TDistributeur, TSortie.code_dis == TDistributeur.code_dis)
            .outerjoin(TTypeBor, TSortie.code_type_bor == TTypeBor.code_type_bor)
            .outerjoin(TOrigine, TSortie.code_orig == TOrigine.code_orig)
            .outerjoin(TModeTrans, TSortie.code_mode_trans == TModeTrans.code_mode)
        )

        filters = []
        # Marketer scope enforcement
        if distributor_code:
            filters.append(TSortie.code_dis == distributor_code)
        
        if depot_code:
            filters.append(TSortie.code_depot == depot_code)
        if product_code:
            filters.append(TSortie.code_prod == product_code)
        if search:
            filters.append(
                or_(
                    TSortie.num_bor.ilike(f"%{search}%"),
                    TDepot.depot_nom.ilike(f"%{search}%"),
                    TProduit.prod_nom.ilike(f"%{search}%"),
                )
            )

        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                filters.append(TSortie.date_sortie >= start_dt)
            except ValueError:
                pass

        if end_date:
            try:
                from datetime import timedelta
                end_dt = datetime.fromisoformat(end_date)
                # Inclusive end: capture all records up through end of that day
                end_dt_inclusive = end_dt + timedelta(days=1)
                filters.append(TSortie.date_sortie < end_dt_inclusive)
            except ValueError:
                pass

        if filters:
            stmt = stmt.where(*filters)

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        # Order by date_sortie DESC (nulls last), then sortie_id DESC for stable ordering
        from sqlalchemy import nullslast, desc
        stmt = stmt.order_by(
            nullslast(desc(TSortie.date_sortie)),
            TSortie.sortie_id.desc()
        ).offset((page - 1) * limit).limit(limit)
        res = await self.db.execute(stmt)
        rows = res.fetchall()

        items = [
            {
                # Primary identifier
                "id": r.sortie_id,
                # Bordereau number (num_bor maps to BDGSM NUMBOR)
                "numBor": r.num_bor,
                "borderauNumber": r.num_bor,
                # Depot — full name from JOIN
                "depotCode": r.code_depot,
                "depotName": r.depot_nom or r.code_depot,
                # Product — full name from JOIN
                "productCode": r.code_prod,
                "productName": r.prod_nom or r.code_prod,
                # Distributor (marketer)
                "distributorCode": r.code_dis,
                "distributorName": r.dis_nom,
                # Date — date_sortie is the SORTIE/departure date (DATESORTIE from BDGSM)
                "dateSortie": r.date_sortie.isoformat() if r.date_sortie else None,
                "exitDate": r.date_sortie.isoformat() if r.date_sortie else None,
                # Quantity — qte_sortie is the loaded quantity TA
                "qteSortie": r.qte_sortie,
                "quantity": r.qte_sortie,
                # Additional fields from BDGSM TSORTIE
                "typeBordereau": r.type_bor_nom if r.code_type_bor else None,
                "origine": r.orig_nom if r.code_orig else None,
                "modeTransport": r.mode_nom if r.code_mode_trans else None,
                "qteCharge15": r.qte_ch_15,
                "numMatricule": r.num_matricule,
                "numBE": r.num_be,
                "dateArrivee": r.date_be.isoformat() if r.date_be else None,
                "qteRecueTA": r.dse_ech_ta,
                "qteRecue15": r.dse_ech_15,
                "heureChargement": r.heure_chargement.isoformat() if r.heure_chargement else None,
                # Metadata
                "createdAt": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]

        return items, total

    async def find_regulations(
        self,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Find paginated regulations (TREGUL)."""
        stmt = (
            select(
                TRegul.code_regul,
                TRegul.regul_nom,
                TRegul.code_depot,
                TDepot.depot_nom,
                TRegul.code_prod,
                TProduit.prod_nom,
                TRegul.code_type_regul,
            )
            .outerjoin(TDepot, TRegul.code_depot == TDepot.code_depot)
            .outerjoin(TProduit, TRegul.code_prod == TProduit.code_prod)
        )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.offset((page - 1) * limit).limit(limit)
        res = await self.db.execute(stmt)
        rows = res.fetchall()

        items = [
            {
                "codeRegul": r.code_regul,
                "name": r.regul_nom,
                "depotCode": r.code_depot,
                "depotName": r.depot_nom,
                "productCode": r.code_prod,
                "productName": r.prod_nom,
                "typeRegulCode": r.code_type_regul,
            }
            for r in rows
        ]

        return items, total

    async def get_movement_depots(self) -> List[dict]:
        """Get distinct depots from movement tables (TRECEPTION, TSORTIE)."""
        # Query from TDepot reference table
        stmt = select(TDepot.code_depot, TDepot.depot_nom).where(
            TDepot.code_depot.isnot(None)
        ).distinct().order_by(TDepot.code_depot)
        
        res = await self.db.execute(stmt)
        rows = res.fetchall()

        return [
            {"code": row.code_depot, "name": row.depot_nom or row.code_depot}
            for row in rows
            if row.code_depot
        ]

    async def get_movement_products(self) -> List[dict]:
        """Get distinct products from movement tables (TRECEPTION, TSORTIE)."""
        # Query from TProduit reference table
        stmt = select(TProduit.code_prod, TProduit.prod_nom).where(
            TProduit.code_prod.isnot(None)
        ).distinct().order_by(TProduit.code_prod)
        
        res = await self.db.execute(stmt)
        rows = res.fetchall()

        return [
            {"code": row.code_prod, "name": row.prod_nom or row.code_prod}
            for row in rows
            if row.code_prod
        ]

    async def get_movement_distributors(self) -> List[dict]:
        """Get distinct distributors from movement tables (TRECEPTION, TSORTIE)."""
        # Query from TDistributeur reference table
        stmt = select(TDistributeur.code_dis, TDistributeur.dis_nom).where(
            TDistributeur.code_dis.isnot(None)
        ).distinct().order_by(TDistributeur.code_dis)
        
        res = await self.db.execute(stmt)
        rows = res.fetchall()

        return [
            {"code": row.code_dis, "name": row.dis_nom or row.code_dis}
            for row in rows
            if row.code_dis
        ]
