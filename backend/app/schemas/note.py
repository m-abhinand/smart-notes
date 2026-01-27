from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
class NoteCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    is_favorite: bool = False
    is_locked: bool = False
    is_archived: bool = False
    color: str = "default"

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None
    is_locked: Optional[bool] = None
    is_archived: Optional[bool] = None
    color: Optional[str] = None
    is_deleted: Optional[bool] = None

class NoteOut(BaseModel):
    id: str
    title: str
    content: str
    tags: List[str]
    is_favorite: bool = False
    is_locked: bool = False
    is_archived: bool = False
    color: str = "default"
    created_at: datetime
    updated_at: datetime