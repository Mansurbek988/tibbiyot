from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.database import engine
from backend.app.db import models
from typing import Optional
from backend.app.api.v1.api import api_router
from backend.app.api import deps
from sqlalchemy.orm import Session

# In a real production app, you would use Alembic for migrations instead of this
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database sync error: {e}")

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

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "message": "SmartMed API is running"}

@app.get("/api/v1/db-debug")
def db_debug():
    import os
    env_vars = {
        "DATABASE_URL_SET": bool(os.getenv("DATABASE_URL")),
        "POSTGRES_URL_SET": bool(os.getenv("POSTGRES_URL")),
        "POSTGRES_SERVER": settings.POSTGRES_SERVER,
        "ENV_KEYS": list(os.environ.keys())
    }
    
    raw_url = settings.SQLALCHEMY_DATABASE_URI
    # Mask password for safety
    masked_url = raw_url
    if "@" in raw_url:
        prefix = raw_url.split("@")[0]
        if ":" in prefix:
            parts = prefix.split(":")
            masked_url = f"{parts[0]}:{parts[1]}:****@{raw_url.split('@')[1]}"
            
    return {
        "env_diagnostics": env_vars,
        "final_uri_masked": masked_url,
        "is_localhost": "localhost" in raw_url or "127.0.0.1" in raw_url
    }

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    error_msg = f"GLOBAL ERROR: {str(exc)}"
    print(error_msg)
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Server error: {str(exc)}",
            "type": type(exc).__name__,
            "path": request.url.path,
            "traceback": traceback.format_exc()
        },
    )
