from pydantic import BaseModel
from typing import List
from datetime import datetime
class NoteCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []

class NoteOut(BaseModel):
    id: str
    title: str
    content: str
    tags: List[str]
    created_at: datetime