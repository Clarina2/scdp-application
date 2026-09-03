import pyodbc
from app.config import settings

def check_source_quantities():
    """Check quantity data in SQL Server BDGSM source"""
    try:
        # Build connection string for SQL Server
        driver = settings.SCDP_SOURCE_DB_DRIVER or '{ODBC Driver 17 for SQL Server}'
        host = settings.SCDP_SOURCE_DB_HOST or 'localhost'
        user = settings.SCDP_SOURCE_DB_USER or 'sa'
        password = settings.SCDP_SOURCE_DB_PASSWORD or ''
        name = settings.SCDP_SOURCE_DB_NAME or 'BDGSM'
        
        conn_str = f'DRIVER={driver};SERVER={host};DATABASE={name};UID={user};PWD={password}'
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # Check TRECEPTION quantities
        print("Checking TRECEPTION quantities in source...")
        cursor.execute("SELECT COUNT(*) FROM TRECEPTION WHERE QTEREC IS NOT NULL")
        rec_not_null = cursor.fetchone()[0]
        print(f"  Records with non-NULL QTEREC: {rec_not_null}")
        
        cursor.execute("SELECT COUNT(*) FROM TRECEPTION")
        rec_total = cursor.fetchone()[0]
        print(f"  Total TRECEPTION records: {rec_total}")
        
        if rec_not_null > 0:
            cursor.execute("SELECT TOP 5 NUM_REC, CODE_DEPOT, CODE_DIS, DATE_REC, QTEREC FROM TRECEPTION WHERE QTEREC IS NOT NULL")
            print("  Sample records with quantities:")
            for row in cursor.fetchall():
                print(f"    {row}")
        
        # Check TSORTIE quantities
        print("\nChecking TSORTIE quantities in source...")
        cursor.execute("SELECT COUNT(*) FROM TSORTIE WHERE QTESORTIE IS NOT NULL")
        exit_not_null = cursor.fetchone()[0]
        print(f"  Records with non-NULL QTESORTIE: {exit_not_null}")
        
        cursor.execute("SELECT COUNT(*) FROM TSORTIE")
        exit_total = cursor.fetchone()[0]
        print(f"  Total TSORTIE records: {exit_total}")
        
        if exit_not_null > 0:
            cursor.execute("SELECT TOP 5 NUM_BOR, CODE_DEPOT, CODE_DIS, DATE_SORTIE, QTESORTIE FROM TSORTIE WHERE QTESORTIE IS NOT NULL")
            print("  Sample records with quantities:")
            for row in cursor.fetchall():
                print(f"    {row}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_source_quantities()
