"""Check num_rec values in PostgreSQL TRECEPTION"""
import asyncio
from sqlalchemy import select
from app.database import get_db
from app.models.scdp import TReception


async def check_postgres_num_bor():
    async for db in get_db():
        print("=" * 60)
        print("Checking num_rec values in PostgreSQL TRECEPTION")
        print("=" * 60)
        
        stmt = select(TReception.reception_id, TReception.num_rec).limit(10)
        result = await db.execute(stmt)
        rows = result.fetchall()
        
        for row in rows:
            print(f"ID: {row.reception_id}, num_rec: {row.num_rec}")
        
        # Count non-null num_rec
        count_stmt = select(TReception.reception_id).where(TReception.num_rec.isnot(None))
        count_result = await db.execute(count_stmt)
        count = len(count_result.fetchall())
        print(f"\nNon-null num_rec count: {count}")
        
        await db.close()
        break


if __name__ == "__main__":
    asyncio.run(check_postgres_num_bor())
