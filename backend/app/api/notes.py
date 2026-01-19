from fastapi import APIRouter, HTTPException, Query
from jose import jwt, JWTError
from app.core.config import settings
from app.schemas.note import NoteCreate
from app.services.note_services import (
    create_note,
    list_notes,
    update_note,
    get_versions,
    search_notes
)

router = APIRouter(prefix="/notes")

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

@router.post("/")
async def create(data: NoteCreate, token: str = Query(...)):
    return await create_note(get_user(token), data)

@router.get("/")
async def list_all(token: str = Query(...)):
    return await list_notes(get_user(token))
