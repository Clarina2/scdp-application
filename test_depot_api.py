import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Get depot stock data
response = requests.get('http://localhost:3000/api/v1/admin/dashboard/stock/depots', headers={'Authorization': f'Bearer {token}'})
data = response.json()

print(f'Status: {response.status_code}')
print(f'Depots returned: {len(data)}')
print('\nDepot stock data:')
for d in data:
    depot_name = d.get('depot_name', d.get('depot_nom', 'N/A'))
    stock = d.get('stock_volume', d.get('total_stock', 0))
    print(f'{depot_name}: {stock} L')
