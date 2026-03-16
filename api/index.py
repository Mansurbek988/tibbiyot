from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
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
        from backend.app.core.config import settings
        raw_url = settings.SQLALCHEMY_DATABASE_URI
        status_info["database_configured_uri"] = raw_url.split("@")[-1] if "@" in raw_url else "no-user-info"
        status_info["is_localhost"] = "localhost" in raw_url or "127.0.0.1" in raw_url
    except Exception as e:
        status_info["settings_error"] = str(e)
        
    return status_info

try:
    from backend.app.api.v1.api import api_router
    from backend.app.core.config import settings
    # Include the real router
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    @app.get("/")
    def read_root():
        return {"message": "Welcome to SmartMed Queue API (Serverless)", "status": "Healthy"}
except Exception as e:
    error_msg = str(e)
    stack_trace = traceback.format_exc()
    
    @app.api_route("/{rest_of_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def caught_error(request: Request, rest_of_path: str):
        if "health" in rest_of_path:
            return await health_check()
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to load backend router",
                "detail": error_msg,
                "traceback": stack_trace
            }
        )
