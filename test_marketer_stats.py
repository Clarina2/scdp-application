import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Get marketer statistics
response = requests.get('http://localhost:3000/api/v1/admin/dashboard/statistics/marketers', headers={'Authorization': f'Bearer {token}'})
data = response.json()

print(f'Status: {response.status_code}')
print(f'Marketers returned: {len(data)}')
print('\nMarketer statistics:')
for m in data:
    print(f"{m.get('name', m.get('code', 'N/A'))}: {m.get('volume', 0)} L ({m.get('percentage', 0)}%)")
