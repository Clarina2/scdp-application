import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

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

def get_auth_token():
    """Create test user and get auth token"""
    print("\nCreating test user and getting token...")
    
    # Create application
    app_data = {
        "name": "Test User",
        "email": "test_sync@example.com",
        "companyName": "Test Company"
    }
    
    response = requests.post(f"{BASE_URL}/marketer-applications", json=app_data)
    print(f"Application creation: {response.status_code}")
    
    # Login with test credentials (assuming test user exists or we use admin)
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json().get('access_token')
        print(f"Login successful, got token")
        return token
    else:
        print(f"Login failed: {response.text}")
        return None

def test_receptions(token):
    """Test receptions endpoint with new fields"""
    print("\nTesting receptions endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = requests.get(f"{BASE_URL}/receptions?page=1&limit=5", headers=headers)
    print(f"Receptions status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total records: {data.get('total', 0)}")
        
        if data.get('items'):
            print("\nSample reception record:")
            item = data['items'][0]
            print(f"  id: {item.get('id')}")
            print(f"  numBor: {item.get('numBor')}")
            print(f"  depotName: {item.get('depotName')}")
            print(f"  productName: {item.get('productName')}")
            print(f"  qteTA: {item.get('qteTA')}")
            print(f"  qte15: {item.get('qte15')}")
            print(f"  modeTransfert: {item.get('modeTransfert')}")
            print(f"  numMatricule: {item.get('numMatricule')}")
            print(f"  numBE: {item.get('numBE')}")
            print(f"  heureChargement: {item.get('heureChargement')}")
    else:
        print(f"Error: {response.text}")

def test_exits(token):
    """Test exits endpoint with new fields"""
    print("\nTesting exits endpoint...")
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = requests.get(f"{BASE_URL}/exits?page=1&limit=5", headers=headers)
    print(f"Exits status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total records: {data.get('total', 0)}")
        
        if data.get('items'):
            print("\nSample exit record:")
            item = data['items'][0]
            print(f"  id: {item.get('id')}")
            print(f"  numBor: {item.get('numBor')}")
            print(f"  depotName: {item.get('depotName')}")
            print(f"  productName: {item.get('productName')}")
            print(f"  qteSortie: {item.get('qteSortie')}")
            print(f"  typeBordereau: {item.get('typeBordereau')}")
            print(f"  origine: {item.get('origine')}")
            print(f"  modeTransport: {item.get('modeTransport')}")
            print(f"  qteCharge15: {item.get('qteCharge15')}")
            print(f"  numMatricule: {item.get('numMatricule')}")
            print(f"  numBE: {item.get('numBE')}")
            print(f"  dateArrivee: {item.get('dateArrivee')}")
            print(f"  qteRecueTA: {item.get('qteRecueTA')}")
            print(f"  qteRecue15: {item.get('qteRecue15')}")
            print(f"  heureChargement: {item.get('heureChargement')}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    try:
        test_health()
        token = get_auth_token()
        test_receptions(token)
        test_exits(token)
    except Exception as e:
        print(f"Error: {e}")


