from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.api import deps
from backend.app.db import models
from backend.app.schemas.appointment import Doctor as DoctorSchema

router = APIRouter()

@router.get("/")
def read_doctors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve doctors.
    """
    query = db.query(models.Doctor).options(joinedload(models.Doctor.user))
    doctors_objs = query.offset(skip).limit(limit).all()
    
    # Manual serialization to avoid SQLAlchemy issues with JSON conversion
    result = []
    for doc in doctors_objs:
        result.append({
            "id": doc.id,
            "specialization": doc.specialization,
            "avg_consultation_time": doc.avg_consultation_time,
            "user": {
                "id": doc.user.id,
                "full_name": doc.user.full_name,
                "phone_number": doc.user.phone_number,
                "role": doc.user.role if isinstance(doc.user.role, str) else doc.user.role.value
            } if doc.user else None
        })
    
    print(f"DEBUG: Returning {len(result)} doctors")
    return result

@router.get("/{id}", response_model=DoctorSchema)
def read_doctor(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get doctor by ID.
    """
    doctor = db.query(models.Doctor).options(joinedload(models.Doctor.user)).filter(models.Doctor.id == id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor
