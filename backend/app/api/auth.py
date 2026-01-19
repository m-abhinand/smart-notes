from fastapi import APIRouter, HTTPException
from app.schemas.auth import UserCreate, TokenOut
from app.db.mongodb import db
from app.core.security import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth")

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
