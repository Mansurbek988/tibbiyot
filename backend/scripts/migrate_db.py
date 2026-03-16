import os
from sqlalchemy import create_engine, text
# Manual .env parsing to avoid dependency issues
for env_file in [".env", ".env.local"]:
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    parts = line.strip().split("=", 1)
                    if len(parts) == 2:
                        key, value = parts
                        os.environ[key] = value.strip('"').strip("'")

db_url = os.getenv("POSTGRES_URL")
if not db_url:
    # Try alternate names
    db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_DATABASE_URL")
    
if not db_url:
    print("Neither POSTGRES_URL nor DATABASE_URL found in environment, .env, or .env.local!")
    exit(1)

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url)

def migrate():
    with engine.connect() as conn:
        print("Checking appointments table...")
        
        # Add symptoms column if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE appointments ADD COLUMN symptoms VARCHAR;"))
            print("Added symptoms column.")
        except Exception as e:
            if "already exists" in str(e):
                print("symptoms column already exists.")
            else:
                print(f"Error adding symptoms: {e}")
        
        # Add ai_triage_result column if it doesn't exist
        try:
            conn.execute(text("ALTER TABLE appointments ADD COLUMN ai_triage_result JSONB;"))
            print("Added ai_triage_result column.")
        except Exception as e:
            if "already exists" in str(e):
                print("ai_triage_result column already exists.")
            else:
                print(f"Error adding ai_triage_result: {e}")
        
        # Ensure ai_logs table exists (Base.metadata.create_all usually handles this, but let's be safe)
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS ai_logs (
                    id SERIAL PRIMARY KEY,
                    patient_id INTEGER REFERENCES users(id),
                    input_symptoms TEXT,
                    predicted_specialization VARCHAR,
                    confidence_score INTEGER,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
                );
            """))
            print("Ensured ai_logs table exists.")
        except Exception as e:
            print(f"Error ensuring ai_logs: {e}")
            
        conn.commit()
        print("Migration completed.")

if __name__ == "__main__":
    migrate()
