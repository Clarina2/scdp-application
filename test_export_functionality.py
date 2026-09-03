import requests

# Login
token = requests.post('http://localhost:3000/api/v1/auth/login', json={'email': 'admin@scdp.com', 'password': 'admin123'}).json()['accessToken']

print("Testing CSV Export Functionality")
print("=" * 50)

# Test Receptions Export
print("\n1. Testing Receptions CSV Export...")
try:
    response = requests.get('http://localhost:3000/api/v1/receptions/export/csv', 
                          headers={'Authorization': f'Bearer {token}'},
                          params={'depot_code': 'BA', 'limit': 10})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Disposition: {response.headers.get('Content-Disposition')}")
        print(f"File size: {len(response.content)} bytes")
        print("First 200 characters of CSV:")
        print(response.content.decode('utf-8')[:200])
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

# Test Exits Export
print("\n2. Testing Exits CSV Export...")
try:
    response = requests.get('http://localhost:3000/api/v1/exits/export/csv', 
                          headers={'Authorization': f'Bearer {token}'},
                          params={'depot_code': 'BA', 'limit': 10})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Disposition: {response.headers.get('Content-Disposition')}")
        print(f"File size: {len(response.content)} bytes")
        print("First 200 characters of CSV:")
        print(response.content.decode('utf-8')[:200])
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

# Test Receptions Export without filters
print("\n3. Testing Receptions CSV Export (no filters)...")
try:
    response = requests.get('http://localhost:3000/api/v1/receptions/export/csv', 
                          headers={'Authorization': f'Bearer {token}'})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Disposition: {response.headers.get('Content-Disposition')}")
        print(f"File size: {len(response.content)} bytes")
        print("First 200 characters of CSV:")
        print(response.content.decode('utf-8')[:200])
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

print("\n" + "=" * 50)
print("Export functionality test completed")
