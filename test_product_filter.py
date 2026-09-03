import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Test without filter
response = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary', headers={'Authorization': f'Bearer {token}'})
data = response.json()
print('Without filter:')
print(f'Total stock volume: {data["totalStockVolume"]}')

# Test with product_code filter (Super)
response2 = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary?product_code=SU', headers={'Authorization': f'Bearer {token}'})
data2 = response2.json()
print('\nWith product_code=SU filter (Super):')
print(f'Total stock volume: {data2["totalStockVolume"]}')

# Test depot stock statistics with product filter
response3 = requests.get('http://localhost:3000/api/v1/admin/dashboard/stock/depots?product_code=SU', headers={'Authorization': f'Bearer {token}'})
data3 = response3.json()
print(f'\nDepot stock with product_code=SU: {len(data3)} depots')
