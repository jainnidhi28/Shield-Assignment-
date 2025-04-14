import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"
TEST_USER = {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "Test@123"
}

def print_separator():
    print("\n" + "="*80 + "\n")

def test_all_endpoints():
    token = None
    mission_id = None
    
    print_separator()
    print("Starting SHIELD API endpoint tests")
    print_separator()
    
    # Test 1: Root endpoint
    print("1. Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200, "Root endpoint should return 200"
        print("✅ Root endpoint test passed")
    except Exception as e:
        print(f"❌ Root endpoint test failed: {str(e)}")
    
    print_separator()
    
    # Test 2: Register user
    print("2. Testing user registration...")
    try:
        response = requests.post(f"{BASE_URL}/register", json=TEST_USER)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json() if response.status_code < 400 else response.text}")
        if response.status_code not in [200, 201, 409]:  # 409 if user already exists
            raise Exception(f"Registration failed with status code {response.status_code}")
        print("✅ Registration test passed (or user already exists)")
    except Exception as e:
        print(f"❌ Registration test failed: {str(e)}")
    
    print_separator()
    
    # Test 3: Login
    print("3. Testing login endpoint...")
    try:
        response = requests.post(
            f"{BASE_URL}/token",
            json={"username": TEST_USER["username"], "password": TEST_USER["password"]}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json() if response.status_code < 400 else response.text}")
        assert response.status_code == 200, "Login should return 200 OK"
        token = response.json().get("access_token")
        assert token, "Token should be returned"
        print("✅ Login test passed")
    except Exception as e:
        print(f"❌ Login test failed: {str(e)}")
        return  # No point continuing if we can't get a token
    
    # Set up auth headers for subsequent requests
    headers = {"Authorization": f"Bearer {token}"}
    
    print_separator()
    
    # Test 4: Get available missions
    print("4. Testing get available missions endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/missions", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200, "Get missions should return 200 OK"
        print("✅ Get missions test passed")
    except Exception as e:
        print(f"❌ Get missions test failed: {str(e)}")
    
    print_separator()
    
    # Test 5: Submit a mission
    print("5. Testing submit mission endpoint...")
    mission_data = {
        "mission_type": "drone-surveillance",
        "details": {
            "drone_id": "test-drone-001",
            "operation_area": "Test Area",
            "payload": "Test Payload"
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/missions/submit",
            json=mission_data,
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code < 400 else response.text}")
        assert response.status_code in [200, 201], "Submit mission should return 200 or 201"
        
        # Extract mission ID for later tests
        if response.status_code < 400:
            mission_response = response.json()
            if "mission" in mission_response and "id" in mission_response["mission"]:
                mission_id = mission_response["mission"]["id"]
                print(f"Created mission with ID: {mission_id}")
            elif "id" in mission_response:
                mission_id = mission_response["id"]
                print(f"Created mission with ID: {mission_id}")
        
        print("✅ Submit mission test passed")
    except Exception as e:
        print(f"❌ Submit mission test failed: {str(e)}")
    
    print_separator()
    
    # Test 6: List missions
    print("6. Testing list missions endpoint...")
    try:
        response = requests.get(
            f"{BASE_URL}/missions/list",
            params={"mission_type": "drone-surveillance"},
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code < 400 else response.text}")
        assert response.status_code == 200, "List missions should return 200 OK"
        print("✅ List missions test passed")
    except Exception as e:
        print(f"❌ List missions test failed: {str(e)}")
    
    print_separator()
    
    # Test 7: Get mission history
    print("7. Testing mission history endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/missions/history", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code < 400 else response.text}")
        assert response.status_code == 200, "Mission history should return 200 OK"
        print("✅ Mission history test passed")
    except Exception as e:
        print(f"❌ Mission history test failed: {str(e)}")
    
    print_separator()
    
    # Test 8: Delete a mission (if we have an ID)
    if mission_id:
        print(f"8. Testing delete mission endpoint for ID {mission_id}...")
        try:
            response = requests.delete(
                f"{BASE_URL}/missions/drone-surveillance/{mission_id}",
                headers=headers
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code < 400 and response.text else response.text}")
            assert response.status_code == 200, "Delete mission should return 200 OK"
            print("✅ Delete mission test passed")
        except Exception as e:
            print(f"❌ Delete mission test failed: {str(e)}")
        
        print_separator()
    
    # Test 9: Security metrics
    print("9. Testing security metrics endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/security/metrics", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code < 400 else response.text}")
        print("✅ Security metrics test completed")
    except Exception as e:
        print(f"❌ Security metrics test failed: {str(e)}")
    
    print_separator()
    
    # Test 10: User profile
    print("10. Testing user profile endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/user/profile", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code < 400 else response.text}")
        print("✅ User profile test completed")
    except Exception as e:
        print(f"❌ User profile test failed: {str(e)}")
    
    print_separator()
    
    # Test 11: Toggle 2FA
    print("11. Testing 2FA toggle endpoint...")
    try:
        response = requests.post(
            f"{BASE_URL}/user/2fa/toggle",
            json={"enabled": True},
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code < 400 else response.text}")
        print("✅ 2FA toggle test completed")
    except Exception as e:
        print(f"❌ 2FA toggle test failed: {str(e)}")
    
    print_separator()
    
    # Test 12: Update user profile
    print("12. Testing update user profile endpoint...")
    try:
        profile_update = {
            "username": TEST_USER["username"],
            "email": TEST_USER["email"],
            "fullName": "Test User",
            "avatar": "https://example.com/avatar.jpg",
            "securityLevel": "Level 2"
        }
        response = requests.put(
            f"{BASE_URL}/user/profile",
            json=profile_update,
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code < 400 else response.text}")
        print("✅ Update user profile test completed")
    except Exception as e:
        print(f"❌ Update user profile test failed: {str(e)}")
    
    print_separator()
    print("All endpoint tests completed!")

if __name__ == "__main__":
    test_all_endpoints() 