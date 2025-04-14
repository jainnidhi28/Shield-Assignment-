from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

class MissionBase(BaseModel):
    mission_type: str
    details: Dict[str, str]

class MissionCreate(MissionBase):
    pass

class MissionUpdate(BaseModel):
    details: Optional[Dict[str, str]] = None
    status: Optional[str] = None

class Mission(MissionBase):
    id: str
    user_id: str
    timestamp: datetime
    updated_at: Optional[datetime] = None
    status: str = "pending"

    class Config:
        orm_mode = True 