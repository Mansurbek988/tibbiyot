from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.api import deps
from backend.app.db import models
from backend.app.core import security
from backend.app.schemas.user import User as UserSchema, UserCreate
from backend.app.schemas.appointment import DoctorCreate, Doctor as DoctorSchema, DoctorCreateRequest
from sqlalchemy import func

router = APIRouter()

@router.post("/create-doctor", response_model=DoctorSchema)
def create_doctor(
    *,
    db: Session = Depends(deps.get_db),
    doctor_in: DoctorCreateRequest,
    current_user: models.User = Depends(deps.get_admin),
) -> Any:
    """
    Admin only: Create a new doctor user and their doctor profile.
    """
    user_in = doctor_in.user_in
    user = db.query(models.User).filter(models.User.phone_number == user_in.phone_number).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this phone number already exists.",
        )
    
    # 1. Create User
    password_hash = security.get_password_hash(user_in.password)
    db_user = models.User(
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        password_hash=password_hash,
        role=models.RoleEnum.DOCTOR,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 2. Create Doctor Profile
    db_doctor = models.Doctor(
        user_id=db_user.id,
        specialization=doctor_in.specialization,
        avg_consultation_time=doctor_in.avg_consultation_time,
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)

    return db_doctor

@router.get("/stats")
def get_system_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_admin),
) -> Any:
    """
    Admin only: Get global system statistics.
    """
    total_appointments = db.query(models.Appointment).count()
    active_doctors = db.query(models.Doctor).count()
    total_patients = db.query(models.User).filter(models.User.role == models.RoleEnum.PATIENT).count()
    
    # Queue load
    in_queue_count = db.query(models.Appointment).filter(
        models.Appointment.status == models.AppointmentStatus.IN_QUEUE
    ).count()

    # AI Stats (Mock for now, can be expanded with ai_logs)
    ai_predictions = db.query(models.AILogs).count()
    
    return {
        "total_appointments": total_appointments,
        "active_doctors": active_doctors,
        "total_patients": total_patients,
        "in_queue_load": in_queue_count,
        "ai_predictions_count": ai_predictions,
    }
