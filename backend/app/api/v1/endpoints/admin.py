from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.api import deps
from backend.app.db import models
from backend.app.core import security
from backend.app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from backend.app.schemas.appointment import (
    DoctorCreate, 
    Doctor as DoctorSchema, 
    DoctorCreateRequest,
    DoctorUpdateRequest
)
from sqlalchemy import func

router = APIRouter()

@router.get("/reset-admin-creds")
def reset_admin_creds(db: Session = Depends(deps.get_db)):
    """
    TEMPORARY: Reset admin credentials without authentication.
    """
    new_phone = "998889884848"
    new_pass = "Grant2tatu"
    hashed_pass = security.get_password_hash(new_pass)
    
    admin = db.query(models.User).filter(models.User.role == models.RoleEnum.ADMIN).first()
    if not admin:
        return {"error": "Admin not found"}
        
    admin.phone_number = new_phone
    admin.password_hash = hashed_pass
    db.commit()
    return {"message": "Admin credentials updated successfully", "phone": new_phone}

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

@router.put("/doctors/{doctor_id}", response_model=DoctorSchema)
def update_doctor(
    *,
    db: Session = Depends(deps.get_db),
    doctor_id: int,
    doctor_in: DoctorUpdateRequest,
    current_user: models.User = Depends(deps.get_admin),
) -> Any:
    """
    Admin only: Update a doctor's user details and doctor profile.
    """
    db_doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    db_user = db_doctor.user
    
    # Update User details
    if doctor_in.user_up:
        if doctor_in.user_up.full_name:
            db_user.full_name = doctor_in.user_up.full_name
        if doctor_in.user_up.phone_number:
            # Check if phone number is taken by another user
            existing_user = db.query(models.User).filter(
                models.User.phone_number == doctor_in.user_up.phone_number,
                models.User.id != db_user.id
            ).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Phone number already in use")
            db_user.phone_number = doctor_in.user_up.phone_number
        if doctor_in.user_up.password:
            db_user.password_hash = security.get_password_hash(doctor_in.user_up.password)
            
    # Update Doctor details
    if doctor_in.doctor_up:
        if doctor_in.doctor_up.specialization:
            db_doctor.specialization = doctor_in.doctor_up.specialization
        if doctor_in.doctor_up.avg_consultation_time is not None:
            db_doctor.avg_consultation_time = doctor_in.doctor_up.avg_consultation_time
            
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.delete("/doctors/{doctor_id}")
def delete_doctor(
    *,
    db: Session = Depends(deps.get_db),
    doctor_id: int,
    current_user: models.User = Depends(deps.get_admin),
) -> Any:
    """
    Admin only: Delete a doctor and their associated user account.
    """
    db_doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    db_user = db_doctor.user
    
    # We should delete the doctor profile first (or it might be cascasded)
    db.delete(db_doctor)
    # Then delete the user
    db.delete(db_user)
    
    db.commit()
    return {"message": "Doctor and associated user deleted successfully"}

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
