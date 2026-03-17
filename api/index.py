import os
import sys
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Diagnostic: Track what's happening
print(f"Starting api/index.py. CWD: {os.getcwd()}")

# Add root path to sys.path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)
    print(f"Added {root_path} to sys.path")

app = FastAPI(title="SmartMed Proxy")

# Allow CORS for everything initially to avoid blockers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "proxy_online",
        "deployment": "v1.0.4",
        "sys_path": sys.path[:5],
        "root_files": os.listdir(root_path) if os.path.exists(root_path) else "not_found"
    }

# Attempt to load the real backend
try:
    from backend.app.main import app as backend_app
    print("Backend imported successfully")
    
    # Move all routes from backend_app to the main app or mount it
    app.mount("/", backend_app)
    
except Exception as e:
    stack = traceback.format_exc()
    print(f"CRITICAL: Failed to load backend: {e}")
    print(stack)

    @app.get("/api/v1/debug-error")
    def debug_error():
        return {
            "error": str(e),
            "traceback": stack,
            "os_environ": {k: "SET" for k in os.environ.keys() if "KEY" in k or "URL" in k}
        }
