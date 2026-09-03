import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Get products
response = requests.get('http://localhost:3000/api/v1/stock/metadata/products', headers={'Authorization': f'Bearer {token}'})
products = response.json()

print('Products from API:')
for p in products:
    print(f"Code: {p.get('code', 'N/A')}, Name: {p.get('name', 'N/A')}")
