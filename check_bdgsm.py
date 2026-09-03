import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal
from app.synchronization.source.sqlserver import SqlServerSourceAdapter
from app.synchronization.mapping import SYNC_TABLE_REGISTRY, DEFAULT_SYNC_ORDER
from app.config import settings

async def compare_tables():
    """Compare BDGSM and SCDP database tables."""
    
    # Check if BDGSM is configured
    if not settings.scdp_is_configured:
        print('BDGSM source not configured - using mock mode')
        print('Cannot verify synchronization with real BDGSM database')
        return
    
    # Get SCDP tables
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'scdp' 
            ORDER BY table_name
        """))
        scdp_tables = [row[0] for row in result.fetchall()]
    
    # Get configured sync tables
    configured_tables = [k for k, v in SYNC_TABLE_REGISTRY.items() if v.get('sync', True)]
    
    print('=== Synchronization Configuration ===')
    print(f'BDGSM source: {settings.source_host}:{settings.source_port}/{settings.source_name}')
    print(f'SCDP target: scdp_db')
    print(f'Configured for sync: {len(configured_tables)} tables')
    print(f'Default sync order: {len(DEFAULT_SYNC_ORDER)} tables')
    
    print('\n=== Configured Sync Tables ===')
    for table in DEFAULT_SYNC_ORDER:
        target_table = SYNC_TABLE_REGISTRY[table]["target_table"]
        print(f'  {table} -> scdp.{target_table}')
    
    print('\n=== SCDP Schema Tables ===')
    for table in scdp_tables:
        print(f'  {table}')
    
    # Check row count comparison for configured tables
    print('\n=== Row Count Comparison (BDGSM vs SCDP) ===')
    source_adapter = SqlServerSourceAdapter()
    await source_adapter.connect()
    
    try:
        async with AsyncSessionLocal() as db:
            matches = 0
            mismatches = 0
            
            for table_name in DEFAULT_SYNC_ORDER:
                # Get BDGSM count
                bdgsm_count = await source_adapter.read_count(table_name)
                
                # Get SCDP count
                target_table = SYNC_TABLE_REGISTRY[table_name]["target_table"]
                result = await db.execute(text(f"SELECT COUNT(*) FROM scdp.{target_table}"))
                scdp_count = result.scalar()
                
                status = "✓ MATCH" if bdgsm_count == scdp_count else "✗ MISMATCH"
                if bdgsm_count == scdp_count:
                    matches += 1
                else:
                    mismatches += 1
                print(f'  {table_name}: BDGSM={bdgsm_count}, SCDP={scdp_count} {status}')
            
            print(f'\n=== Summary ===')
            print(f'  Matches: {matches}/{len(DEFAULT_SYNC_ORDER)}')
            print(f'  Mismatches: {mismatches}/{len(DEFAULT_SYNC_ORDER)}')
            
            if mismatches == 0:
                print(f'  ✓ All configured tables are synchronized')
            else:
                print(f'  ✗ Some tables are out of sync - run synchronization')
    finally:
        await source_adapter.disconnect()

asyncio.run(compare_tables())
