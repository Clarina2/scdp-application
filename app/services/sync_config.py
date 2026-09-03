"""
Sync Configuration Service
==========================
Defines table mapping configurations between the SQL Server BDGSM source database
and target PostgreSQL scdp schema models (Stage 1 replication tables).

Configured tables:
1. TDEPOT       -> scdp.tdepot
2. TPRODUIT     -> scdp.tproduit
3. TDISTRIBUTEUR -> scdp.tdistributeur
4. TSTOCKPHYS   -> scdp.tstockphys
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

from app.models.scdp import TDepot, TProduit, TDistributeur, TStockPhys


@dataclass
class TableSyncConfig:
    """Mapping specification for synchronizing a source table to a target model."""

    source_table: str
    target_schema: str
    target_table: str
    target_model: Any
    primary_key_field: str
    source_primary_key_col: str
    source_key: List[str]
    mappings: Dict[str, str]
    date_fields: List[str] = field(default_factory=list)
    decimal_fields: List[str] = field(default_factory=list)


# Master Stage 1 Sync Configuration dictionary
SYNC_TABLES: Dict[str, Dict[str, Any]] = {
    "TDEPOT": {
        "target_schema": "scdp",
        "target_table": "tdepot",
        "target_model": TDepot,
        "source_key": ["CodeDepot"],
        "primary_key_field": "code_depot",
        "source_primary_key_col": "CodeDepot",
        "mappings": {
            "code_ville": "CodeVille",
            "code_depot": "CodeDepot",
            "depot_nom": "DepotNom",
            "depot_bp": "DepotBP",
            "depot_tel": "DepotTel",
        },
    },
    "TPRODUIT": {
        "target_schema": "scdp",
        "target_table": "tproduit",
        "target_model": TProduit,
        "source_key": ["CodeProd"],
        "primary_key_field": "code_prod",
        "source_primary_key_col": "CodeProd",
        "mappings": {
            "code_prod": "CodeProd",
            "prod_nom": "ProdNom",
            "prod_priorite": "ProdPriorite",
        },
    },
    "TDISTRIBUTEUR": {
        "target_schema": "scdp",
        "target_table": "tdistributeur",
        "target_model": TDistributeur,
        "source_key": ["CodeDis"],
        "primary_key_field": "code_dis",
        "source_primary_key_col": "CodeDis",
        "mappings": {
            "code_dis": "CodeDis",
            "dis_nom": "DisNom",
            "dis_priorite": "DisPriorite",
            "dis_tspp": "DisTSPP",
            "dis_export": "DisExport",
        },
    },
    "TSTOCKPHYS": {
        "target_schema": "scdp",
        "target_table": "tstockphys",
        "target_model": TStockPhys,
        "source_key": ["IDPCFPSTKPHYSJOUR"],
        "primary_key_field": "id_pcfp_stk_phys_jour",
        "source_primary_key_col": "IDPCFPSTKPHYSJOUR",
        "mappings": {
            "id_pcfp_stk_phys_jour": "IDPCFPSTKPHYSJOUR",
            "code_depot": "CODEDEPOT",
            "code_dis": "CODEDIS",
            "code_prod": "CODEPROD",
            "date_trait": "DateTrait",
            "date_jaugeage": "DateJaugeage",
            "date_veille": "DateVeille",
            "stock_ta": "stockta",
            "stock_15": "stock15",
            "pg_ta": "pgta",
            "pg_15": "pg15",
        },
        "date_fields": ["date_trait", "date_jaugeage", "date_veille"],
    },
}

# Ordered list of source tables for Stage 1 replication
SYNC_ORDER: List[str] = ["TDEPOT", "TPRODUIT", "TDISTRIBUTEUR", "TSTOCKPHYS"]


class SyncConfigService:
    """Provides table synchronization configuration settings."""

    def get_configs(self) -> List[TableSyncConfig]:
        """Get list of active table sync configurations in order."""
        configs = []
        for source_table in SYNC_ORDER:
            cfg = SYNC_TABLES[source_table]
            configs.append(
                TableSyncConfig(
                    source_table=source_table,
                    target_schema=cfg["target_schema"],
                    target_table=cfg["target_table"],
                    target_model=cfg["target_model"],
                    primary_key_field=cfg["primary_key_field"],
                    source_primary_key_col=cfg["source_primary_key_col"],
                    source_key=cfg["source_key"],
                    mappings=cfg["mappings"],
                    date_fields=cfg.get("date_fields", []),
                    decimal_fields=cfg.get("decimal_fields", []),
                )
            )
        return configs

    def get_config_for_table(self, source_table: str) -> Optional[TableSyncConfig]:
        """Find sync configuration by source table name."""
        table_upper = source_table.upper()
        if table_upper in SYNC_TABLES:
            cfg = SYNC_TABLES[table_upper]
            return TableSyncConfig(
                source_table=table_upper,
                target_schema=cfg["target_schema"],
                target_table=cfg["target_table"],
                target_model=cfg["target_model"],
                primary_key_field=cfg["primary_key_field"],
                source_primary_key_col=cfg["source_primary_key_col"],
                source_key=cfg["source_key"],
                mappings=cfg["mappings"],
                date_fields=cfg.get("date_fields", []),
                decimal_fields=cfg.get("decimal_fields", []),
            )
        return None
