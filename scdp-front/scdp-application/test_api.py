import requests
import json

BASE_URL = "http://localhost:3000/api/v1"

def test_health():
    """Test health endpoints"""
    print("Testing health endpoints...")
    
    # General health
    response = requests.get(f"{BASE_URL}/health/")
    print(f"Health check: {response.status_code} - {response.json()}")
    
    # Database health
    response = requests.get(f"{BASE_URL}/health/database")
    print(f"Database health: {response.status_code} - {response.json()}")
    
    # SCDP health
    response = requests.get(f"{BASE_URL}/health/scdp")
    print(f"SCDP health: {response.status_code} - {response.json()}")

def test_application():
    """Test marketer application creation"""
    print("\nTesting marketer application creation...")
    
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "companyName": "Test Company"
    }
    
    response = requests.post(f"{BASE_URL}/marketer-applications", json=data)
    print(f"Application creation: {response.status_code} - {response.json()}")

def test_login():
    """Test login endpoint"""
    print("\nTesting login endpoint...")
    
    data = {
        "email": "test@example.com",
        "password": "test123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Login: {response.status_code} - {response.json()}")

if __name__ == "__main__":
    try:
        test_health()
        test_application()
        test_login()
    except Exception as e:
        print(f"Error: {e}")
