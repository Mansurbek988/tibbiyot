from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, doctors, appointments, ai, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

# Set strict_slashes=False for the main router if needed
# but better to do it per-router or globally in main.py
