"""
SQL Server Source Adapter
=========================
Dedicated module for reading source data from SQL Server BDGSM master database.
Strictly read-only operations (connect, read_rows, read_count).
Does not depend on PostgreSQL or target models.
"""

import logging
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.config import settings

logger = logging.getLogger(__name__)


class SqlServerSourceAdapter:
    """Read-only source adapter for SQL Server BDGSM database."""

    def __init__(self) -> None:
        self.host = settings.source_host
        self.port = settings.source_port
        self.database = settings.source_name
        self.user = settings.source_user
        self.password = settings.source_password
        self.schema = settings.source_schema
        self.driver = settings.SCDP_SOURCE_DB_DRIVER
        self.use_mock = settings.SYNC_USE_MOCK
        self._connected: bool = False

    async def connect(self) -> None:
        """Establish connection to SQL Server DB or initialize mock fallback."""
        if self.use_mock or not settings.scdp_is_configured:
            logger.info("SqlServerSourceAdapter: Running in MOCK mode (simulated connection).")
            self._connected = True
            return

        try:
            await asyncio.to_thread(self._test_connection)
            self._connected = True
            logger.info("SqlServerSourceAdapter: connected to SQL Server %s:%s/%s", self.host, self.port, self.database)
        except Exception as exc:
            logger.error("SqlServerSourceAdapter: connection failed — %s", exc)
            self._connected = False
            raise

    def _test_connection(self) -> None:
        import pyodbc
        # Use Windows Authentication if username/password are empty
        if not self.user and not self.password:
            conn_str = (
                f"DRIVER={{{self.driver}}};"
                f"SERVER={self.host},{self.port};"
                f"DATABASE={self.database};"
                f"Trusted_Connection=yes;"
                f"TrustServerCertificate=yes;"
            )
        else:
            conn_str = (
                f"DRIVER={{{self.driver}}};"
                f"SERVER={self.host},{self.port};"
                f"DATABASE={self.database};"
                f"UID={self.user};"
                f"PWD={self.password};"
                f"TrustServerCertificate=yes;"
            )
        conn = pyodbc.connect(conn_str, timeout=10)
        conn.close()

    async def disconnect(self) -> None:
        """Close connection."""
        self._connected = False
        logger.info("SqlServerSourceAdapter: disconnected.")

    async def read_rows(
        self,
        table_name: str,
        limit: int = 1000,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Read rows from source table."""
        if self.use_mock or not settings.scdp_is_configured:
            return self._get_mock_rows(table_name, limit)

        return await asyncio.to_thread(self._sync_read_rows, table_name, limit, offset)

    def _sync_read_rows(self, table_name: str, limit: int, offset: int) -> List[Dict[str, Any]]:
        import pyodbc
        # Use Windows Authentication if username/password are empty
        if not self.user and not self.password:
            conn_str = (
                f"DRIVER={{{self.driver}}};"
                f"SERVER={self.host},{self.port};"
                f"DATABASE={self.database};"
                f"Trusted_Connection=yes;"
                f"TrustServerCertificate=yes;"
            )
        else:
            conn_str = (
                f"DRIVER={{{self.driver}}};"
                f"SERVER={self.host},{self.port};"
                f"DATABASE={self.database};"
                f"UID={self.user};"
                f"PWD={self.password};"
                f"TrustServerCertificate=yes;"
            )
        query = f"SELECT * FROM [{self.schema}].[{table_name}] ORDER BY 1 OFFSET {offset} ROWS FETCH NEXT {limit} ROWS ONLY"
        try:
            with pyodbc.connect(conn_str) as conn:
                cursor = conn.cursor()
                cursor.execute(query)
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
        except Exception as exc:
            logger.error("Error reading SQL Server table %s: %s", table_name, exc)
            raise

    async def read_count(self, table_name: str) -> int:
        """Get row count from source table."""
        if self.use_mock or not settings.scdp_is_configured:
            return len(self._get_mock_rows(table_name, 1000))

        return await asyncio.to_thread(self._sync_read_count, table_name)

    def _sync_read_count(self, table_name: str) -> int:
        import pyodbc
        # Use Windows Authentication if username/password are empty
        if not self.user and not self.password:
            conn_str = (
                f"DRIVER={{{self.driver}}};"
                f"SERVER={self.host},{self.port};"
                f"DATABASE={self.database};"
                f"Trusted_Connection=yes;"
                f"TrustServerCertificate=yes;"
            )
        else:
            conn_str = (
                f"DRIVER={{{self.driver}}};"
                f"SERVER={self.host},{self.port};"
                f"DATABASE={self.database};"
                f"UID={self.user};"
                f"PWD={self.password};"
                f"TrustServerCertificate=yes;"
            )
        query = f"SELECT COUNT(*) FROM [{self.schema}].[{table_name}]"
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            row = cursor.fetchone()
            return row[0] if row else 0

    def _get_mock_rows(self, table_name: str, limit: int) -> List[Dict[str, Any]]:
        t_upper = table_name.upper()
        mock_data: Dict[str, List[Dict[str, Any]]] = {
            "TVILLE": [
                {"CODEVILLE": 1, "VILLENOM": "Bafoussam"},
                {"CODEVILLE": 2, "VILLENOM": "Douala"},
                {"CODEVILLE": 3, "VILLENOM": "Yaoundé"},
            ],
            "TDEPOT": [
                {"CodeVille": 1, "CodeDepot": "BA", "DepotNom": "Dépôt Bafoussam", "DepotBP": "BP 12", "DepotTel": "233400000"},
                {"CodeVille": 2, "CodeDepot": "SU", "DepotNom": "Dépôt Sud", "DepotBP": "BP 45", "DepotTel": "233500000"},
                {"CodeVille": 3, "CodeDepot": "GP", "DepotNom": "Grand Port Douala", "DepotBP": "BP 88", "DepotTel": "233600000"},
            ],
            "TPRODUIT": [
                {"CodeProd": "BA", "ProdNom": "Pétrole Lampant", "ProdPriorite": 1},
                {"CodeProd": "SU", "ProdNom": "Super Carburant", "ProdPriorite": 2},
                {"CodeProd": "GP", "ProdNom": "Gazole Premium", "ProdPriorite": 3},
            ],
            "TDISTRIBUTEUR": [
                {"CodeDis": "BA", "DisNom": "Distributeur Bafoussam", "DisPriorite": 1, "DisTSPP": 1, "DisExport": 0},
                {"CodeDis": "SU", "DisNom": "Distributeur Sud", "DisPriorite": 2, "DisTSPP": 0, "DisExport": 1},
                {"CodeDis": "GP", "DisNom": "Groupement Pétrolier", "DisPriorite": 3, "DisTSPP": 1, "DisExport": 0},
            ],
            "TSTOCKPHYS": [
                {
                    "IDPCFPSTKPHYSJOUR": 100,
                    "CODEDEPOT": "BA",
                    "CODEDIS": "GP",
                    "CODEPROD": "SU",
                    "DateTrait": datetime(2026, 8, 20, 8, 0, 0),
                    "DateJaugeage": datetime(2026, 8, 20, 7, 30, 0),
                    "DateVeille": datetime(2026, 8, 19, 18, 0, 0),
                    "stockta": 500,
                    "stock15": 490,
                    "pgta": 50,
                    "pg15": 45,
                },
                {
                    "IDPCFPSTKPHYSJOUR": 101,
                    "CODEDEPOT": "SU",
                    "CODEDIS": "SU",
                    "CODEPROD": "BA",
                    "DateTrait": datetime(2026, 8, 21, 8, 0, 0),
                    "DateJaugeage": datetime(2026, 8, 21, 7, 30, 0),
                    "DateVeille": datetime(2026, 8, 20, 18, 0, 0),
                    "stockta": 1200,
                    "stock15": 1180,
                    "pgta": 120,
                    "pg15": 115,
                },
            ],
            "TREGUL": [
                {"CODEREGUL": "REG_001", "REGULNOM": "Régularisation Mensuelle", "CODEDEPOT": "BA", "CODEPROD": "SU", "CODEDISCRE": "GP", "CODEDISDEB": "BA", "CODETYPEREGUL": "REG"},
            ],
            "TRECEPTION": [
                {"NUMREC": "REC_2026_01", "CODEDEPOT": "BA", "CODEDIS": "GP", "CODEPROD": "SU", "DATEREC": datetime(2026, 8, 1, 10, 0, 0), "QTEREC": 15000.0, "CODETYPEBOR": "BOR_C", "CODEMODETRANS": "CAMION", "QTEREC_15": 14850.0, "NUMMATRICULE": "MAT_001", "NUMBE": "BE_001", "HEURECHARGEMENT": datetime(2026, 8, 1, 9, 30, 0)},
                {"NUMREC": "REC_2026_02", "CODEDEPOT": "SU", "CODEDIS": "SU", "CODEPROD": "BA", "DATEREC": datetime(2026, 8, 2, 11, 0, 0), "QTEREC": 25000.0, "CODETYPEBOR": "BOR_W", "CODEMODETRANS": "WAGON", "QTEREC_15": 24750.0, "NUMMATRICULE": "MAT_002", "NUMBE": "BE_002", "HEURECHARGEMENT": datetime(2026, 8, 2, 10, 45, 0)},
            ],
            "TSORTIE": [
                {"NUMBOR": "BOR_2026_01", "CODEDEPOT": "BA", "CODEDIS": "GP", "CODEPROD": "SU", "DATESORTIE": datetime(2026, 8, 3, 14, 0, 0), "QTESORTIE": 5000.0, "CODEORIG": "ORIG_01", "CODEMODETRANS": "CAMION", "QTECH_15": 4950.0, "NUMMATRICULE": "MAT_101", "DATEBE": datetime(2026, 8, 4, 16, 0, 0), "DSEECH_TA": 4980.0, "DSEECH_15": 4930.0},
                {"NUMBOR": "BOR_2026_02", "CODEDEPOT": "SU", "CODEDIS": "SU", "CODEPROD": "BA", "DATESORTIE": datetime(2026, 8, 4, 15, 0, 0), "QTESORTIE": 8000.0, "CODEORIG": "ORIG_02", "CODEMODETRANS": "WAGON", "QTECH_15": 7920.0, "NUMMATRICULE": "MAT_102", "DATEBE": datetime(2026, 8, 5, 17, 0, 0), "DSEECH_TA": 7950.0, "DSEECH_15": 7870.0},
            ],
            "TPERTE": [
                {"CODEDEPOT": "BA", "CODEPROD": "SU", "DATEPERTE": datetime(2026, 8, 5, 9, 0, 0), "QTEPERTE": 150.0},
            ],
            "TREGULARISATION": [
                {"CODEREGUL": "REG_001", "CODEDEPOT": "BA", "CODEPROD": "SU", "DATEREGUL": datetime(2026, 8, 6, 10, 0, 0), "QTEREGUL": 300.0},
            ],
            "TDESTINATION": [{"CODEDEST": "DEST_01", "DESTNOM": "Destination Centre"}],
            "TORIGINE": [{"CODEORIG": "ORIG_01", "ORIGNOM": "Origine Port Douala"}],
            "TMODETRANS": [{"CODEMODE": "WAGON", "MODENOM": "Transport Wagon Citerne"}],
            "TTYPEBOR": [{"CODETYPEBOR": "BOR_C", "TYPEBORNOM": "Bordereau Camion"}],
            "TTYPEREGUL": [{"CODETYPEREGUL": "REG", "TYPEREGULNOM": "Régularisation Standard"}],
            "TWAGON": [{"CODEWAGON": "WAG_01", "WAGONNOM": "Wagon Citerne A", "CAPAWAGON": 45000.0}],
            "TSTSECURITE": [{"CODEDEPOT": "BA", "CODEPROD": "SU", "QTESECURITE": 50000.0}],
            "TSTKOUTIL": [{"CODEDEPOT": "BA", "CODEPROD": "SU", "QTEOUTIL": 20000.0}],
        }
        return mock_data.get(t_upper, [])[:limit]
