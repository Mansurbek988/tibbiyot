from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os
import sys
import traceback

# Add the root directory to the path so we can import 'backend'
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

try:
    from backend.app.main import app as backend_app
    app = backend_app
    
    # Add diagnostic health check directly to the backend app
    @app.get("/health")
    @app.get("/api/health")
    async def health_diagnostics():
        import os
        from backend.app.core.config import settings
        
        raw_url = settings.SQLALCHEMY_DATABASE_URI
        masked_url = raw_url
        if "@" in raw_url:
            parts = raw_url.split("@")
            prefix = parts[0]
            if ":" in prefix:
                subparts = prefix.split(":")
                # Mask password
                masked_url = f"{subparts[0]}:{subparts[1]}:****@{parts[1]}"
        
        return {
            "status": "ok",
            "database_detected": bool(os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")),
            "is_localhost": "localhost" in raw_url or "127.0.0.1" in raw_url,
            "connection_uri_masked": masked_url,
            "env_vars_present": [k for k in os.environ.keys() if "DATABASE" in k or "POSTGRES" in k],
            "message": "Backend is active"
        }

except Exception as e:
    app = FastAPI()
    error_msg = str(e)
    stack_trace = traceback.format_exc()
    
    @app.api_route("/{rest_of_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def caught_error(request: Request, rest_of_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to load backend app",
                "detail": error_msg,
                "traceback": stack_trace,
                "requested_path": rest_of_path,
                "method": request.method
            }
        )
