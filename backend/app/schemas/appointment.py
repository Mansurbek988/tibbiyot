from typing import Optional, List
from pydantic import BaseModel
from backend.app.db.models import AppointmentStatus
from datetime import datetime
from backend.app.schemas.user import User

# --- Doctor Schemas ---
class DoctorBase(BaseModel):
    specialization: str
    avg_consultation_time: Optional[int] = 15

class DoctorCreate(DoctorBase):
    user_id: int

class Doctor(DoctorBase):
    id: int
    user: User

    class Config:
        from_attributes = True

# --- Appointment Schemas ---
class AppointmentBase(BaseModel):
    doctor_id: int
    scheduled_time: Optional[datetime] = None

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int
    patient_id: int
    predicted_wait_time: Optional[int] = None
    status: str
    queue_number: Optional[int] = None

    class Config:
        from_attributes = True

class QueueStatus(BaseModel):
    doctor_id: int
    current_queue_length: int
    next_available_number: int
    estimated_wait_time: int
