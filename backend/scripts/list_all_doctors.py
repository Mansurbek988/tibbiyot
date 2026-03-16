import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Manual .env parsing
for env_file in [".env", ".env.local"]:
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    parts = line.strip().split("=", 1)
                    if len(parts) == 2:
                        key, value = parts
                        os.environ[key] = value.strip('"').strip("'")

db_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL") or os.getenv("POSTGRES_DATABASE_URL")

if not db_url:
    print("DB URL not found!")
    exit(1)

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
db = Session()

try:
    print("--- All Users ---")
    users = db.execute(text("SELECT id, full_name, phone_number, role FROM users")).fetchall()
    for u in users:
        print(f"UserID: {u.id} | Name: {u.full_name} | Phone: {u.phone_number} | Role: {u.role}")

    print("\n--- All Doctor Profiles ---")
    doctors = db.execute(text("SELECT id, user_id, specialization FROM doctors")).fetchall()
    for d in doctors:
        print(f"DoctorID: {d.id} | UserID: {d.user_id} | Spec: {d.specialization}")

    if not users and not doctors:
        print("No users or doctors found.")
finally:
    db.close()
