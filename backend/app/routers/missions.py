from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models.mission import Mission, MissionCreate, MissionUpdate
from ..database import get_db
from sqlalchemy.orm import Session
from ..auth.auth_bearer import JWTBearer
from datetime import datetime

router = APIRouter(prefix="/missions", tags=["missions"])

@router.get("/list", response_model=List[Mission])
async def list_missions(
    mission_type: str = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(JWTBearer())
):
    """List all missions, optionally filtered by type"""
    query = db.query(Mission)
    
    if mission_type:
        query = query.filter(Mission.mission_type == mission_type)
    
    # Only return missions belonging to the current user
    query = query.filter(Mission.user_id == current_user.get("user_id"))
    
    missions = query.all()
    return missions

@router.post("/submit", response_model=Mission)
async def submit_mission(
    mission: MissionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(JWTBearer())
):
    """Submit a new mission request"""
    db_mission = Mission(
        **mission.dict(),
        user_id=current_user.get("user_id"),
        timestamp=datetime.utcnow(),
        status="pending"
    )
    
    try:
        db.add(db_mission)
        db.commit()
        db.refresh(db_mission)
        return db_mission
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit mission: {str(e)}"
        )

@router.delete("/{mission_type}/{mission_id}", response_model=dict)
async def delete_mission(
    mission_type: str,
    mission_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(JWTBearer())
):
    """Delete a specific mission request"""
    mission = db.query(Mission).filter(
        Mission.id == mission_id,
        Mission.mission_type == mission_type
    ).first()
    
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mission with ID {mission_id} not found"
        )
    
    # Check if the user has permission to delete this mission
    if mission.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this mission"
        )
    
    try:
        db.delete(mission)
        db.commit()
        return {"message": f"Mission {mission_id} successfully deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete mission: {str(e)}"
        )

@router.put("/{mission_type}/{mission_id}", response_model=Mission)
async def update_mission(
    mission_type: str,
    mission_id: str,
    mission_update: MissionUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(JWTBearer())
):
    """Update a specific mission request"""
    mission = db.query(Mission).filter(
        Mission.id == mission_id,
        Mission.mission_type == mission_type
    ).first()
    
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mission with ID {mission_id} not found"
        )
    
    # Check if the user has permission to update this mission
    if mission.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this mission"
        )
    
    try:
        # Update only the fields that are provided
        update_data = mission_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(mission, field, value)
        
        mission.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(mission)
        return mission
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update mission: {str(e)}"
        ) 