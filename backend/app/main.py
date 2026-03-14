from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine
from app.db import models
from typing import Optional
from app.api.v1.api import api_router

# In a real production app, you would use Alembic for migrations instead of this
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SmartMed Queue System API with AI Triage and Real-time Queue",
    version="1.0.0"
)

# CORS setup for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to the specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to SmartMed Queue API",
        "status": "Healthy"
    }

app.include_router(api_router, prefix=settings.API_V1_STR)
