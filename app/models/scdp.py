"""
SCDP Target Models (scdp schema)
================================
Replicated tables from SQL Server BDGSM master:

1. Core Reference Tables:
   - scdp.tdepot
   - scdp.tproduit
   - scdp.tdistributeur

2. Operational Stock Table:
   - scdp.tstockphys

3. Transactional & Movement Tables:
   - scdp.tregul
   - scdp.treception
   - scdp.tsortie
   - scdp.tperte
   - scdp.tregularisation

4. Support Reference Tables:
   - scdp.tdestination
   - scdp.torigine
   - scdp.tmodetrans
   - scdp.ttypebor
   - scdp.ttyperegul
   - scdp.tstsecurite
   - scdp.tstkoutil
   - scdp.tville
   - scdp.twagon
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, SmallInteger, DateTime, Float, Text, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TDepot(Base):
    __tablename__ = "tdepot"
    __table_args__ = {"schema": "scdp"}

    code_ville: Mapped[int] = mapped_column(Integer, nullable=False)
    code_depot: Mapped[str] = mapped_column(String(2), primary_key=True, nullable=False)
    depot_nom: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    depot_bp: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    depot_tel: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)


class TProduit(Base):
    __tablename__ = "tproduit"
    __table_args__ = {"schema": "scdp"}

    code_prod: Mapped[str] = mapped_column(String(2), primary_key=True, nullable=False)
    prod_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    prod_priorite: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class TDistributeur(Base):
    __tablename__ = "tdistributeur"
    __table_args__ = {"schema": "scdp"}

    code_dis: Mapped[str] = mapped_column(String(2), primary_key=True, nullable=False)
    dis_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    dis_priorite: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dis_tspp: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)
    dis_export: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)


class TStockPhys(Base):
    __tablename__ = "tstockphys"
    __table_args__ = {"schema": "scdp"}

    id_pcfp_stk_phys_jour: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    code_depot: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_dis: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    code_prod: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    date_trait: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    date_jaugeage: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    date_veille: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    stock_ta: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    stock_15: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pg_ta: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pg_15: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class TRegul(Base):
    __tablename__ = "tregul"
    __table_args__ = {"schema": "scdp"}

    code_regul: Mapped[str] = mapped_column(String(10), primary_key=True, nullable=False)
    regul_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    code_depot: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_prod: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_dis_cre: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    code_dis_deb: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    code_type_regul: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)


class TReception(Base):
    __tablename__ = "treception"
    __table_args__ = (
        Index("idx_treception_fingerprint", "fingerprint", unique=True),
        {"schema": "scdp"},
    )

    reception_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    num_rec: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    code_depot: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_dis: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    code_prod: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    date_rec: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    qte_rec: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    # Additional fields from BDGSM TRECEPTION
    code_type_bor: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)  # Type de bordereau
    code_mode_trans: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)  # Mode de transfert
    qte_rec_15: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Quantité 15
    num_matricule: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)  # Numéro de matricule
    num_be: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)  # Numéro de BE
    heure_chargement: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Heure de chargement
    # Additional TRECEPTION fields from BDGSM
    date_depart: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Date de départ
    temp_ech_arr: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Température à l'arrivée
    dse_ech: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # DSE échange
    coul_ar_ta: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Couleur arrivée TA
    coul_ar_15: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Couleur arrivée 15
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)


class TSortie(Base):
    __tablename__ = "tsortie"
    __table_args__ = (
        Index("idx_tsortie_fingerprint", "fingerprint", unique=True),
        {"schema": "scdp"},
    )

    sortie_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    num_bor: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    code_depot: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_dis: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    code_prod: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    date_sortie: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    qte_sortie: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    # Additional fields from BDGSM TSORTIE
    code_type_bor: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)  # Type de bordereau
    code_mode_trans: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)  # Mode de transport
    qte_ch_15: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Quantité chargée 15
    num_matricule: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)  # Numéro de matricule (NumIm)
    num_be: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)  # Numéro de BE
    date_be: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Date d'arrivée (DateBE)
    dse_ech_ta: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Quantité reçue TA (DseEch_TA)
    dse_ech_15: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Quantité reçue 15 (DseEch_15)
    heure_chargement: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Heure de chargement
    code_orig: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # Origine (mapped from CodeDest)
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)


class TPerte(Base):
    __tablename__ = "tperte"
    __table_args__ = (
        Index("idx_tperte_fingerprint", "fingerprint", unique=True),
        {"schema": "scdp"},
    )

    perte_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code_depot: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_prod: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    date_perte: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    qte_perte: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)


class TRegularisation(Base):
    __tablename__ = "tregularisation"
    __table_args__ = (
        Index("idx_tregularisation_fingerprint", "fingerprint", unique=True),
        {"schema": "scdp"},
    )

    regularisation_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code_regul: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    code_depot: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_prod: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    date_regul: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    qte_regul: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)


# Support Reference Tables
class TDestination(Base):
    __tablename__ = "tdestination"
    __table_args__ = {"schema": "scdp"}

    code_dest: Mapped[str] = mapped_column(String(10), primary_key=True, nullable=False)
    dest_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)


class TOrigine(Base):
    __tablename__ = "torigine"
    __table_args__ = {"schema": "scdp"}

    code_orig: Mapped[str] = mapped_column(String(10), primary_key=True, nullable=False)
    orig_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)


class TModeTrans(Base):
    __tablename__ = "tmodetrans"
    __table_args__ = {"schema": "scdp"}

    code_mode: Mapped[str] = mapped_column(String(5), primary_key=True, nullable=False)
    mode_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)


class TTypeBor(Base):
    __tablename__ = "ttypebor"
    __table_args__ = {"schema": "scdp"}

    code_type_bor: Mapped[str] = mapped_column(String(5), primary_key=True, nullable=False)
    type_bor_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)


class TTypeRegul(Base):
    __tablename__ = "ttyperegul"
    __table_args__ = {"schema": "scdp"}

    code_type_regul: Mapped[str] = mapped_column(String(5), primary_key=True, nullable=False)
    type_regul_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)


class TVille(Base):
    __tablename__ = "tville"
    __table_args__ = {"schema": "scdp"}

    code_ville: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    ville_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)


class TWagon(Base):
    __tablename__ = "twagon"
    __table_args__ = {"schema": "scdp"}

    code_wagon: Mapped[str] = mapped_column(String(10), primary_key=True, nullable=False)
    wagon_nom: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    capa_wagon: Mapped[Optional[float]] = mapped_column(Float, nullable=True)


class TStSecurite(Base):
    __tablename__ = "tstsecurite"
    __table_args__ = (
        Index("idx_tstsecurite_fingerprint", "fingerprint", unique=True),
        {"schema": "scdp"},
    )

    id_stk_sec: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code_depot: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_prod: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    qte_securite: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fingerprint: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)


class TStkOutil(Base):
    __tablename__ = "tstkoutil"
    __table_args__ = (
        Index("idx_tstkoutil_fingerprint", "fingerprint", unique=True),
        {"schema": "scdp"},
    )

    id_stk_outil: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code_depot: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    code_prod: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    qte_outil: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fingerprint: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
