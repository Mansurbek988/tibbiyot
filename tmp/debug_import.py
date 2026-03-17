import os
import sys

# Add root path to sys.path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

try:
    print("Testing imports...")
    from backend.app.main import app
    print("Backend app loaded successfully!")
except Exception as e:
    import traceback
    print(f"IMPORT ERROR: {e}")
    traceback.print_exc()
