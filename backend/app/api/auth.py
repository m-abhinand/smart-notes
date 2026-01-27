from fastapi import APIRouter, HTTPException, Query
from app.schemas.auth import UserCreate, TokenOut
from app.db.mongodb import db
from app.core.security import hash_password, verify_password, create_token
from pydantic import BaseModel
from jose import jwt, JWTError
from app.core.config import settings
from bson import ObjectId

router = APIRouter(prefix="/auth")

class PinCreate(BaseModel):
    pin: str

def get_user(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
async def register(data: UserCreate):
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(400, "User exists")

    user = {
        "email": data.email,
        "password": hash_password(data.password)
    }
    await db.users.insert_one(user)
    return {"msg": "registered"}

@router.post("/login", response_model=TokenOut)
async def login(data: UserCreate):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_token(str(user["_id"]))
    return {"access_token": token}

@router.get("/status")
async def status(token: str = Query(...)):
    user_id = get_user(token)
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(404, "User not found")
    return {"has_pin": "pin" in user and user["pin"] is not None}

@router.post("/pin")
async def set_pin(data: PinCreate, token: str = Query(...)):
    user_id = get_user(token)
    # Security: In real app, require password to set/change PIN.
    hashed = hash_password(data.pin)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"pin": hashed}})
    return {"msg": "PIN set"}

@router.post("/verify-pin")
async def verify_pin_endpoint(data: PinCreate, token: str = Query(...)):
    user_id = get_user(token)
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user or "pin" not in user:
        raise HTTPException(400, "PIN not set")
    
    if not verify_password(data.pin, user["pin"]):
         raise HTTPException(401, "Invalid PIN")
    
    return {"valid": True}
