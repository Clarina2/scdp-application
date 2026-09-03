"""
Database Seed Script
====================
CLI script to seed initial admin user into the application database.

Usage:
  python -m app.seed
"""

import asyncio
import logging
import bcrypt
from sqlalchemy import select

from app.database import AsyncSessionLocal, engine
from app.models.user import User, Role
from app.models.base import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


async def seed_database() -> None:
    """Create default system administrator if not already existing."""
    logger.info("Initializing database schema if missing...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        admin_email = "admin@scdp.com"
        result = await session.execute(select(User).where(User.email == admin_email))
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            logger.info("Admin user (%s) already exists. Skipping seed.", admin_email)
        else:
            password_hash = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            admin_user = User(
                name="System Administrator",
                email=admin_email,
                password_hash=password_hash,
                role=Role.ADMIN,
                is_active=True,
            )
            session.add(admin_user)
            await session.commit()
        # Seed initial distributors into scdp.tdistributeur if empty
        from app.models.scdp import TDistributeur
        dist_res = await session.execute(select(TDistributeur))
        existing_dists = dist_res.scalars().all()
        if not existing_dists:
            initial_dists = [
                TDistributeur(code_dis="SP", dis_nom="SAHEL PETROLEUM", dis_priorite=1),
                TDistributeur(code_dis="BG", dis_nom="BG PETROLEUM", dis_priorite=2),
                TDistributeur(code_dis="TO", dis_nom="TANK OIL", dis_priorite=3),
                TDistributeur(code_dis="GL", dis_nom="GLOBAL PETROLEUM", dis_priorite=4),
                TDistributeur(code_dis="BJ", dis_nom="BAJ SERVICES", dis_priorite=5),
                TDistributeur(code_dis="OL", dis_nom="OLMEX", dis_priorite=6),
                TDistributeur(code_dis="BT", dis_nom="BOTA OIL CAMEROUN", dis_priorite=7),
                TDistributeur(code_dis="NO", dis_nom="NICKEL OIL", dis_priorite=8),
                TDistributeur(code_dis="TW", dis_nom="TAWAAL OIL", dis_priorite=9),
                TDistributeur(code_dis="GS", dis_nom="GNEPS OIL", dis_priorite=10),
                TDistributeur(code_dis="JF", dis_nom="JFF OIL", dis_priorite=11),
                TDistributeur(code_dis="HO", dis_nom="HOOK'EM ENERGY", dis_priorite=12),
                TDistributeur(code_dis="IO", dis_nom="INTER OIL", dis_priorite=13),
                TDistributeur(code_dis="SE", dis_nom="SOPROPEC", dis_priorite=14),
                TDistributeur(code_dis="AO", dis_nom="ACTIF OIL", dis_priorite=15),
                TDistributeur(code_dis="TP", dis_nom="PETROCA", dis_priorite=16),
                TDistributeur(code_dis="TS", dis_nom="TAMPON STOCKS", dis_priorite=17),
                TDistributeur(code_dis="RO", dis_nom="REAL OIL", dis_priorite=18),
                TDistributeur(code_dis="KO", dis_nom="KORI OIL", dis_priorite=19),
                TDistributeur(code_dis="YO", dis_nom="YOKOFIB OIL", dis_priorite=20),
                TDistributeur(code_dis="CI", dis_nom="CORAIL SARL", dis_priorite=21),
                TDistributeur(code_dis="CT", dis_nom="CITEC SARL", dis_priorite=22),
                TDistributeur(code_dis="VE", dis_nom="VISION ENERGY", dis_priorite=23),
                TDistributeur(code_dis="MO", dis_nom="MULTI OIL", dis_priorite=24),
                TDistributeur(code_dis="GE", dis_nom="GREEN OIL EXPOR", dis_priorite=25),
                TDistributeur(code_dis="MP", dis_nom="MOBYL PETROLIUM", dis_priorite=26),
                TDistributeur(code_dis="EE", dis_nom="ELITE ENERGIE", dis_priorite=27),
                TDistributeur(code_dis="AR", dis_nom="AFRICA P RCA", dis_priorite=28),
                TDistributeur(code_dis="DG", dis_nom="DGSN", dis_priorite=29),
                TDistributeur(code_dis="DS", dis_nom="DSP", dis_priorite=30),
                TDistributeur(code_dis="OO", dis_nom="OMEGA OIL SA", dis_priorite=31),
                TDistributeur(code_dis="AB", dis_nom="ABP PETROLEUM", dis_priorite=32),
                TDistributeur(code_dis="OC", dis_nom="CITIZ'ENS OIL", dis_priorite=33),
                TDistributeur(code_dis="GA", dis_nom="GARDE PRESIDENT", dis_priorite=34),
                TDistributeur(code_dis="EC", dis_nom="ECO-ENERGY S.A", dis_priorite=35),
                TDistributeur(code_dis="JP", dis_nom="JOCIDDALO P", dis_priorite=36),
                TDistributeur(code_dis="MD", dis_nom="MINDEF 2", dis_priorite=37),
                TDistributeur(code_dis="BC", dis_nom="BONNE CHANCE", dis_priorite=38),
                TDistributeur(code_dis="LE", dis_nom="LONGSTAR ENERGY", dis_priorite=39),
                TDistributeur(code_dis="GC", dis_nom="GAZ COMPAGNIE S", dis_priorite=40),
                TDistributeur(code_dis="EO", dis_nom="ENGINE OIL COM", dis_priorite=41),
                TDistributeur(code_dis="VP", dis_nom="VENUS PETROLEUM", dis_priorite=42),
                TDistributeur(code_dis="EN", dis_nom="NATIONAL ENERGY", dis_priorite=43),
                TDistributeur(code_dis="GM", dis_nom="MAMAYAKO PETROL", dis_priorite=44),
                TDistributeur(code_dis="HP", dis_nom="HARPER PETROLEUM", dis_priorite=45),
                TDistributeur(code_dis="PO", dis_nom="PETROLINK OIL", dis_priorite=46),
                TDistributeur(code_dis="YD", dis_nom="YENDE SARL", dis_priorite=47),
                TDistributeur(code_dis="MM", dis_nom="MMT TRANSPORT", dis_priorite=48),
                TDistributeur(code_dis="VX", dis_nom="VENUS EXPORT", dis_priorite=49),
                TDistributeur(code_dis="SM", dis_nom="SEDM", dis_priorite=50),
                TDistributeur(code_dis="TL", dis_nom="SOTEL ENERGIES", dis_priorite=51),
                TDistributeur(code_dis="GY", dis_nom="GAMMA ENERGY S.A", dis_priorite=52),
                TDistributeur(code_dis="OS", dis_nom="OPTIMUS OIL S.A", dis_priorite=53),
                TDistributeur(code_dis="AM", dis_nom="ALCOM PETROLEUM", dis_priorite=54),
                TDistributeur(code_dis="MR", dis_nom="MERMO OIL", dis_priorite=55),
                TDistributeur(code_dis="VN", dis_nom="VAN PETROLEUM", dis_priorite=56),
                TDistributeur(code_dis="BR", dis_nom="BROTHERS OIL", dis_priorite=57),
                TDistributeur(code_dis="VO", dis_nom="VITAL OIL SA", dis_priorite=58),
                TDistributeur(code_dis="CE", dis_nom="CE", dis_priorite=59),
                TDistributeur(code_dis="PT", dis_nom="PETROCA", dis_priorite=60),
                TDistributeur(code_dis="ON", dis_nom="ON", dis_priorite=61),
                TDistributeur(code_dis="KC", dis_nom="KC", dis_priorite=62),
                TDistributeur(code_dis="SF", dis_nom="SF", dis_priorite=63),
                TDistributeur(code_dis="TG", dis_nom="TG", dis_priorite=64),
                TDistributeur(code_dis="GF", dis_nom="GF", dis_priorite=65),
                TDistributeur(code_dis="AI", dis_nom="AI", dis_priorite=66),
                TDistributeur(code_dis="EK", dis_nom="EXTRA KHALIFA", dis_priorite=67),
                TDistributeur(code_dis="AC", dis_nom="ALPHA OIL CAMEROUN", dis_priorite=68),
                TDistributeur(code_dis="AG", dis_nom="ALPHA GOLF OIL", dis_priorite=69),
                TDistributeur(code_dis="AL", dis_nom="AL MANNA SA", dis_priorite=70),
                TDistributeur(code_dis="AP", dis_nom="AFRICA PETROLEUM", dis_priorite=71),
                TDistributeur(code_dis="AZ", dis_nom="AZA AFRIGAZ", dis_priorite=72),
                TDistributeur(code_dis="BA", dis_nom="BARILEX", dis_priorite=73),
                TDistributeur(code_dis="BL", dis_nom="B & O LOGIS", dis_priorite=74),
                TDistributeur(code_dis="BM", dis_nom="BOEM PETROLEUM", dis_priorite=75),
                TDistributeur(code_dis="BO", dis_nom="BOCOM", dis_priorite=76),
                TDistributeur(code_dis="BP", dis_nom="Blessing Petroleum", dis_priorite=77),
                TDistributeur(code_dis="CC", dis_nom="CAM. CITIZEN", dis_priorite=78),
                TDistributeur(code_dis="CH", dis_nom="CSPH", dis_priorite=79),
                TDistributeur(code_dis="CL", dis_nom="CLGG SA", dis_priorite=80),
                TDistributeur(code_dis="CM", dis_nom="CAM.MARKETING", dis_priorite=81),
                TDistributeur(code_dis="CO", dis_nom="CAMOCO", dis_priorite=82),
                TDistributeur(code_dis="CP", dis_nom="CAPOGCO PLC", dis_priorite=83),
                TDistributeur(code_dis="CR", dis_nom="CARE OIL", dis_priorite=84),
                TDistributeur(code_dis="CV", dis_nom="CONVERGENCE PETROLIUM", dis_priorite=85),
                TDistributeur(code_dis="CX", dis_nom="CONFEX OIL", dis_priorite=86),
                TDistributeur(code_dis="DP", dis_nom="DELTA PETROLEUM", dis_priorite=87),
                TDistributeur(code_dis="FA", dis_nom="MINDEF", dis_priorite=88),
                TDistributeur(code_dis="FO", dis_nom="FIRST OIL CAMEROUN", dis_priorite=89),
                TDistributeur(code_dis="FP", dis_nom="FORCES AR_PET", dis_priorite=90),
                TDistributeur(code_dis="GH", dis_nom="GOSHEN OIL", dis_priorite=91),
                TDistributeur(code_dis="GN", dis_nom="GREEN OIL", dis_priorite=92),
                TDistributeur(code_dis="GP", dis_nom="GENERAL PETROLEUM", dis_priorite=93),
                TDistributeur(code_dis="GU", dis_nom="GULFIN", dis_priorite=94),
                TDistributeur(code_dis="IB", dis_nom="IBSC OIL", dis_priorite=95),
                TDistributeur(code_dis="MC", dis_nom="OLA ENERGY CAMEROON", dis_priorite=96),
                TDistributeur(code_dis="ME", dis_nom="MOBIL EEPCI", dis_priorite=97),
                TDistributeur(code_dis="MS", dis_nom="MOBIL SERVICE", dis_priorite=98),
                TDistributeur(code_dis="MT", dis_nom="MOBIL TCHAD", dis_priorite=99),
                TDistributeur(code_dis="MW", dis_nom="MOSEC", dis_priorite=100),
                TDistributeur(code_dis="MX", dis_nom="MOBIL EXPORT", dis_priorite=101),
                TDistributeur(code_dis="NE", dis_nom="NEPTUNE OIL", dis_priorite=102),
                TDistributeur(code_dis="NP", dis_nom="NET OIL PETROLEUM", dis_priorite=103),
                TDistributeur(code_dis="NX", dis_nom="NEPTUNE EXPORT", dis_priorite=104),
                TDistributeur(code_dis="OP", dis_nom="OPOC", dis_priorite=105),
                TDistributeur(code_dis="PF", dis_nom="CCLFPP", dis_priorite=106),
                TDistributeur(code_dis="PL", dis_nom="PLANET PETROLEUM", dis_priorite=107),
                TDistributeur(code_dis="PP", dis_nom="PPSM", dis_priorite=108),
                TDistributeur(code_dis="PR", dis_nom="PETROLEX", dis_priorite=109),
                TDistributeur(code_dis="PX", dis_nom="PETROLEX CAM.", dis_priorite=110),
                TDistributeur(code_dis="SA", dis_nom="SOCAMIT", dis_priorite=111),
                TDistributeur(code_dis="SC", dis_nom="CHEVRON TEXACO", dis_priorite=112),
                TDistributeur(code_dis="SD", dis_nom="SDTC", dis_priorite=113),
                TDistributeur(code_dis="SG", dis_nom="STCG", dis_priorite=114),
                TDistributeur(code_dis="SH", dis_nom="SNH", dis_priorite=115),
                TDistributeur(code_dis="SN", dis_nom="S.N.H. - SS", dis_priorite=116),
                TDistributeur(code_dis="SO", dis_nom="SOCAEPE", dis_priorite=117),
                TDistributeur(code_dis="SR", dis_nom="SONARA", dis_priorite=118),
                TDistributeur(code_dis="SS", dis_nom="S.N.H. - SS", dis_priorite=119),
                TDistributeur(code_dis="ST", dis_nom="SHELL TCHAD", dis_priorite=120),
                TDistributeur(code_dis="SY", dis_nom="SOTRADHY", dis_priorite=121),
                TDistributeur(code_dis="TA", dis_nom="TOTAL RCA", dis_priorite=122),
                TDistributeur(code_dis="TD", dis_nom="TRADEX EXPORT", dis_priorite=123),
                TDistributeur(code_dis="TE", dis_nom="CORLAY CAMEROUN", dis_priorite=124),
                TDistributeur(code_dis="TF", dis_nom="TOTAL CAMEROUN", dis_priorite=125),
                TDistributeur(code_dis="TI", dis_nom="TRADEX LOCAL", dis_priorite=126),
                TDistributeur(code_dis="TM", dis_nom="TOTAL MAR.TCHAD", dis_priorite=127),
                TDistributeur(code_dis="TR", dis_nom="TOTAL RCA", dis_priorite=128),
                TDistributeur(code_dis="TT", dis_nom="TOTAL TCHAD", dis_priorite=129),
                TDistributeur(code_dis="TX", dis_nom="TOTAL EXPORT", dis_priorite=130),
                TDistributeur(code_dis="XX", dis_nom="TEXACO EXPORT", dis_priorite=131),
            ]
            session.add_all(initial_dists)
            await session.commit()
            logger.info("Successfully seeded %d authorized distributors into scdp.tdistributeur.", len(initial_dists))

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_database())
