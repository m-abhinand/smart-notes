from passlib.context import CryptContext
from jose import jwt 
from app.core.config import settings
from datetime import datetime, timedelta

pwd_context=CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str,hash: str) -> bool:
    return pwd_context.verify(password,hash)

def create_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    return jwt.encode(payload, settings.JWT_SECRET, settings.JWT_ALGORITHM)