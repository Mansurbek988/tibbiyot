import os
import sys
from sqlalchemy import create_engine, text

# Add root path to sys.path
# Script is in backend/scripts/inspect_users.py, so root is 2 levels up
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

# Manual .env parsing
for env_file in [".env", ".env.local"]:
    if os.path.exists(os.path.join(root_path, env_file)):
        with open(os.path.join(root_path, env_file)) as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    parts = line.strip().split("=", 1)
                    if len(parts) == 2:
                        key, value = parts
                        os.environ[key] = value.strip('"').strip("'")

from backend.app.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

def inspect():
    with engine.connect() as conn:
        print("--- Users in DB ---")
        res = conn.execute(text("SELECT id, phone_number, role FROM users")).fetchall()
        for row in res:
            print(f"ID: {row[0]}, Phone: {row[1]}, Role: {row[2]} (type: {type(row[2])})")
        print("-------------------")

if __name__ == "__main__":
    inspect()
