import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Test with city_id=1 (Bafoussam)
print('Test 1: city_id=1 only')
response = requests.get('http://localhost:3000/api/v1/admin/dashboard/stock/depots?city_id=1', headers={'Authorization': f'Bearer {token}'})
data = response.json()
print(f'Result: {len(data)} depots')
if data:
    print(f'First depot: {data[0]}')

# Test with city_id=1 and depot_code=BA (BAFOUSSAM)
print('\nTest 2: city_id=1 + depot_code=BA')
response2 = requests.get('http://localhost:3000/api/v1/admin/dashboard/stock/depots?city_id=1&depot_code=BA', headers={'Authorization': f'Bearer {token}'})
data2 = response2.json()
print(f'Result: {len(data2)} depots')
if data2:
    print(f'First depot: {data2[0]}')

# Test with city_id=1 and product_code=SU
print('\nTest 3: city_id=1 + product_code=SU')
response3 = requests.get('http://localhost:3000/api/v1/admin/dashboard/stock/depots?city_id=1&product_code=SU', headers={'Authorization': f'Bearer {token}'})
data3 = response3.json()
print(f'Result: {len(data3)} depots')
if data3:
    print(f'First depot: {data3[0]}')

# Test with all filters
print('\nTest 4: city_id=1 + depot_code=BA + product_code=SU')
response4 = requests.get('http://localhost:3000/api/v1/admin/dashboard/stock/depots?city_id=1&depot_code=BA&product_code=SU', headers={'Authorization': f'Bearer {token}'})
data4 = response4.json()
print(f'Result: {len(data4)} depots')
if data4:
    print(f'First depot: {data4[0]}')
