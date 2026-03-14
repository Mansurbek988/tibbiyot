from fastapi import APIRouter
from app.api.v1.endpoints import auth, doctors, appointments, ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
