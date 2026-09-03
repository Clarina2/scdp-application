import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Test without filter
print('Test 1: No filter')
response = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary', headers={'Authorization': f'Bearer {token}'})
data = response.json()
print(f'Total stock volume: {data["totalStockVolume"]}')
print(f'Total depots: {data["totalDepots"]}')

# Test with city_id=1
print('\nTest 2: city_id=1')
response2 = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary?city_id=1', headers={'Authorization': f'Bearer {token}'})
data2 = response2.json()
print(f'Total stock volume: {data2["totalStockVolume"]}')
print(f'Total depots: {data2["totalDepots"]}')

# Test with city_id=1 and depot_code=BA
print('\nTest 3: city_id=1 + depot_code=BA')
response3 = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary?city_id=1&depot_code=BA', headers={'Authorization': f'Bearer {token}'})
data3 = response3.json()
print(f'Total stock volume: {data3["totalStockVolume"]}')
print(f'Total depots: {data3["totalDepots"]}')

# Test with city_id=1 and product_code=SU
print('\nTest 4: city_id=1 + product_code=SU')
response4 = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary?city_id=1&product_code=SU', headers={'Authorization': f'Bearer {token}'})
data4 = response4.json()
print(f'Total stock volume: {data4["totalStockVolume"]}')
print(f'Total depots: {data4["totalDepots"]}')

# Test with all filters
print('\nTest 5: city_id=1 + depot_code=BA + product_code=SU')
response5 = requests.get('http://localhost:3000/api/v1/admin/dashboard/summary?city_id=1&depot_code=BA&product_code=SU', headers={'Authorization': f'Bearer {token}'})
data5 = response5.json()
print(f'Total stock volume: {data5["totalStockVolume"]}')
print(f'Total depots: {data5["totalDepots"]}')
