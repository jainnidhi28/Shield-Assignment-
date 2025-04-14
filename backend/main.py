from fastapi import FastAPI, Depends, HTTPException, status, Header, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["shield_ops"]
users_collection = db["users"]
missions_collection = db["missions"]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(title="S.H.I.E.L.D. Ops Request Portal")

# Define allowed origins explicitly
origins = [
    "http://localhost:5173", # Vite default dev port
    "http://localhost:5174", # Allow the origin shown in the CORS error
    "http://localhost",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

# CORS middleware configuration (More specific)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Use the specific list of origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Explicitly allow needed methods
    allow_headers=["Authorization", "Content-Type"], # Explicitly allow needed headers
)

# Root endpoint for testing
@app.get("/")
async def root():
    return {"message": "Welcome to S.H.I.E.L.D. Ops Request Portal API"}

# Models
class User(BaseModel):
    username: str
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class MissionRequest(BaseModel):
    agent_id: str
    mission: str
    details: dict

class MissionType(BaseModel):
    id: str
    name: str
    fields: List[str]

class MissionHistory(BaseModel):
    mission: str
    details: dict
    submitted_by: str
    submitted_at: datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: str
    disabled: bool

class SecurityMetrics(BaseModel):
    securityScore: int
    activeThreats: int
    lastLoginAttempts: list[dict]
    securityEvents: list[dict]

class UserProfile(BaseModel):
    username: str
    email: str
    fullName: str = ""
    avatar: str = ""
    twoFactorEnabled: bool = False
    securityLevel: str = "Level 1"

class MissionSubmitRequest(BaseModel):
    mission_type: str
    details: dict
    timestamp: str

class MissionResponse(BaseModel):
    id: str
    mission_type: str
    timestamp: str
    details: dict

