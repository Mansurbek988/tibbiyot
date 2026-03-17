import os
import sys
from sqlalchemy import create_engine, text
from passlib.context import CryptContext

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import settings manually to avoid complex dependency chains in a simple script
# Or just get the DB URL from env if available
DATABASE_URL = "postgresql://postgres.cluntyvwwpxjpsymrrtk:Mansurbek988@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def update_admin():
    engine = create_engine(DATABASE_URL)
    
    new_phone = "998889884848"
    new_pass = "Grant2tatu"
    hashed_pass = pwd_context.hash(new_pass)
    
    with engine.connect() as conn:
        # Check if any admin exists
        result = conn.execute(text("SELECT id, phone_number FROM users WHERE role = 'ADMIN'"))
        admins = result.fetchall()
        
        if not admins:
            print("No admin user found in database!")
            return
            
        # Update the first admin found
        admin_id = admins[0][0]
        old_phone = admins[0][1]
        
        conn.execute(
            text("UPDATE users SET phone_number = :phone, hashed_password = :password WHERE id = :id"),
            {"phone": new_phone, "password": hashed_pass, "id": admin_id}
        )
        conn.commit()
        print(f"Admin ID {admin_id} updated successfully!")
        print(f"Old phone: {old_phone}")
        print(f"New phone: {new_phone}")
        print(f"New password: {new_pass}")

if __name__ == "__main__":
    update_admin()
