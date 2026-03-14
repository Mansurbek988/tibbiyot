import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship

# Biz hozircha declarative_base ni app.db.database faylidan import qilib olamiz deb faraz qilamiz
# Lekin chigallik bo'lmasligi uchun pastda o'zimiz yaratishimiz ham mumkin.
from backend.app.db.database import Base

class RoleEnum(enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class AppointmentStatus(enum.Enum):
    PENDING = "pending"
    IN_QUEUE = "in_queue"
    COMPLETED = "completed"
    CANCELED = "canceled"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.PATIENT)
    created_at = Column(DateTime, default=datetime.utcnow)

    medical_history = relationship("MedicalHistory", back_populates="patient")
    appointments_as_patient = relationship("Appointment", foreign_keys='Appointment.patient_id')

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    specialization = Column(String, index=True)
    avg_consultation_time = Column(Integer, default=15)
    
    user = relationship("User")
    appointments = relationship("Appointment", foreign_keys='Appointment.doctor_id')

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    scheduled_time = Column(DateTime)
    predicted_wait_time = Column(Integer) # AI yordamida hisoblangan kutish vaqti
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    queue_number = Column(Integer)

class MedicalHistory(Base):
    __tablename__ = "medical_history"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    encrypted_data = Column(String) # Shifrlangan tarzda saqlanadi (AES-256)
    extra_details = Column(JSON) # JSONB orqali erkin strukturali malumotlar
    
    patient = relationship("User", back_populates="medical_history")

class AILogs(Base):
    __tablename__ = "ai_logs"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    input_symptoms = Column(String)
    predicted_specialization = Column(String)
    confidence_score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
