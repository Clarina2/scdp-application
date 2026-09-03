"""Check TDEPOT columns in BDGSM source"""
import asyncio
from app.synchronization.source.sqlserver import SqlServerSourceAdapter


async def check_depot_columns():
    adapter = SqlServerSourceAdapter()
    await adapter.connect()
    
    print("=" * 60)
    print("Checking BDGSM TDEPOT columns")
    print("=" * 60)
    rows = await adapter.read_rows("TDEPOT", limit=3)
    if rows:
        print("Columns found:")
        for key in rows[0].keys():
            print(f"  {key}")
        print("\nSample data:")
        for i, row in enumerate(rows):
            print(f"\nRow {i}:")
            for key, value in row.items():
                print(f"  {key}: {value}")
    else:
        print("No data in TDEPOT")
    
    await adapter.disconnect()


if __name__ == "__main__":
    asyncio.run(check_depot_columns())
