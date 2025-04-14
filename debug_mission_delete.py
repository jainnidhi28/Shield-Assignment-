import requests
import json
from datetime import datetime
from pymongo import MongoClient

# Configuration
BASE_URL = "http://localhost:8000"
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "shield_ops"

def print_separator():
    print("\n" + "="*80 + "\n")

def debug_mission_delete():
    print_separator()
    print("MISSION DELETE DEBUGGING TOOL")
    print_separator()
    
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db["users"]
    missions_collection = db["missions"]
    
    # 1. Get user credentials
    username = input("Enter username: ").strip()
    password = input("Enter password: ").strip()
    
    # 2. Login to get token
    print(f"\nLogging in as {username}...")
    try:
        response = requests.post(
            f"{BASE_URL}/token",
            json={"username": username, "password": password}
        )
        
        if response.status_code != 200:
            print(f"Login failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return
            
        token_data = response.json()
        token = token_data.get("access_token")
        print(f"✅ Login successful! Token obtained.")
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. List available missions
    user_missions = []
    print("\nListing missions from database...")
    try:
        # Query MongoDB directly for missions submitted by this user
        user_missions = list(missions_collection.find({"submitted_by": username}))
        print(f"Found {len(user_missions)} missions for user '{username}' in database:")
        
        for i, mission in enumerate(user_missions):
            mission_id = str(mission["_id"])
            mission_type = mission.get("mission_type", "unknown")
            timestamp = mission.get("timestamp", "unknown")
            print(f"{i+1}. ID: {mission_id} | Type: {mission_type} | Time: {timestamp}")
            
    except Exception as e:
        print(f"❌ Database query error: {str(e)}")
    
    # 4. Try API mission listing
    print("\nListing missions via API...")
    try:
        response = requests.get(f"{BASE_URL}/missions/list", headers=headers)
        
        if response.status_code != 200:
            print(f"API mission listing failed with status code {response.status_code}")
            print(f"Response: {response.text}")
        else:
            api_missions = response.json()
            print(f"API returned {len(api_missions)} missions:")
            for i, mission in enumerate(api_missions):
                mission_id = mission.get("id")
                mission_type = mission.get("mission_type", "unknown")
                print(f"{i+1}. ID: {mission_id} | Type: {mission_type}")
    
    except Exception as e:
        print(f"❌ API call error: {str(e)}")
    
    # 5. Select a mission to delete
    if not user_missions:
        print("\nNo missions found to delete. Creating a test mission...")
        # Create a mission
        mission_data = {
            "mission_type": "drone-surveillance",
            "details": {
                "drone_id": "debug-drone",
                "operation_area": "Debug Zone",
                "payload": "Debug Sensors"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/missions/submit",
                json=mission_data,
                headers=headers
            )
            
            if response.status_code not in [200, 201]:
                print(f"Failed to create mission: {response.status_code}")
                print(f"Response: {response.text}")
                return
                
            mission_response = response.json()
            if "mission" in mission_response and "id" in mission_response["mission"]:
                mission_id = mission_response["mission"]["id"]
            elif "id" in mission_response:
                mission_id = mission_response["id"]
            else:
                print("No mission ID found in response")
                return
                
            print(f"Created mission with ID: {mission_id}")
            mission_type = mission_data["mission_type"]
            
        except Exception as e:
            print(f"❌ Create mission error: {str(e)}")
            return
    else:
        print("\nSelect a mission to delete:")
        mission_index = int(input("Enter mission number from the list above: ")) - 1
        
        if mission_index < 0 or mission_index >= len(user_missions):
            print("Invalid selection")
            return
            
        selected_mission = user_missions[mission_index]
        mission_id = str(selected_mission["_id"])
        mission_type = selected_mission.get("mission_type", "drone-surveillance")
    
    # 6. Verify mission ownership
    print(f"\nVerifying mission with ID: {mission_id}")
    mission = missions_collection.find_one({"_id": missions_collection.database.command('convertToBSON', {'id': mission_id})["_id"]})
    
    if not mission:
        print(f"❌ Mission not found in database: {mission_id}")
        return
        
    print(f"Mission details from database:")
    print(f"  - Submitted by: {mission.get('submitted_by')}")
    print(f"  - Current user: {username}")
    print(f"  - Mission type: {mission.get('mission_type')}")
    print(f"  - Is owner?: {'Yes' if mission.get('submitted_by') == username else 'No'}")
    
    # 7. Attempt to delete the mission
    print(f"\nAttempting to delete mission {mission_id}...")
    try:
        delete_url = f"{BASE_URL}/missions/{mission_type}/{mission_id}"
        print(f"DELETE request to: {delete_url}")
        
        response = requests.delete(
            delete_url,
            headers=headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Mission successfully deleted!")
        else:
            print(f"❌ Failed to delete mission: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Delete request error: {str(e)}")
    
    # 8. Verify mission deletion
    print("\nVerifying deletion...")
    mission = missions_collection.find_one({"_id": missions_collection.database.command('convertToBSON', {'id': mission_id})["_id"]})
    
    if mission:
        print(f"❌ Mission still exists in database after deletion attempt")
    else:
        print("✅ Mission successfully removed from database")

if __name__ == "__main__":
    debug_mission_delete() 