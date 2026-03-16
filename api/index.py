from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os
import sys

# Add root path to sys.path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

app = FastAPI()

@app.get("/api/v1/health")
@app.get("/health")
async def health_check(request: Request):
    return {
        "status": "bridge_ready",
        "path": request.url.path,
        "method": request.method,
        "root_path_exists": os.path.exists(root_path),
        "backend_exists": os.path.exists(os.path.join(root_path, "backend")),
        "sys_path": sys.path[:5]
    }

# Comprehensive catch-all for debugging 404s
@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
async def catch_all(request: Request, path_name: str):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Route not found in bridge",
            "detected_path": request.url.path,
            "path_param": path_name,
            "method": request.method,
            "tip": "Check if this matches your backend routes"
        }
    )

try:
    from backend.app.main import app as backend_app
    # If we successfully import, we can mount it or replace the bridge
    # For diagnostics, let's mount it under /real-api
    app.mount("/real-api", backend_app)
    print("Backend app mounted under /real-api")
except Exception as e:
    print(f"Failed to import backend: {e}")
