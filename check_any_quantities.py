import asyncio
from sqlalchemy import select, text
from app.database import AsyncSessionLocal
from app.models.scdp import TReception, TSortie

async def check_any_quantities():
    """Check if ANY records have non-null quantities"""
    async with AsyncSessionLocal() as db:
        try:
            # Check if ANY receptions have non-null quantities
            print("Checking if ANY receptions have non-null quantities...")
            rec_query = select(text("COUNT(*)")).select_from(text("scdp.treception")).where(text("qte_rec IS NOT NULL"))
            rec_result = await db.execute(rec_query)
            rec_count = rec_result.scalar()
            print(f"Receptions with non-NULL quantity: {rec_count}")
            
            if rec_count > 0:
                rec_sample = select(TReception).where(TReception.qte_rec.isnot(None)).limit(3)
                rec_sample_result = await db.execute(rec_sample)
                rec_samples = rec_sample_result.scalars().all()
                print("Sample receptions with quantities:")
                for rec in rec_samples:
                    print(f"  Date: {rec.date_rec}, Qty: {rec.qte_rec}, Code Dis: {rec.code_dis}")
            
            # Check if ANY exits have non-null quantities
            print("\nChecking if ANY exits have non-null quantities...")
            exit_query = select(text("COUNT(*)")).select_from(text("scdp.tsortie")).where(text("qte_sortie IS NOT NULL"))
            exit_result = await db.execute(exit_query)
            exit_count = exit_result.scalar()
            print(f"Exits with non-NULL quantity: {exit_count}")
            
            if exit_count > 0:
                exit_sample = select(TSortie).where(TSortie.qte_sortie.isnot(None)).limit(3)
                exit_sample_result = await db.execute(exit_sample)
                exit_samples = exit_sample_result.scalars().all()
                print("Sample exits with quantities:")
                for exit in exit_samples:
                    print(f"  Date: {exit.date_sortie}, Qty: {exit.qte_sortie}, Code Dis: {exit.code_dis}")
            
            # Check total counts
            rec_total = await db.execute(select(text("COUNT(*)")).select_from(text("scdp.treception")))
            print(f"\nTotal receptions: {rec_total.scalar()}")
            
            exit_total = await db.execute(select(text("COUNT(*)")).select_from(text("scdp.tsortie")))
            print(f"Total exits: {exit_total.scalar()}")
            
        except Exception as e:
            print(f"Error: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(check_any_quantities())
