import sys
import os

# Add project root to path (the parent of 'backend' directory)
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

try:
    print(f"Project root: {root_path}")
    print("Checking backend imports...")
    
    from backend.app.api.v1.api import api_router
    print("[SUCCESS] api_router imported")
    
    from backend.app.schemas.appointment import Doctor as DoctorSchema
    print("[SUCCESS] DoctorSchema imported")
    
    from backend.app.db.models import RoleEnum
    print(f"[SUCCESS] RoleEnum: {[r.value for r in RoleEnum]}")
    
    print("All critical backend imports are fine locally.")
except Exception as e:
    import traceback
    print(f"[FAILURE] Import failed: {e}")
    traceback.print_exc()
    sys.exit(1)
