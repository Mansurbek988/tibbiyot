from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Minimal API is working"}

@app.get("/debug")
async def debug():
    import os
    import sys
    return {
        "cwd": os.getcwd(),
        "sys_path": sys.path,
        "files_in_root": os.listdir("..") if os.path.exists("..") else "root not found",
        "files_in_current": os.listdir(".")
    }

# Try to import for the real app to see if it even can
try:
    from backend.app.main import app as real_app
    app.mount("/real", real_app)
except Exception as e:
    import traceback
    error_info = {"error": str(e), "traceback": traceback.format_exc()}
    @app.get("/error")
    async def get_error():
        return error_info
