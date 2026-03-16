import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db import models
from backend.app.core import security
from backend.app.db.models import RoleEnum
from dotenv import load_dotenv

load_dotenv(".env.local")

def create_admin():
    db_url = os.getenv("POSTGRES_URL")
    if not db_url:
        print("POSTGRES_URL not found in .env.local")
        return
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_phone = "998901234567"
        admin = db.query(models.User).filter(models.User.phone_number == admin_phone).first()
        if admin:
            print(f"Admin with phone {admin_phone} already exists.")
            return

        full_name = "System Admin"
        password = "adminpassword123"
        hashed_password = security.get_password_hash(password)

        db_admin = models.User(
            full_name=full_name,
            phone_number=admin_phone,
            password_hash=hashed_password,
            role=RoleEnum.ADMIN
        )
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        print("Admin user created successfully!")
        print(f"Login: {admin_phone}")
        print(f"Password: {password}")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
