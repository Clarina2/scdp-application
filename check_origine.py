import asyncio
from sqlalchemy import select
from app.database import get_db
from app.models.scdp import TOrigine, TSortie

async def check_origine():
    async for db in get_db():
        # Check TOrigine table
        origine_result = await db.execute(select(TOrigine.code_orig, TOrigine.orig_nom))
        origine_rows = origine_result.all()
        print(f'TOrigine count: {len(origine_rows)}')
        if origine_rows:
            print(f'Sample TOrigine: {origine_rows[:5]}')
        
        # Check TSortie with code_orig
        sortie_result = await db.execute(select(TSortie.code_orig).where(TSortie.code_orig.isnot(None)).distinct())
        sortie_codes = sortie_result.all()
        print(f'Unique code_orig in TSortie: {len(sortie_codes)}')
        if sortie_codes:
            print(f'Sample code_orig values: {[c[0] for c in sortie_codes[:5]]}')
        
        # Check if code_orig values match TOrigine
        if origine_rows and sortie_codes:
            origine_codes = set(row[0] for row in origine_rows)
            sortie_code_set = set(c[0] for c in sortie_codes)
            print(f'Codes in TOrigine but not in TSortie: {origine_codes - sortie_code_set}')
            print(f'Codes in TSortie but not in TOrigine: {sortie_code_set - origine_codes}')
            print(f'Missing codes in TOrigine: {sortie_code_set - origine_codes}')
        break

if __name__ == "__main__":
    asyncio.run(check_origine())
