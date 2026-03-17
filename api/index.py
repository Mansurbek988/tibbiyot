import os
import sys
import traceback
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add root path to sys.path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

proxy_app = FastAPI(title="SmartMed Proxy")

proxy_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@proxy_app.get("/api/proxy-health")
def proxy_health():
    return {
        "status": "online",
        "deployment": "v1.0.5",
        "env": {
            "GROQ_API_KEY_SET": os.getenv("GROQ_API_KEY") is not None,
            "DATABASE_URL_SET": (os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")) is not None
        }
    }

try:
    from backend.app.main import app as backend_app
    proxy_app.mount("/", backend_app)
    app = proxy_app
except Exception as e:
    stack = traceback.format_exc()
    
    @proxy_app.get("/api/v1/debug-error")
    def debug_error():
        return {"error": str(e), "traceback": stack}
    
    app = proxy_app
