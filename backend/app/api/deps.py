from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from backend.app.core import security
from backend.app.core.config import settings
from backend.app.db.database import SessionLocal
from backend.app.schemas.token import TokenPayload
from backend.app.db import models

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> "models.User":
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    try:
        user_id = int(token_data.sub)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: sub must be an integer",
        )
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def check_role(roles: list[models.RoleEnum]):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        # Convert roles to strings for robust comparison
        role_values = [r.value if hasattr(r, 'value') else str(r) for r in roles]
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        
        if user_role not in role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Sizda ushbu amalni bajarish uchun huquq yo'q. Rolingiz: {user_role}",
            )
        return current_user
    return role_checker

get_admin = check_role([models.RoleEnum.ADMIN])
get_doctor = check_role([models.RoleEnum.DOCTOR])
get_any_staff = check_role([models.RoleEnum.ADMIN, models.RoleEnum.DOCTOR])
