import requests
import json
from datetime import datetime, timezone
import time

def print_separator(title):
    print("\n" + "="*50)
    print(f" {title} ")
    print("="*50 + "\n")

def debug_missions():
    BASE_URL = "http://127.0.0.1:8000"
    
    # Step 1: Get authentication token
    print_separator("1. Getting Authentication Token")
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
    
    # Step 2: Submit multiple test missions
    print_separator("2. Submitting Test Missions")
    mission_types = ["drone-surveillance", "ground-patrol", "aerial-reconnaissance"]
    mission_ids = []
    
    for mission_type in mission_types:
        mission_data = {
            "mission_type": mission_type,
            "drone_id": f"test-{mission_type}-001",
            "operation_area": f"Test Area {mission_type.title()}",
            "payload": "Test Payload",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        submit_url = f"{BASE_URL}/missions/submit"
        response = requests.post(submit_url, json=mission_data, headers=headers)
        print(f"\nSubmitting {mission_type}:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            mission_id = response.json().get("mission_id")
            mission_ids.append((mission_type, mission_id))
            print(f"Created {mission_type} mission with ID: {mission_id}")
        
        # Wait briefly between submissions
        time.sleep(1)
    
    # Step 3: List all missions
    print_separator("3. Listing All Missions")
    list_url = f"{BASE_URL}/missions/list"
    response = requests.get(list_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 4: Get mission history
    print_separator("4. Getting Mission History")
    history_url = f"{BASE_URL}/missions/history"
    response = requests.get(history_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Step 5: Delete missions one by one
    print_separator("5. Deleting Test Missions")
    for mission_type, mission_id in mission_ids:
        print(f"\nDeleting {mission_type} mission {mission_id}:")
        delete_url = f"{BASE_URL}/missions/{mission_type}/{mission_id}"
        response = requests.delete(delete_url, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Wait briefly between deletions
        time.sleep(1)
    
    # Step 6: Verify deletions
    print_separator("6. Verifying Deletions")
    response = requests.get(list_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    debug_missions() 