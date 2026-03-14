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
    
    # Add a root-level health check to the backend app dynamically 
    # so the Vercel rewrite for /health works
    @app.get("/health")
    async def health_proxy():
        return {"status": "ok", "message": "Backend is active (via /health)"}

except Exception as e:
    # If import fails, use a fallback app to report errors
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
