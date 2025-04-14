from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

def test_mongodb_connection():
    try:
        # MongoDB configuration
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        client.server_info()
        print("Successfully connected to MongoDB!")
        
        # Test database access
        db = client["shield_ops"]
        users_count = db.users.count_documents({})
        print(f"Number of users in database: {users_count}")
        
        return True
    except Exception as e:
        print(f"Failed to connect to MongoDB: {str(e)}")
        return False

if __name__ == "__main__":
    test_mongodb_connection() 