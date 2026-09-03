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

# Try connection with TrustServerCertificate
conn_str = f'DRIVER={{{driver}}};SERVER={host},{port};DATABASE={name};UID={user};PWD={password};TrustServerCertificate=yes;'

try:
    conn = pyodbc.connect(conn_str, timeout=10)
    cursor = conn.cursor()
    
    # Get columns for TRECEPTION
    print('TRECEPTION columns in BDGSM:')
    cursor.execute("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TRECEPTION' ORDER BY ORDINAL_POSITION")
    for row in cursor.fetchall():
        print(f'  {row[0]}: {row[1]}')
    
    # Get columns for TSORTIE
    print('\nTSORTIE columns in BDGSM:')
    cursor.execute("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TSORTIE' ORDER BY ORDINAL_POSITION")
    for row in cursor.fetchall():
        print(f'  {row[0]}: {row[1]}')
    
    # Sample data from TRECEPTION
    print('\nTRECEPTION sample data (first 3 rows):')
    cursor.execute("SELECT TOP 3 * FROM TRECEPTION")
    columns = [col[0] for col in cursor.description]
    for row in cursor.fetchall():
        print(f'  {dict(zip(columns, row))}')
    
    # Sample data from TSORTIE
    print('\nTSORTIE sample data (first 3 rows):')
    cursor.execute("SELECT TOP 3 * FROM TSORTIE")
    columns = [col[0] for col in cursor.description]
    for row in cursor.fetchall():
        print(f'  {dict(zip(columns, row))}')
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
