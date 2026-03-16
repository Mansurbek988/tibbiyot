from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
import os
import sys
import traceback

# Add the root directory to the path so we can import 'backend'
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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
    import os
    # We try to import settings but if it fails we still want to see the env vars
    status_info = {
        "status": "ok",
        "env_diagnostics": {
            "DATABASE_URL_SET": "DATABASE_URL" in os.environ,
            "POSTGRES_URL_SET": "POSTGRES_URL" in os.environ,
            "AVAILABLE_DATABASE_KEYS": [k for k in os.environ.keys() if "DATABASE" in k or "POSTGRES" in k],
            "PYTHON_PATH": sys.path,
            "DEPLOYMENT_VERSION": "v1.0.1-password-fix-applied"
        }
    }
    
    try:
        from backend.app.db.database import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        status_info["db_connection"] = "Connected"
    except Exception as e:
        status_info["db_error"] = str(e)
        
    return status_info

try:
    from backend.app.api.v1.api import api_router
    from backend.app.core.config import settings
    # Include the real router
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    @app.get("/api/v1/debug")
    def debug_info():
        try:
            from backend.app.db.database import SessionLocal
            db = SessionLocal()
            db.execute("SELECT 1")
            db.close()
            db_status = "Connected"
        except Exception as e:
            db_status = f"Error: {str(e)}"
            
        return {
            "status": "Healthy",
            "db_status": db_status,
            "api_v1_str": settings.API_V1_STR,
            "project_name": settings.PROJECT_NAME
        }

    from fastapi.exceptions import RequestValidationError, ResponseValidationError

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        print(f"VALIDATION ERROR (Request): {exc.errors()}")
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors(), "error": "Request Validation Error"}
        )

    @app.exception_handler(ResponseValidationError)
    async def response_validation_exception_handler(request: Request, exc: ResponseValidationError):
        print(f"VALIDATION ERROR (Response): {exc.errors()}")
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Backend Serialization Error: {str(exc.errors())}",
                "error": "Response Validation Error"
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        import traceback
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

    @app.get("/")
    def read_root():
        return {"message": "Welcome to SmartMed Queue API (Serverless)", "status": "Healthy"}
except Exception as e:
    error_msg = str(e)
    stack_trace = traceback.format_exc()
    print(f"CRITICAL BACKEND ERROR: {error_msg}")
    
    @app.api_route("/{rest_of_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def caught_error(request: Request, rest_of_path: str):
        if "health" in rest_of_path:
            return await health_check()
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to load backend router",
                "detail": f"Router Load Error: {error_msg} | Trace: {stack_trace[:500]}..."
            }
        )