# Add a model for the update request body (can be flexible)
class MissionUpdateData(BaseModel):
    details: Dict[str, Any] = Field(..., description="The updated details for the mission")
    # Add other fields you want to allow updating, e.g.:
    # operation_area: Optional[str] = None 
    # payload: Optional[str] = None

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(username: str):
    user_data = users_collection.find_one({"username": username})
    if user_data:
        return UserInDB(**user_data)

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: dict):
    user = authenticate_user(form_data["username"], form_data["password"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/missions", response_model=List[MissionType])
async def get_available_missions(current_user: User = Depends(get_current_user)):
    """
    Get list of available missions.
    Requires authentication via Bearer token.
    """
    try:
        missions = [
            {
                "id": "drone-surveillance",
                "name": "Deploy Drone Surveillance Unit",
                "fields": ["drone_id", "operation_area", "payload"]
            },
            {
                "id": "secure-communications",
                "name": "Set Up Secure Communications Relay",
                "fields": ["relay_id", "channel", "encryption_protocol"]
            },
            {
                "id": "intelligence-sync",
                "name": "Sync Classified Intelligence Database",
                "fields": ["database_name", "sync_frequency", "transmission_channel"]
            }
        ]
        return missions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/missions/submit", response_model=dict)
async def submit_mission(
    mission_request: MissionSubmitRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Create mission document
        mission_doc = {
            "mission_type": mission_request.mission_type,
            "details": mission_request.details,
            "timestamp": mission_request.timestamp,
            "submitted_by": current_user.username,
            "status": "pending"
        }
        
        # Insert into database
        result = missions_collection.insert_one(mission_doc)
        
        # Ensure the inserted_id exists before proceeding
        if not result.inserted_id:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert mission into database"
             )

        # Prepare the response document
        response_mission = mission_doc.copy() # Avoid modifying original dict used elsewhere
        response_mission["_id"] = result.inserted_id # Use _id as key to avoid conflict if details has 'id'
        
        # Convert ObjectId to string for JSON serialization
        response_mission["_id"] = str(response_mission["_id"])
        
        return {"message": "Mission request submitted successfully", "mission": response_mission}
    except Exception as e:
        # Log the exception for better debugging
        print(f"Error submitting mission: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            # Provide a more generic error message to the client
            detail="An internal error occurred while submitting the mission."
        )

@app.get("/missions/history", response_model=List[MissionHistory])
async def get_mission_history(
    current_user: User = Depends(get_current_user),
    authorization: str = Header(None)
):
    """
    Get mission history for the current user.
    Requires authentication via Bearer token.
    """
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
            
        missions = list(missions_collection.find(
            {"submitted_by": username},
            {"_id": 0}
        ))
        
        # Convert datetime objects to ISO format
        for mission in missions:
            if isinstance(mission.get("submitted_at"), datetime):
                mission["submitted_at"] = mission["submitted_at"].isoformat()
                
        return missions
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    # Check if username already exists
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "disabled": False
    }
    
    users_collection.insert_one(user_data)
    
    return {
        "username": user.username,
        "email": user.email,
        "disabled": False
    }

@app.get("/security/metrics")
async def get_security_metrics(current_user: User = Depends(get_current_user)):
    """
    Get security metrics for the dashboard.
    Requires authentication via Bearer token.
    """
    try:
        # In a real application, these would come from a database
        metrics = SecurityMetrics(
            securityScore=85,
            activeThreats=3,
            lastLoginAttempts=[
                {
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": "success",
                    "ipAddress": "192.168.1.1",
                    "location": "New York, US"
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                    "status": "failed",
                    "ipAddress": "10.0.0.1",
                    "location": "Unknown"
                }
            ],
            securityEvents=[
                {
                    "id": 1,
                    "type": "unauthorized_access",
                    "severity": "high",
                    "timestamp": datetime.utcnow().isoformat(),
                    "description": "Multiple failed login attempts detected"
                },
                {
                    "id": 2,
                    "type": "system_update",
                    "severity": "low",
                    "timestamp": datetime.utcnow().isoformat(),
                    "description": "Security patches installed successfully"
                }
            ]
        )
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/user/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get user profile information.
    Requires authentication via Bearer token.
    """
    try:
        user_data = users_collection.find_one(
            {"username": current_user.username},
            {"_id": 0, "hashed_password": 0}
        )
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Add default values if fields don't exist
        user_data.setdefault("fullName", "")
        user_data.setdefault("avatar", "")
        user_data.setdefault("twoFactorEnabled", False)
        user_data.setdefault("securityLevel", "Level 1")
        
        return UserProfile(**user_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/user/2fa/toggle")
async def toggle_2fa(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Toggle two-factor authentication for the user.
    Requires authentication via Bearer token.
    """
    try:
        enabled = request.get("enabled", False)
        result = users_collection.update_one(
            {"username": current_user.username},
            {"$set": {"twoFactorEnabled": enabled}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "2FA settings updated successfully", "enabled": enabled}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.put("/user/profile", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfile,
    current_user: User = Depends(get_current_user)
):
    """
    Update user profile information.
    Requires authentication via Bearer token.
    """
    try:
        # Don't allow changing username through this endpoint
        update_data = profile_update.dict(exclude={"username"})
        result = users_collection.update_one(
            {"username": current_user.username},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get updated profile
        updated_profile = users_collection.find_one(
            {"username": current_user.username},
            {"_id": 0, "hashed_password": 0}
        )
        return UserProfile(**updated_profile)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/missions/list", response_model=List[MissionResponse])
async def list_missions(
    mission_type: str = Query(None),
    current_user: User = Depends(get_current_user)
):
    try:
        # Build query
        query = {}
        if mission_type:
            query["mission_type"] = mission_type
            
        # Get missions from database
        missions = list(missions_collection.find(query))
        
        # Format response
        formatted_missions = []
        for mission in missions:
            formatted_mission = {
                "id": str(mission["_id"]),
                "mission_type": mission.get("mission_type", "unknown"),
                "timestamp": mission.get("timestamp", ""),
                "details": mission.get("details", {}),
                "status": mission.get("status", "pending")
            }
            formatted_missions.append(formatted_mission)
            
        return formatted_missions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/missions/{mission_type}/{mission_id}", response_model=dict)
async def get_mission(
    mission_type: str,
    mission_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific mission by ID and type."""
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(mission_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid mission ID format: {mission_id}"
            )
            
        obj_id = ObjectId(mission_id)
        
        # Find the mission
        mission = missions_collection.find_one({
            "_id": obj_id,
            "mission_type": mission_type
        })

        if not mission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission with ID {mission_id} not found"
            )

        # Check ownership
        if mission.get("submitted_by") != current_user.username:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this mission"
            )

        # Convert ObjectId to string for JSON serialization
        mission["_id"] = str(mission["_id"])
        
        # Convert datetime fields if present
        if isinstance(mission.get("timestamp"), datetime):
            mission["timestamp"] = mission["timestamp"].isoformat()
        if isinstance(mission.get("updated_at"), datetime):
            mission["updated_at"] = mission["updated_at"].isoformat()
            
        return {"message": "Mission found", "mission": mission}

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve mission: {str(e)}"
        )

@app.delete("/missions/{mission_type}/{mission_id}", status_code=status.HTTP_200_OK)
async def delete_mission(
    mission_type: str, # Included for path consistency, though not strictly needed for deletion by ID
    mission_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a specific mission request by its ID."""
    print(f"Attempting delete: mission_id={mission_id}, user={current_user.username}")
    try:
        # Validate ObjectId format before conversion
        if not ObjectId.is_valid(mission_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Invalid mission ID format: {mission_id}"
            )
            
        obj_id = ObjectId(mission_id)
        
        # Find the mission first to check ownership
        mission = missions_collection.find_one({"_id": obj_id})

        if not mission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission with ID {mission_id} not found"
            )

        # Verify ownership
        submitted_by = mission.get("submitted_by")
        print(f"Mission found: submitted_by={submitted_by}, current_user={current_user.username}")
        if submitted_by != current_user.username:
            print("Ownership check failed!")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this mission"
            )

        # Delete the mission
        delete_result = missions_collection.delete_one({"_id": obj_id})

        if delete_result.deleted_count == 1:
            return {"message": f"Mission {mission_id} successfully deleted"}
        else:
            # This case should theoretically not happen if find_one succeeded
            # but included for robustness.
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mission with ID {mission_id} found but could not be deleted"
            )

    except HTTPException as http_exc: # Re-raise known HTTP exceptions
        raise http_exc
    except Exception as e:
        # Catch potential ObjectId conversion errors or other issues
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete mission: {str(e)}"
        )

