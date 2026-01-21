from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    due_date: Optional[datetime]
    completed: Optional[bool]

class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    completed: bool
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
