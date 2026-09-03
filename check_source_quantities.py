import pyodbc

# Connect to SQL Server BDGSM
conn_str = (
    r'DRIVER={ODBC Driver 17 for SQL Server};'
    r'SERVER=localhost\SQLEXPRESS;'
    r'DATABASE=BDGSM;'
    r'UID=sa;'
    r'PWD=@Mar5!al08;'
)

conn = pyodbc.connect(conn_str)
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
