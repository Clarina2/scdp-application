"""Check specific fields in BDGSM source tables"""
import asyncio
from app.synchronization.source.sqlserver import SqlServerSourceAdapter


async def check_detailed_columns():
    adapter = SqlServerSourceAdapter()
    await adapter.connect()
    
    print("=" * 60)
    print("Checking specific fields in BDGSM TRECEPTION")
    print("=" * 60)
    rows = await adapter.read_rows("TRECEPTION", limit=5)
    if rows:
        for i, row in enumerate(rows):
            print(f"\nRow {i}:")
            print(f"  NumBor: {row.get('NumBor')}")
            print(f"  DateRe: {row.get('DateRe')}")
            print(f"  QteRe_TA: {row.get('QteRe_TA')}")
            print(f"  QteRe_15: {row.get('QteRe_15')}")
            print(f"  DateDepart: {row.get('DateDepart')}")
            print(f"  TempEchArr: {row.get('TempEchArr')}")
            print(f"  DseEch: {row.get('DseEch')}")
            print(f"  CoulAr_TA: {row.get('CoulAr_TA')}")
            print(f"  CoulAr_15: {row.get('CoulAr_15')}")
    else:
        print("No data in TRECEPTION")
    
    print("\n" + "=" * 60)
    print("Checking specific fields in BDGSM TSORTIE")
    print("=" * 60)
    rows = await adapter.read_rows("TSORTIE", limit=5)
    if rows:
        for i, row in enumerate(rows):
            print(f"\nRow {i}:")
            print(f"  NumBor: {row.get('NumBor')}")
            print(f"  CodeTypeBor: {row.get('CodeTypeBor')}")
            print(f"  NumBE: {row.get('NumBE')}")
            print(f"  HeureChargement: {row.get('HeureChargement')}")
            print(f"  DateBE: {row.get('DateBE')}")
            print(f"  DseEch_TA: {row.get('DseEch_TA')}")
            print(f"  DseEch_15: {row.get('DseEch_15')}")
    else:
        print("No data in TSORTIE")
    
    await adapter.disconnect()


if __name__ == "__main__":
    asyncio.run(check_detailed_columns())
