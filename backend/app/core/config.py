from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    MONGO_URI: str = Field(...)
    MONGO_DB: str = "smart-notes"
    JWT_SECRET: str = Field(...)
    JWT_ALGORITHM: str = "HS256"
    AI_ENABLED: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
