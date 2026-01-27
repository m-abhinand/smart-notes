from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: Optional[datetime] = None
    priority: int = Field(default=2, ge=1, le=3)
    is_locked: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    due_date: Optional[datetime]
    completed: Optional[bool]
    priority: Optional[int] = Field(default=None, ge=1, le=3)
    is_locked: Optional[bool] = None

class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    completed: bool
    due_date: Optional[datetime]
    priority: int = 2
    is_locked: bool = False
    created_at: datetime
    updated_at: datetime
