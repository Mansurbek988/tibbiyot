from fastapi import FastAPI
import os
import sys

# Add the root directory to sys.path so we can import 'backend'
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

# Lazy import the app to avoid issues during module loading
def get_app():
    try:
        from backend.app.main import app as backend_app
        return backend_app
    except Exception as e:
        import traceback
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        
        fallback_app = FastAPI()
        @fallback_app.get("/api/v1/health")
        @fallback_app.get("/health")
        def health_check():
            return {
                "status": "bridge_error",
                "detail": error_msg,
                "traceback": stack_trace[:500],
                "sys_path": sys.path,
                "cwd": os.getcwd()
            }
        return fallback_app

app = get_app()
