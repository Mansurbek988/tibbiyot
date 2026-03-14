from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os
import sys

app = FastAPI()

@app.get("/api/v1/health")
@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "message": "Vercel Python environment is working",
        "python_version": sys.version,
        "env": {k: v for k, v in os.environ.items() if "URL" in k or "DATABASE" in k or "POSTGRES" in k}
    }

@app.get("/api/v1/debug-paths")
async def debug_paths():
    return {
        "cwd": os.getcwd(),
        "sys_path": sys.path,
        "root_files": os.listdir("..") if os.path.exists("..") else []
    }

# DO NOT import anything from backend here yet. 
# We want to see if THIS app works first.
