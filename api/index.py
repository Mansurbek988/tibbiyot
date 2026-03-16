from fastapi import FastAPI
import os
import sys
import traceback

# Add root path to sys.path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

# Import the actual app from main.py
try:
    from backend.app.main import app as backend_app
    # Use the actual app directly
    app = backend_app
except Exception as e:
    stack_trace = traceback.format_exc()
    print(f"FAILED TO IMPORT BACKEND: {e}")
    print(stack_trace)
    
    # Fallback app for diagnostics if import fails
    app = FastAPI()
    
    @app.get("/api/v1/health")
    @app.get("/health")
    def health_check():
        return {
            "status": "import_failed",
            "error": str(e),
            "traceback": stack_trace[:500]
        }
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    def catch_all(path: str):
        return {
            "error": "Backend not loaded",
            "path": path,
            "detail": str(e)
        }
