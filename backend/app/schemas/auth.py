from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

class TokenOut(BaseModel):
    access_token: str