"""Verify synchronization of new fields in TRECEPTION and TSORTIE"""
import asyncio
from sqlalchemy import select, text
from app.database import AsyncSessionLocal, init_db, close_db, get_db
from app.models.scdp import TReception, TSortie


async def verify_treception():
    async for db in get_db():
        print("=" * 60)
        print("TRECEPTION - Sample Records with New Fields")
        print("=" * 60)
        
        stmt = select(TReception.reception_id, TReception.num_rec, TReception.date_rec,
                     TReception.code_mode_trans, TReception.qte_rec_15, TReception.num_matricule,
                     TReception.date_depart, TReception.temp_ech_arr, TReception.dse_ech,
                     TReception.coul_ar_ta, TReception.coul_ar_15).limit(5)
        result = await db.execute(stmt)
        rows = result.fetchall()
        
        for row in rows:
            print(f"ID: {row.reception_id}, NUM_REC: {row.num_rec}")
            print(f"  date_rec: {row.date_rec}")
            print(f"  code_mode_trans: {row.code_mode_trans}")
            print(f"  qte_rec_15: {row.qte_rec_15}")
            print(f"  num_matricule: {row.num_matricule}")
            print(f"  date_depart: {row.date_depart}")
            print(f"  temp_ech_arr: {row.temp_ech_arr}")
            print(f"  dse_ech: {row.dse_ech}")
            print(f"  coul_ar_ta: {row.coul_ar_ta}")
            print(f"  coul_ar_15: {row.coul_ar_15}")
            print("-" * 40)
        
        # Count non-null fields
        count_stmt = text("""
            SELECT 
                COUNT(code_mode_trans) as mode_trans_count,
                COUNT(qte_rec_15) as qte_15_count,
                COUNT(num_matricule) as matricule_count,
                COUNT(date_depart) as date_depart_count,
                COUNT(temp_ech_arr) as temp_ech_arr_count,
                COUNT(dse_ech) as dse_ech_count,
                COUNT(coul_ar_ta) as coul_ar_ta_count,
                COUNT(coul_ar_15) as coul_ar_15_count
            FROM scdp.treception
        """)
        count_result = await db.execute(count_stmt)
        counts = count_result.fetchone()
        
        print("\nTRECEPTION - Non-null field counts:")
        print(f"  code_mode_trans: {counts.mode_trans_count}")
        print(f"  qte_rec_15: {counts.qte_15_count}")
        print(f"  num_matricule: {counts.matricule_count}")
        print(f"  date_depart: {counts.date_depart_count}")
        print(f"  temp_ech_arr: {counts.temp_ech_arr_count}")
        print(f"  dse_ech: {counts.dse_ech_count}")
        print(f"  coul_ar_ta: {counts.coul_ar_ta_count}")
        print(f"  coul_ar_15: {counts.coul_ar_15_count}")
        
        await db.close()
        break


async def verify_sortie_fields():
    async with AsyncSessionLocal() as session:
        # Check sample records from TSORTIE
        stmt = select(TSortie).limit(5)
        res = await session.execute(stmt)
        rows = res.scalars().all()
        
        print("\n" + "=" * 60)
        print("TSORTIE - Sample Records with New Fields")
        print("=" * 60)
        for r in rows:
            print(f"ID: {r.sortie_id}, NUM_BOR: {r.num_bor}")
            print(f"  code_orig: {r.code_orig}")
            print(f"  code_mode_trans: {r.code_mode_trans}")
            print(f"  qte_ch_15: {r.qte_ch_15}")
            print(f"  num_matricule: {r.num_matricule}")
            print(f"  date_be: {r.date_be}")
            print(f"  dse_ech_ta: {r.dse_ech_ta}")
            print(f"  dse_ech_15: {r.dse_ech_15}")
            print("-" * 60)
        
        # Count non-null values for new fields
        count_stmt = text("""
            SELECT 
                COUNT(code_orig) as orig_count,
                COUNT(code_mode_trans) as mode_trans_count,
                COUNT(qte_ch_15) as qte_ch_15_count,
                COUNT(num_matricule) as matricule_count,
                COUNT(date_be) as date_be_count,
                COUNT(dse_ech_ta) as dse_ta_count,
                COUNT(dse_ech_15) as dse_15_count
            FROM scdp.tsortie
        """)
        res = await session.execute(count_stmt)
        counts = res.fetchone()
        print("\nTSORTIE - Non-null field counts:")
        print(f"  code_orig: {counts[0]}")
        print(f"  code_mode_trans: {counts[1]}")
        print(f"  qte_ch_15: {counts[2]}")
        print(f"  num_matricule: {counts[3]}")
        print(f"  date_be: {counts[4]}")
        print(f"  dse_ech_ta: {counts[5]}")
        print(f"  dse_ech_15: {counts[6]}")


async def main():
    await init_db()
    try:
        await verify_treception()
        await verify_sortie_fields()
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
