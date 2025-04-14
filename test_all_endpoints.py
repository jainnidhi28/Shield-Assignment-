import requests
import json
from datetime import datetime, timezone
import time

def print_separator(title):
    print("\n" + "="*50)
    print(f" {title} ")
    print("="*50 + "\n")

def test_all_endpoints():
    BASE_URL = "http://127.0.0.1:8000"
    
    # Step 1: Test root endpoint
    print_separator("1. Testing Root Endpoint")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 2: Get authentication token
    print_separator("2. Getting Authentication Token")
    token_url = f"{BASE_URL}/token"
    credentials = {
        "username": "varsha24",
        "password": "Sa@230304"
    }
    
    response = requests.post(token_url, json=credentials)
    print(f"Status: {response.status_code}")
    
    if response.status_code != 200:
        print("Failed to get token. Exiting...")
        return
        
    token = response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Step 3: Get user profile
    print_separator("3. Getting User Profile")
    profile_url = f"{BASE_URL}/users/me"
    response = requests.get(profile_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 4: Get available missions
    print_separator("4. Getting Available Missions")
    available_url = f"{BASE_URL}/missions/available"
    response = requests.get(available_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 5: Submit a test mission
    print_separator("5. Submitting Test Mission")
    mission_data = {
        "mission_type": "drone-surveillance",
        "drone_id": "test-drone-001",
        "operation_area": "Test Area Alpha",
        "payload": "Test Payload",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    submit_url = f"{BASE_URL}/missions/submit"
    response = requests.post(submit_url, json=mission_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    mission_id = None
    if response.status_code == 200:
        mission_id = response.json().get("mission_id")
    
    # Step 6: List all missions
    print_separator("6. Listing All Missions")
    list_url = f"{BASE_URL}/missions/list"
    response = requests.get(list_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 7: Get mission history
    print_separator("7. Getting Mission History")
    history_url = f"{BASE_URL}/missions/history"
    response = requests.get(history_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 8: Get security metrics
    print_separator("8. Getting Security Metrics")
    metrics_url = f"{BASE_URL}/security/metrics"
    response = requests.get(metrics_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 9: Update user profile
    print_separator("9. Updating User Profile")
    update_data = {
        "email": "varsha24_updated@example.com",
        "full_name": "Varsha Updated"
    }
    update_url = f"{BASE_URL}/users/me"
    response = requests.put(update_url, json=update_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 10: Toggle 2FA
    print_separator("10. Toggling 2FA")
    twofa_url = f"{BASE_URL}/users/me/2fa"
    response = requests.post(twofa_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 11: Delete test mission if one was created
    if mission_id:
        print_separator("11. Deleting Test Mission")
        delete_url = f"{BASE_URL}/missions/drone-surveillance/{mission_id}"
        response = requests.delete(delete_url, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Verify deletion
        print("\nVerifying deletion:")
        response = requests.get(list_url, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    test_all_endpoints() 