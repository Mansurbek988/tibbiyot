import os
import sys
import traceback
from fastapi import FastAPI

# Add root path to sys.path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

# Create a diagnostic app first
app = FastAPI(title="SmartMed Entry")

@app.get("/api/v1/health")
@app.get("/api/health")
@app.get("/health")
def health():
    return {"status": "ok", "deployment": "v1.0.7"}

try:
    # Attempt to import the real app
    from backend.app.main import app as backend_app
    # If successful, overwrite the local 'app' reference
    app = backend_app
    print("Backend loaded successfully")
except Exception as e:
    err_msg = str(e)
    err_trace = traceback.format_exc()
    print(f"BACKEND LOAD ERROR: {err_msg}")
    
    @app.get("/api/v1/debug-error")
    def debug_error():
        return {
            "error": err_msg, 
            "traceback": err_trace,
            "sys_path": sys.path[:5]
        }
