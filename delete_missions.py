import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables (adjust path if .env is elsewhere)
# Fix for __file__ not being defined when run directly sometimes
try:
    script_dir = os.path.dirname(__file__)
except NameError:
    script_dir = '.' # Fallback to current directory
dotenv_path = os.path.join(script_dir, '.env') 

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
    print(f"Loaded environment variables from: {dotenv_path}")
else:
    print(f".env file not found at: {dotenv_path}, using default MONGO_URI")

# Configuration
# Change the target mission type here
MISSION_TYPE_TO_DELETE = "secure-communications"
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
DB_NAME = "shield_ops"
COLLECTION_NAME = "missions"

print(f"Connecting to MongoDB at: {MONGO_URI}")

try:
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    missions_collection = db[COLLECTION_NAME]

    # Define the filter
    filter_criteria = {'mission_type': MISSION_TYPE_TO_DELETE}
    print(f"Deleting missions matching: {filter_criteria}")

    # Perform the deletion
    result = missions_collection.delete_many(filter_criteria)

    # Print the result
    print(f"\nSuccessfully deleted {result.deleted_count} '{MISSION_TYPE_TO_DELETE}' mission(s) from {DB_NAME}.{COLLECTION_NAME}.")

except Exception as e:
    print(f"\nAn error occurred: {e}")

finally:
    if 'client' in locals() and client:
        client.close()
        print("MongoDB connection closed.") 