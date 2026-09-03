import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Test receptions API
print("Testing Receptions API:")
response = requests.get('http://localhost:3000/api/v1/receptions', headers={'Authorization': f'Bearer {token}'}, params={'page': 1, 'limit': 5})
data = response.json()
print(f'Status: {response.status_code}')
print(f'Total: {data.get("meta", {}).get("total", 0)}')
print('Items:')
for item in data.get('items', []):
    print(f"  {item.get('receptionNumber', 'N/A')}: {item.get('quantity', 0)} L - {item.get('distributorName', 'N/A')}")

# Test exits API
print("\nTesting Exits API:")
response = requests.get('http://localhost:3000/api/v1/exits', headers={'Authorization': f'Bearer {token}'}, params={'page': 1, 'limit': 5})
data = response.json()
print(f'Status: {response.status_code}')
print(f'Total: {data.get("meta", {}).get("total", 0)}')
print('Items:')
for item in data.get('items', []):
    print(f"  {item.get('borderauNumber', 'N/A')}: {item.get('quantity', 0)} L - {item.get('distributorName', 'N/A')}")
