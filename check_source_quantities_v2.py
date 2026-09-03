import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

# Get connection details from environment
host = os.getenv('SCDP_SOURCE_DB_HOST') or os.getenv('SCDP_DB_HOST')
port = os.getenv('SCDP_SOURCE_DB_PORT') or os.getenv('SCDP_DB_PORT', '1433')
name = os.getenv('SCDP_SOURCE_DB_NAME') or os.getenv('SCDP_DB_NAME', 'BDGSM')
user = os.getenv('SCDP_SOURCE_DB_USER') or os.getenv('SCDP_DB_USER')
password = os.getenv('SCDP_SOURCE_DB_PASSWORD') or os.getenv('SCDP_DB_PASSWORD')
driver = os.getenv('SCDP_SOURCE_DB_DRIVER', 'ODBC Driver 18 for SQL Server')

print(f"Connecting to: {host}\\{name}")
print(f"Driver: {driver}")

# Try different connection string formats
conn_strings = [
    f'DRIVER={{{driver}}};SERVER={host};DATABASE={name};UID={user};PWD={password};',
    f'DRIVER={{{driver}}};SERVER={host},{port};DATABASE={name};UID={user};PWD={password};',
    f'DRIVER={{{driver}}};SERVER={host}\\SQLEXPRESS;DATABASE={name};UID={user};PWD={password};',
]

for conn_str in conn_strings:
    try:
        print(f"\nTrying connection string: {conn_str[:50]}...")
        conn = pyodbc.connect(conn_str, timeout=5)
        cursor = conn.cursor()
        
        # Check TREception source data
        print('BDGSM TRECEPTION sample data with QTEREC:')
        cursor.execute("SELECT TOP 5 NUMREC, CODEDIS, QTEREC FROM TRECEPTION")
        for row in cursor.fetchall():
            print(f'  {row[0]}: {row[1]} - {row[2]} L')

        # Check TSORTIE source data
        print('\nBDGSM TSORTIE sample data with QTESORTIE:')
        cursor.execute("SELECT TOP 5 NUMBOR, CODEDIS, QTESORTIE FROM TSORTIE")
        for row in cursor.fetchall():
            print(f'  {row[0]}: {row[1]} - {row[2]} L')

        # Check counts
        cursor.execute("SELECT COUNT(*) FROM TRECEPTION WHERE QTEREC IS NOT NULL")
        rec_valid = cursor.fetchone()[0]
        print(f'\nTRECEPTION records with valid QTEREC: {rec_valid}')

        cursor.execute("SELECT COUNT(*) FROM TSORTIE WHERE QTESORTIE IS NOT NULL")
        sort_valid = cursor.fetchone()[0]
        print(f'TSORTIE records with valid QTESORTIE: {sort_valid}')

        conn.close()
        break
    except Exception as e:
        print(f"Failed: {e}")
        continue
