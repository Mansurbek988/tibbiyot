from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.database import engine, SessionLocal
from backend.app.db import models
from backend.app.api.v1.api import api_router
from sqlalchemy import text
import os
import sys
import traceback

# Database initialization
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database sync error: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SmartMed Queue System API",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
@app.get("/api/health")
@app.get("/api/v1/health")
async def health_check():
    status_info = {
        "status": "ok",
        "env_diagnostics": {
            "DATABASE_URL_SET": "DATABASE_URL" in os.environ,
            "POSTGRES_URL_SET": "POSTGRES_URL" in os.environ,
            "AVAILABLE_DATABASE_KEYS": [k for k in os.environ.keys() if "DATABASE" in k or "POSTGRES" in k],
            "DEPLOYMENT_VERSION": "v1.0.2-unified"
        }
    }
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        status_info["db_connection"] = "Connected"
    except Exception as e:
        status_info["db_error"] = str(e)
    return status_info

@app.get("/api/v1/debug")
def debug_info():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "Connected"
    except Exception as e:
        db_status = f"Error: {str(e)}"
    
    raw_url = settings.SQLALCHEMY_DATABASE_URI
    masked_url = raw_url.split("@")[-1] if "@" in raw_url else "no-user-info"
    
    return {
        "status": "Healthy",
        "db_status": db_status,
        "api_v1_str": settings.API_V1_STR,
        "project_name": settings.PROJECT_NAME,
        "db_uri_masked": masked_url
    }

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to SmartMed Queue API", "status": "Healthy"}

# Advanced Error Handlers
from fastapi.exceptions import RequestValidationError, ResponseValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "error": "Request Validation Error"}
    )

@app.exception_handler(ResponseValidationError)
async def response_validation_exception_handler(request: Request, exc: ResponseValidationError):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Backend Serialization Error: {str(exc.errors())}",
            "error": "Response Validation Error"
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = f"{type(exc).__name__}: {str(exc)}"
    full_trace = traceback.format_exc()
    print(f"GLOBAL ERROR: {error_msg}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"{error_msg} | Trace: {full_trace[:500]}...",
            "error": "Internal Server Error",
            "type": type(exc).__name__
        }
    )
