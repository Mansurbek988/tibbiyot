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
    
    # Ensure /health works directly on the backend app
    @app.get("/health", tags=["health"])
    @app.get("/api/health", tags=["health"])
    async def health_check_proxy():
        return {"status": "ok", "message": "Backend is active and loaded"}

except Exception as e:
    # Fallback app for error reporting
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
                "method": request.method,
                "sys_path": sys.path
            }
        )
