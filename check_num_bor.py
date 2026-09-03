"""Check NumBor values in BDGSM TRECEPTION"""
import asyncio
from app.synchronization.source.sqlserver import SqlServerSourceAdapter


async def check_num_bor():
    adapter = SqlServerSourceAdapter()
    await adapter.connect()
    
    print("=" * 60)
    print("Checking NumBor values in BDGSM TRECEPTION")
    print("=" * 60)
    rows = await adapter.read_rows("TRECEPTION", limit=10)
    if rows:
        for i, row in enumerate(rows):
            print(f"Row {i}: NumBor = {row.get('NumBor')}")
    else:
        print("No data in TRECEPTION")
    
    await adapter.disconnect()


if __name__ == "__main__":
    asyncio.run(check_num_bor())
