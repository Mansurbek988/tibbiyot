from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os
import sys
import traceback

# Add the root directory to the path so we can import 'backend'
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

# Try to import the main app instance
try:
    from backend.app.main import app as backend_app
    app = backend_app
    print("Successfully imported backend_app from main.py")
except Exception as e:
    error_msg = str(e)
    stack_trace = traceback.format_exc()
    print(f"CRITICAL BACKEND ERROR during bridge load: {error_msg}")
    
    # Fallback to a minimal app if import fails
    app = FastAPI()
    
    @app.get("/health")
    @app.get("/api/v1/health")
    async def health_check():
        return {
            "status": "error",
            "detail": f"Backend import failed: {error_msg}",
            "traceback": stack_trace[:500]
        }

    @app.api_route("/{rest_of_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def caught_error(request: Request, rest_of_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to load backend router",
                "detail": f"Import Error: {error_msg} | Trace: {stack_trace[:500]}..."
            }
        )
