import asyncio
from app.synchronization.source.sqlserver import SqlServerSourceAdapter

async def test():
    adapter = SqlServerSourceAdapter()
    print(f"Mock mode: {adapter.use_mock}")
    print(f"Host: {adapter.host}")
    print(f"Database: {adapter.database}")
    print(f"User: {adapter.user}")
    print(f"Password: {'SET' if adapter.password else 'NOT SET'}")
    
    try:
        await adapter.connect()
        print("Connected successfully")
        
        count = await adapter.read_count('TDEPOT')
        print(f"TDEPOT count: {count}")
        
        rows = await adapter.read_rows('TDEPOT', limit=5)
        print(f"Sample rows: {len(rows)}")
        for row in rows:
            print(f"  {row}")
            
        await adapter.disconnect()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

asyncio.run(test())
