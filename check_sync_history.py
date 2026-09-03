import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

# Get sync history
response = requests.get('http://localhost:3000/api/v1/admin/synchronization/runs', headers={'Authorization': f'Bearer {token}'}, params={'limit': 20})
print('Response status:', response.status_code)
print('Response type:', type(response.json()))
print('Response:', response.json())
