from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.api import deps
from backend.app.db import models
from backend.app.schemas.appointment import Doctor as DoctorSchema

router = APIRouter()

@router.get("/", response_model=List[DoctorSchema])
def read_doctors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve doctors.
    """
    query = db.query(models.Doctor).options(joinedload(models.Doctor.user))
    doctors = query.offset(skip).limit(limit).all()
    print(f"DEBUG: Found {len(doctors)} doctors in DB")
    return doctors

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
