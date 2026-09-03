import requests
import json

# Login
login_response = requests.post(
    "http://localhost:3000/api/v1/auth/login",
    json={"email": "admin@scdp.com", "password": "admin123"}
)
login_data =	login_response.json()
token = login_data["accessToken"]

print(f"Logged in successfully")
print(f"Token: {token[:50]}...")

# Trigger sync
sync_response = requests.post(
    "http://localhost:3000/api/v1/admin/synchronization/run",
    headers={"Authorization": f"Bearer {token}"}
)
sync_data = sync_response.json()

print(f"\nSynchronization result:")
print(json.dumps(sync_data, indent=2))
