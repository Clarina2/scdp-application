import psycopg2

conn = psycopg2.connect(host='127.0.0.1', port=5432, database='scdp_db', user='postgres', password='@Mar5!al08')
cursor = conn.cursor()

# Check actual counts
cursor.execute("SELECT COUNT(*) FROM scdp.treception")
rec_count = cursor.fetchone()[0]
print(f'TReception actual count: {rec_count}')

cursor.execute("SELECT COUNT(*) FROM scdp.tsortie")
sort_count = cursor.fetchone()[0]
print(f'TSortie actual count: {sort_count}')

# Check counts with joins (simulating the API query)
cursor.execute("""
    SELECT COUNT(DISTINCT t.reception_id)
    FROM scdp.treception t
    LEFT JOIN scdp.tdepot d ON t.code_depot = d.code_depot
    LEFT JOIN scdp.tproduit p ON t.code_prod = p.code_prod
    LEFT JOIN scdp.tdistributeur dis ON t.code_dis = dis.code_dis
""")
rec_join_count = cursor.fetchone()[0]
print(f'TReception count with joins: {rec_join_count}')

cursor.execute("""
    SELECT COUNT(DISTINCT t.sortie_id)
    FROM scdp.tsortie t
    LEFT JOIN scdp.tdepot d ON t.code_depot = d.code_depot
    LEFT JOIN scdp.tproduit p ON t.code_prod = p.code_prod
    LEFT JOIN scdp.tdistributeur dis ON t.code_dis = dis.code_dis
""")
sort_join_count = cursor.fetchone()[0]
print(f'TSortie count with joins: {sort_join_count}')

conn.close()
