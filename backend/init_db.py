from pymongo import MongoClient
from main import get_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["shield_ops"]
users_collection = db["users"]

# Sample users
sample_users = [
    {
        "username": "agent.coulson",
        "hashed_password": get_password_hash("shield123"),
        "disabled": False
    },
    {
        "username": "agent.pepper",
        "hashed_password": get_password_hash("shield123"),
        "disabled": False
    },
    {
        "username": "agent.may",
        "hashed_password": get_password_hash("shield123"),
        "disabled": False
    }
]

def init_db():
    # Clear existing users
    users_collection.delete_many({})
    
    # Insert sample users
    users_collection.insert_many(sample_users)
    print("Database initialized with sample users")

if __name__ == "__main__":
    init_db() 