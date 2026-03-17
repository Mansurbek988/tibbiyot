from typing import Any
from fastapi import APIRouter, Depends
from backend.app.api import deps
from backend.app.services.ai_service import ai_service
from backend.app.db import models
from pydantic import BaseModel

router = APIRouter()

class TriageRequest(BaseModel):
    symptoms: str

class TriageResponse(BaseModel):
    specialization: str
    confidence: float
    analysis: str

@router.post("/triage", response_model=TriageResponse)
def get_triage(
    *,
    request: TriageRequest,
) -> Any:
    """
    Perform AI triage based on symptoms.
    """
    result = ai_service.predict_specialization(request.symptoms)
    return result

@router.get("/predict-wait")
def get_wait_prediction(
    doctor_id: int,
    queue_length: int,
    avg_consultation_time: int = 15
) -> Any:
    """
    Predict wait time for a doctor's queue.
    """
    from datetime import datetime
    current_hour = datetime.now().hour
    
    wait_time = ai_service.calculate_wait_time(
        queue_length, 
        avg_consultation_time, 
        current_hour
    )
    
    return {"predicted_wait_time": wait_time}
