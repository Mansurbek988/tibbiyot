from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
import bcrypt
from backend.app.core.config import settings

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        # Bcrypt requires bytes
        password_bytes = plain_password.encode("utf-8")
        # Safety: bcrypt only uses first 72 bytes anyway
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
            
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"ERROR in verify_password: {e}")
        return False

def get_password_hash(password: str) -> str:
    if not password:
        return ""
    
    # Bcrypt requires bytes
    password_bytes = password.encode("utf-8")
    
    # Bcrypt has a strict 72-byte limit. We truncate to be safe.
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string for database storage
    return hashed.decode("utf-8")
