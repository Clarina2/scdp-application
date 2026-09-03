import asyncio
from sqlalchemy import select, text
from app.database import AsyncSessionLocal
from app.models.scdp import TReception, TSortie

async def check_recent_movements():
    """Check recent movements data in database"""
    async with AsyncSessionLocal() as db:
        try:
            # Check recent receptions
            print("Checking recent receptions...")
            rec_query = select(TReception).order_by(TReception.date_rec.desc()).limit(5)
            rec_result = await db.execute(rec_query)
            recs = rec_result.scalars().all()
            
            print(f"Found {len(recs)} recent receptions:")
            for rec in recs:
                print(f"  Date: {rec.date_rec}, Code Dis: {rec.code_dis}, Depot: {rec.code_depot}, Qty: {rec.qte_rec}")
            
            # Check recent exits
            print("\nChecking recent exits...")
            exit_query = select(TSortie).order_by(TSortie.date_sortie.desc()).limit(5)
            exit_result = await db.execute(exit_query)
            exits = exit_result.scalars().all()
            
            print(f"Found {len(exits)} recent exits:")
            for exit in exits:
                print(f"  Date: {exit.date_sortie}, Code Dis: {exit.code_dis}, Depot: {exit.code_depot}, Qty: {exit.qte_sortie}")
            
            # Check if quantities are NULL
            print("\nChecking NULL quantities...")
            rec_null_query = select(text("COUNT(*)")).select_from(text("scdp.treception")).where(text("qte_rec IS NULL"))
            rec_null_result = await db.execute(rec_null_query)
            rec_null_count = rec_null_result.scalar()
            
            exit_null_query = select(text("COUNT(*)")).select_from(text("scdp.tsortie")).where(text("qte_sortie IS NULL"))
            exit_null_result = await db.execute(exit_null_query)
            exit_null_count = exit_null_result.scalar()
            
            print(f"Receptions with NULL quantity: {rec_null_count}")
            print(f"Exits with NULL quantity: {exit_null_count}")
            
        except Exception as e:
            print(f"Error: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(check_recent_movements())
