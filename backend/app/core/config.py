from pydantic_settings import BaseSettings

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
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        db_url = self.DATABASE_URL or self.POSTGRES_URL
        if db_url:
            # Handle postgresql:// vs postgres://
            url = db_url.replace("postgres://", "postgresql://", 1)
            # Add sslmode=require if not present and not localhost
            if "localhost" not in url and "127.0.0.1" not in url and "sslmode" not in url:
                separator = "&" if "?" in url else "?"
                url += f"{separator}sslmode=require"
            return url
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
