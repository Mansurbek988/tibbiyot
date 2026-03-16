import os
from dotenv import load_dotenv
from sqlalchemy import create_all, create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db import models

load_dotenv()

db_url = os.getenv("POSTGRES_URL")
if not db_url:
    print("POSTGRES_URL not found!")
    exit(1)

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
db = Session()

try:
    user = db.query(models.User).filter(models.User.phone_number == "998901234567").first()
    if user:
        print(f"User: {user.full_name}")
        print(f"Phone: {user.phone_number}")
        print(f"Role: {user.role}")
        print(f"Role Type: {type(user.role)}")
        
        if hasattr(user.role, 'name'):
            print(f"Role Name: {user.role.name}")
        if hasattr(user.role, 'value'):
            print(f"Role Value: {user.role.value}")
            
    else:
        print("Admin user not found!")
finally:
    db.close()
