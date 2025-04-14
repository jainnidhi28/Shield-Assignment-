import requests
import json
from datetime import datetime, timezone

# Configuration
BASE_URL = "http://127.0.0.1:8000"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2YXJzaGEyNCIsImV4cCI6MTc0NDYzMjgwNX0.VzVJHS500kmGMENHGItn6heYC4OmxQSATnqZcI7XvtY"

# Set up headers with the provided token
headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# Function to submit a mission
def submit_mission(mission_type, operation_area, drone_id, payload):
    print(f"\n{'='*50}")
    print(f" Submitting {mission_type} Mission ")
    print(f"{'='*50}\n")
    
    # Prepare mission data
    mission_data = {
        "mission_type": mission_type,
        "operation_area": operation_area,
        "drone_id": drone_id,
        "payload": payload,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Print the data being sent
    print("Sending data:")
    print(json.dumps(mission_data, indent=2))
    
    # Make the API request
    submit_url = f"{BASE_URL}/missions/submit"
    response = requests.post(submit_url, json=mission_data, headers=headers)
    
    # Print response details
    print(f"\nStatus Code: {response.status_code}")
    try:
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except:
        print(f"Response (text): {response.text}")
    
    # Return mission ID if successful
    if response.status_code == 200 and 'mission_id' in response.json():
        return response.json()['mission_id']
    return None

# Main testing function
def main():
    print("Testing /missions/submit endpoint")
    print(f"Using token: {ACCESS_TOKEN[:15]}...")
    
    # Test with different mission types
    mission_types = [
        {
            "type": "drone-surveillance",
            "area": "Downtown District",
            "drone_id": "falcon-x200",
            "payload": "High resolution camera"
        },
        {
            "type": "ground-patrol",
            "area": "Perimeter Section B",
            "drone_id": "patrol-bot-5",
            "payload": "Motion sensors"
        },
        {
            "type": "aerial-reconnaissance",
            "area": "Forest Edge Zone",
            "drone_id": "recon-drone-12",
            "payload": "Thermal imaging system"
        }
    ]
    
    successful_missions = []
    
    # Submit each mission type
    for mission in mission_types:
        mission_id = submit_mission(
            mission["type"],
            mission["area"],
            mission["drone_id"],
            mission["payload"]
        )
        
        if mission_id:
            successful_missions.append((mission["type"], mission_id))
    
    # Print summary
    print("\n" + "="*50)
    print(" Summary ")
    print("="*50)
    
    if successful_missions:
        print(f"\nSuccessfully submitted {len(successful_missions)} missions:")
        for mission_type, mission_id in successful_missions:
            print(f"- {mission_type}: {mission_id}")
    else:
        print("\nNo missions were successfully submitted.")

if __name__ == "__main__":
    main() 