from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.db import models
from app.schemas.appointment import Appointment as AppointmentSchema, AppointmentCreate, QueueStatus
from app.api.v1.websocket import manager
from app.db.models import AppointmentStatus
from app.services.ai_service import ai_service
from datetime import datetime

router = APIRouter()

@router.post("/book", response_model=AppointmentSchema)
async def book_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_in: AppointmentCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Book a new appointment.
    """
    # 1. Check if doctor exists
    doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment_in.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # 2. Calculate next queue number for this doctor for today
    # (Simplified: just getting max for the doctor)
    max_queue = db.query(func.max(models.Appointment.queue_number)).filter(
        models.Appointment.doctor_id == appointment_in.doctor_id,
        models.Appointment.status == AppointmentStatus.IN_QUEUE
    ).scalar() or 0
    
    new_queue_number = max_queue + 1

    # 3. Predict wait time using AI Service
    current_hour = datetime.now().hour
    wait_time = ai_service.calculate_wait_time(
        queue_length=new_queue_number,
        avg_consultation_time=(doctor.avg_consultation_time or 15),
        current_hour=current_hour
    )

    # 4. Create appointment
    db_obj = models.Appointment(
        patient_id=current_user.id,
        doctor_id=appointment_in.doctor_id,
        scheduled_time=appointment_in.scheduled_time,
        predicted_wait_time=wait_time,
        queue_number=new_queue_number,
        status=AppointmentStatus.IN_QUEUE
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # 5. Broadcast update to all clients watching this doctor's queue
    # We send the updated queue length/status
    current_queue = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == appointment_in.doctor_id,
        models.Appointment.status == AppointmentStatus.IN_QUEUE
    ).count()

    await manager.broadcast_to_doctor(
        appointment_in.doctor_id, 
        {
            "event": "queue_updated",
            "doctor_id": appointment_in.doctor_id,
            "current_queue_length": current_queue,
            "latest_queue_number": new_queue_number
        }
    )

    return db_obj

@router.get("/my", response_model=List[AppointmentSchema])
def read_my_appointments(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve current user's appointments.
    """
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == current_user.id
    ).all()
    return appointments

# --- WebSocket Endpoint ---
@router.websocket("/ws/{doctor_id}")
async def queue_websocket(websocket: WebSocket, doctor_id: int):
    await manager.connect(doctor_id, websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(doctor_id, websocket)
