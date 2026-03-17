from typing import Optional, List
from pydantic import BaseModel
from backend.app.db.models import AppointmentStatus
from datetime import datetime
from backend.app.schemas.user import User, UserCreate, UserUpdate

# --- Doctor Schemas ---
class DoctorBase(BaseModel):
    specialization: str
    avg_consultation_time: Optional[int] = 15

class DoctorCreate(DoctorBase):
    user_id: int

class DoctorUpdate(BaseModel):
    specialization: Optional[str] = None
    avg_consultation_time: Optional[int] = None

class DoctorUpdateRequest(BaseModel):
    user_up: Optional[UserUpdate] = None
    doctor_up: Optional[DoctorUpdate] = None

class DoctorCreateRequest(BaseModel):
    user_in: UserCreate
    specialization: str
    avg_consultation_time: int = 15

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
    symptoms: Optional[str] = None

class Appointment(AppointmentBase):
    id: int
    patient_id: int
    predicted_wait_time: Optional[int] = None
    status: str
    queue_number: Optional[int] = None
    symptoms: Optional[str] = None
    ai_triage_result: Optional[dict] = None

    class Config:
        from_attributes = True

class QueueStatus(BaseModel):
    doctor_id: int
    current_queue_length: int
    next_available_number: int
    estimated_wait_time: int
