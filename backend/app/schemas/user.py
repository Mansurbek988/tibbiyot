from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from backend.app.db.models import RoleEnum

# Shared properties
class UserBase(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[RoleEnum] = RoleEnum.PATIENT

# Properties to receive via API on creation
class UserCreate(UserBase):
    full_name: str
    phone_number: str
    password: str = Field(..., max_length=72)

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    password_hash: str
