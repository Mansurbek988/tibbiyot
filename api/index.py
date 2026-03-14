import sys
import os

# Add the root directory to the path so we can import 'backend'
path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if path not in sys.path:
    sys.path.insert(0, path)

try:
    from backend.app.main import app
except Exception as e:
    import traceback
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    
    @app.get("/{rest_of_path:path}")
    async def caught_error(rest_of_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Failed to import backend",
                "detail": str(e),
                "traceback": traceback.format_exc(),
                "sys_path": sys.path,
                "current_dir": os.getcwd(),
                "files": os.listdir(os.getcwd()) if os.path.exists(os.getcwd()) else []
            }
        )
