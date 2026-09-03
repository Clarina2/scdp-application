import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def check_tables():
    async with AsyncSessionLocal() as db:
        # Get all tables in scdp schema
        result = await db.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'scdp' 
            ORDER BY table_name
        """))
        tables = result.fetchall()
        print('=== SCDP Schema Tables ===')
        for table in tables:
            print(f'  {table[0]}')
        
        # Get row counts for each table
        print('\n=== Row Counts ===')
        for table in tables:
            table_name = table[0]
            result = await db.execute(text(f"SELECT COUNT(*) FROM scdp.{table_name}"))
            count = result.scalar()
            print(f'  {table_name}: {count}')
        
        # Check sync history
        print('\n=== Sync History ===')
        result = await db.execute(text("""
            SELECT id, started_at, completed_at, status, records_read, records_inserted, records_updated
            FROM app.synchronization_runs
            ORDER BY id DESC
            LIMIT 5
        """))
        runs = result.fetchall()
        if runs:
            for run in runs:
                print(f'  Run #{run[0]}: {run[3]} - Read: {run[4]}, Inserted: {run[5]}, Updated: {run[6]}')
        else:
            print('  No sync runs found')

asyncio.run(check_tables())
