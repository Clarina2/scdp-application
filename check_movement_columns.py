import psycopg2

conn = psycopg2.connect(host='127.0.0.1', port=5432, database='scdp_db', user='postgres', password='@Mar5!al08')
cursor = conn.cursor()

cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'scdp' AND table_name = 'treception'")
print('TReception columns:')
for col in cursor.fetchall():
    print(f'  {col[0]}')

cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema = 'scdp' AND table_name = 'tsortie'")
print('\nTSortie columns:')
for col in cursor.fetchall():
    print(f'  {col[0]}')

conn.close()
