import psycopg2

conn = psycopg2.connect(host='127.0.0.1', port=5432, database='scdp_db', user='postgres', password='@Mar5!al08')
cursor = conn.cursor()

print('TReception sample data with quantities:')
cursor.execute("SELECT num_rec, code_dis, qte_rec FROM scdp.treception LIMIT 5")
for row in cursor.fetchall():
    print(f'  {row[0]}: {row[1]} - {row[2]} L')

print('\nTSortie sample data with quantities:')
cursor.execute("SELECT num_bor, code_dis, qte_sortie FROM scdp.tsortie LIMIT 5")
for row in cursor.fetchall():
    print(f'  {row[0]}: {row[1]} - {row[2]} L')

conn.close()
