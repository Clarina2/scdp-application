import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Get cities
response = requests.get('http://localhost:3000/api/v1/stock/metadata/cities', headers={'Authorization': f'Bearer {token}'})
cities = response.json()

print('Cities from API:')
for c in cities:
    print(f"{c['code']}: {c['name']}")
