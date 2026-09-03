import psycopg2

conn = psycopg2.connect(host='127.0.0.1', port=5432, database='scdp_db', user='postgres', password='@Mar5!al08')
cursor = conn.cursor()

# Check how many records have null quantities
cursor.execute("SELECT COUNT(*) FROM scdp.treception WHERE qte_rec IS NULL")
rec_null_count = cursor.fetchone()[0]
print(f'TReception records with null qte_rec: {rec_null_count}')

cursor.execute("SELECT COUNT(*) FROM scdp.tsortie WHERE qte_sortie IS NULL")
sort_null_count = cursor.fetchone()[0]
print(f'TSortie records with null qte_sortie: {sort_null_count}')

# Check how many have valid quantities
cursor.execute("SELECT COUNT(*) FROM scdp.treception WHERE qte_rec IS NOT NULL")
rec_valid_count = cursor.fetchone()[0]
print(f'TReception records with valid qte_rec: {rec_valid_count}')

cursor.execute("SELECT COUNT(*) FROM scdp.tsortie WHERE qte_sortie IS NOT NULL")
sort_valid_count = cursor.fetchone()[0]
print(f'TSortie records with valid qte_sortie: {sort_valid_count}')

conn.close()
