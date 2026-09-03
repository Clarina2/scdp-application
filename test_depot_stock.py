import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Test without filter
response = requests.get('http://localhost:3000/api/v1/admin/dashboard/stock/depots', headers={'Authorization': f'Bearer {token}'})
data = response.json()
print('Without filter:')
print(f'Number of depots: {len(data)}')

# Test with city_id=1 filter (Bafoussam)
response2 = requests.get('http://localhost:3000/api/v1/admin/dashboard/stock/depots?city_id=1', headers={'Authorization': f'Bearer {token}'})
data2 = response2.json()
print('\nWith city_id=1 filter (Bafoussam):')
print(f'Number of depots: {len(data2)}')
