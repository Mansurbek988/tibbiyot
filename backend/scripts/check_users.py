import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.db import models

load_dotenv(".env.local")

def check_users():
    db_url = os.getenv("POSTGRES_URL")
    if not db_url:
        print("POSTGRES_URL not found")
        return
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        users = db.query(models.User).all()
        print(f"Total users: {len(users)}")
        for u in users:
            print(f"ID: {u.id}, Name: {u.full_name}, Phone: {u.phone_number}, Role: {u.role}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