@app.put("/missions/{mission_type}/{mission_id}", response_model=dict)
async def update_mission(
    mission_type: str,
    mission_id: str,
    mission_update: MissionUpdateData,
    current_user: User = Depends(get_current_user)
):
    # Validate the ObjectId
    try:
        obj_id = ObjectId(mission_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid mission ID format: {mission_id}")

    # Find the existing mission
    existing_mission = missions_collection.find_one({
        "_id": obj_id,
        "mission_type": mission_type  # Add mission type to the query
    })

    if not existing_mission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Mission with ID {mission_id} not found")

    # Check ownership
    if existing_mission.get("submitted_by") != current_user.username:
        # Log the attempt for security auditing
        print(f"Ownership check failed: User '{current_user.username}' attempted to update mission '{mission_id}' owned by '{existing_mission.get("submitted_by")}'")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this mission")

    # Prepare the update document - only update fields provided in the request
    update_data = {f"details.{k}": v for k, v in mission_update.details.items()}
    # Add an 'updated_at' timestamp
    update_data["updated_at"] = datetime.utcnow()

    if not update_data:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")

    try:
        result = missions_collection.update_one(
            {"_id": obj_id, "mission_type": mission_type},  # Add mission type to the query
            {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Mission with ID {mission_id} not found during update attempt")

        # Fetch the updated document to return it
        updated_mission = missions_collection.find_one({"_id": obj_id})
        if updated_mission:
             # Convert ObjectId back to string for the response
             updated_mission["_id"] = str(updated_mission["_id"])
             # Convert other non-serializable fields if necessary (e.g., datetime)
             if isinstance(updated_mission.get("updated_at"), datetime):
                 updated_mission["updated_at"] = updated_mission["updated_at"].isoformat()
             if isinstance(updated_mission.get("timestamp"), datetime):
                 updated_mission["timestamp"] = updated_mission["timestamp"].isoformat()
                 
             return {"message": "Mission updated successfully", "mission": updated_mission}
        else:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve updated mission details")

    except Exception as e:
        print(f"Error updating mission {mission_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal error occurred while updating the mission.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 