import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Get depots
response = requests.get('http://localhost:3000/api/v1/stock/metadata/depots', headers={'Authorization': f'Bearer {token}'})
depots = response.json()

print('Depots from API:')
for d in depots:
    print(f"Code: {d.get('code', d.get('depotCode', 'N/A'))}, Name: {d.get('name', d.get('depotName', 'N/A'))}")
