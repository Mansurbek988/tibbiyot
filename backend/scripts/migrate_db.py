import os
from sqlalchemy import create_engine, text

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

def safe_execute(conn, query, title):
    try:
        conn.execute(text(query))
        conn.commit()
        print(f"SUCCESS: {title}")
    except Exception as e:
        conn.rollback()
        if "already exists" in str(e).lower():
            print(f"SKIP: {title} (Already exists)")
        else:
            print(f"ERROR: {title} - {e}")

def migrate():
    with engine.connect() as conn:
        print("Starting robust migration...")
        
        # 1. Appointments columns
        safe_execute(conn, "ALTER TABLE appointments ADD COLUMN symptoms VARCHAR;", "Add symptoms")
        safe_execute(conn, "ALTER TABLE appointments ADD COLUMN ai_triage_result JSONB;", "Add ai_triage_result")
        
        # 2. Normalize roles
        safe_execute(conn, "UPDATE users SET role = 'PATIENT' WHERE role::text = 'patient';", "Normalize PATIENT role")
        safe_execute(conn, "UPDATE users SET role = 'DOCTOR' WHERE role::text = 'doctor';", "Normalize DOCTOR role")
        safe_execute(conn, "UPDATE users SET role = 'ADMIN' WHERE role::text = 'admin';", "Normalize ADMIN role")
        
        # 3. AI Logs table
        safe_execute(conn, """
            CREATE TABLE IF NOT EXISTS ai_logs (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES users(id),
                input_symptoms TEXT,
                predicted_specialization VARCHAR,
                confidence_score INTEGER,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
            );
        """, "Create ai_logs table")
        
    print("Migration finished.")

if __name__ == "__main__":
    migrate()
