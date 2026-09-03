import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Test without filter
response = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary', headers={'Authorization': f'Bearer {token}'})
data = response.json()
print('Without filter:')
print(f'Total depots: {data["totalDepots"]}')
print(f'Total stock volume: {data["totalStockVolume"]}')

# Test with city_id=1 filter (Bafoussam)
response2 = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary?city_id=1', headers={'Authorization': f'Bearer {token}'})
data2 = response2.json()
print('\nWith city_id=1 filter (Bafoussam):')
print(f'Total depots: {data2["totalDepots"]}')
print(f'Total stock volume: {data2["totalStockVolume"]}')
