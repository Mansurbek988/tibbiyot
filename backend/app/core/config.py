from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartMed Queue"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE"  # In production, read from .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "smartmed_db"
    POSTGRES_PORT: str = "5432"
    DATABASE_URL: Optional[str] = None
    POSTGRES_URL: Optional[str] = None
    POSTGRES_URL_NON_POOLING: Optional[str] = None
    POSTGRES_PRISMA_URL: Optional[str] = None
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        import os
        # Prioritize env vars directly in case Pydantic didn't pick them up
        db_url = (
            os.getenv("POSTGRES_URL") or 
            os.getenv("POSTGRES_URL_NON_POOLING") or 
            os.getenv("DATABASE_URL") or 
            os.getenv("POSTGRES_PRISMA_URL") or
            self.POSTGRES_URL or 
            self.POSTGRES_URL_NON_POOLING or
            self.DATABASE_URL
        )
        
        if db_url:
            # Handle postgresql:// vs postgres://
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
            
            # Remove any trailing slash and add sslmode=require if needed
            url = db_url.split("?")[0]
            params = db_url.split("?")[1] if "?" in db_url else ""
            
            if "localhost" not in url and "127.0.0.1" not in url:
                if "sslmode=require" not in params:
                    separator = "&" if params else "?"
                    db_url = f"{url}{separator}{params}{'&' if params else ''}sslmode=require"
            
            return db_url
            
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
