from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import os
import sys
import traceback

app = FastAPI()

@app.get("/api/v1/health")
@app.get("/health")
async def health():
    bad_files = []
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    backend_root = os.path.join(root, "backend")
    if os.path.exists(backend_root):
        for root_dir, dirs, files in os.walk(backend_root):
            for file in files:
                if file.endswith(".py"):
                    path = os.path.join(root_dir, file)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            content = f.read()
                            if "from app." in content or "from app " in content or "import app." in content:
                                bad_files.append(path.replace(root, ""))
                    except Exception as e:
                        pass
    return {
        "status": "diagnostic",
        "bad_files": bad_files,
        "checked_path": backend_root,
        "exists": os.path.exists(backend_root)
    }

# Add the root directory to the path so we can import 'backend'
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

try:
    from backend.app.main import app as real_app
    app = real_app
except Exception as e:
    error_msg = str(e)
    stack_trace = traceback.format_exc()
    
    @app.api_route("/{rest_of_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def caught_error(request: Request, rest_of_path: str):
        # Even in error, show the diagnostic info if it's health
        if "health" in rest_of_path:
             bad_files = []
             root = "/var/task" # Vercel default
             for root_dir, dirs, files in os.walk(os.path.join(root, "backend")):
                 for file in files:
                     if file.endswith(".py"):
                         path = os.path.join(root_dir, file)
                         try:
                             with open(path, "r") as f:
                                 if "from app." in f.read():
                                     bad_files.append(path)
                         except: pass
             return {"error": error_msg, "bad_files": bad_files, "traceback": stack_trace}
             
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
