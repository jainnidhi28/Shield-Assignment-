import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_endpoints():
    # Test 1: Login to get token
    print("\n1. Testing login endpoint...")
    login_data = {
        "username": "agent.coulson",
        "password": "shield123"
    }
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    print(f"Login Response: {response.status_code}")
    print(response.json())
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 2: Get available missions
        print("\n2. Testing get missions endpoint...")
        response = requests.get(f"{BASE_URL}/missions", headers=headers)
        print(f"Missions Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        
        # Test 3: Submit a mission
        print("\n3. Testing submit mission endpoint...")
        mission_data = {
            "agent_id": "agent.coulson",
            "mission": "Deploy Drone Surveillance Unit",
            "details": {
                "drone_id": "drn-007",
                "operation_area": "Sector 12",
                "payload": "Night Vision Camera"
            }
        }
        response = requests.post(f"{BASE_URL}/missions/submit", 
                               headers=headers,
                               json=mission_data)
        print(f"Submit Mission Response: {response.status_code}")
        print(response.json())
        
        # Test 4: Get mission history
        print("\n4. Testing mission history endpoint...")
        response = requests.get(f"{BASE_URL}/missions/history", headers=headers)
        print(f"Mission History Response: {response.status_code}")
        print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_endpoints() 