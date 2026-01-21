from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Optional
from jose import jwt, JWTError
from app.core.config import settings
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.services.task_services import (
    create_task,
    list_tasks,
    get_task,
    update_task,
    delete_task,
    toggle_task_complete
)

router = APIRouter(prefix="/tasks")


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


@router.post("/", response_model=TaskOut)
async def create(data: TaskCreate, token: str = Query(...)):
    return await create_task(get_user(token), data)


@router.get("/", response_model=List[TaskOut])
async def list_all(
    token: str = Query(...),
    search: Optional[str] = Query(None),
    completed: Optional[bool] = Query(None),
    sort: str = Query("newest")
):
    return await list_tasks(get_user(token), search, completed, sort)


@router.get("/{task_id}", response_model=TaskOut)
async def get_one(task_id: str = Path(...), token: str = Query(...)):
    task = await get_task(task_id, get_user(token))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}")
async def update(task_id: str, data: TaskUpdate, token: str = Query(...)):
    ok = await update_task(task_id, get_user(token), data)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task updated"}


@router.delete("/{task_id}")
async def remove(task_id: str, token: str = Query(...)):
    ok = await delete_task(task_id, get_user(token))
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}


@router.patch("/{task_id}/complete")
async def set_complete(task_id: str, completed: bool = Query(...), token: str = Query(...)):
    ok = await toggle_task_complete(task_id, get_user(token), completed)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task updated"}
