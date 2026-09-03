"""Check actual column names in BDGSM source tables"""
import asyncio
from app.synchronization.source.sqlserver import SqlServerSourceAdapter


async def check_source_columns():
    adapter = SqlServerSourceAdapter()
    await adapter.connect()
    
    print("=" * 60)
    print("Checking BDGSM TRECEPTION columns")
    print("=" * 60)
    rows = await adapter.read_rows("TRECEPTION", limit=1)
    if rows:
        print("Columns found:", list(rows[0].keys()))
    else:
        print("No data in TRECEPTION")
    
    print("\n" + "=" * 60)
    print("Checking BDGSM TSORTIE columns")
    print("=" * 60)
    rows = await adapter.read_rows("TSORTIE", limit=1)
    if rows:
        print("Columns found:", list(rows[0].keys()))
    else:
        print("No data in TSORTIE")
    
    await adapter.disconnect()


if __name__ == "__main__":
    asyncio.run(check_source_columns())
