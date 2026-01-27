from datetime import datetime
from bson import ObjectId
from app.db.mongodb import db


# ----------------------------
# CREATE TASK
# ----------------------------
async def create_task(user_id: str, data):
    task = {
        "user_id": ObjectId(user_id),
        "title": data.title,
        "description": getattr(data, "description", "") or "",
        "completed": False,
        "due_date": getattr(data, "due_date", None),
        "priority": data.priority,
        "is_locked": getattr(data, "is_locked", False),
        "is_deleted": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.tasks.insert_one(task)
    task["_id"] = result.inserted_id
    return serialize_task(task)


# ----------------------------
# LIST TASKS (search, completed filter, sort)
# ----------------------------
async def list_tasks(user_id: str, search: str = None, completed: bool = None, sort_by: str = "newest", locked: bool = False):
    query = {
        "user_id": ObjectId(user_id),
        "is_deleted": False
    }

    if locked:
        query["is_locked"] = True
    else:
        query["is_locked"] = {"$ne": True}

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    if completed is not None:
        query["completed"] = bool(completed)

    sort_param = [("updated_at", -1)]
    if sort_by == "oldest":
        sort_param = [("updated_at", 1)]
    elif sort_by == "due":
        sort_param = [("due_date", 1)]
    elif sort_by == "az":
        sort_param = [("title", 1)]
    elif sort_by == "za":
        sort_param = [("title", -1)]
    elif sort_by == "priority":
        sort_param = [("priority", -1), ("updated_at", -1)]

    cursor = db.tasks.find(query).sort(sort_param)
    return [serialize_task(task) async for task in cursor]


# ----------------------------
# GET SINGLE TASK
# ----------------------------
async def get_task(task_id: str, user_id: str):
    task = await db.tasks.find_one(
        {"_id": ObjectId(task_id), "user_id": ObjectId(user_id), "is_deleted": False}
    )
    if not task:
        return None
    return serialize_task(task)


# ----------------------------
# UPDATE TASK
# ----------------------------
async def update_task(task_id: str, user_id: str, data):
    task = await db.tasks.find_one(
        {"_id": ObjectId(task_id), "user_id": ObjectId(user_id), "is_deleted": False}
    )
    if not task:
        return False

    updates = data.dict(exclude_unset=True)
    if updates:
        updates["updated_at"] = datetime.utcnow()
        await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": updates})
    return True


# ----------------------------
# SOFT DELETE TASK
# ----------------------------
async def delete_task(task_id: str, user_id: str):
    result = await db.tasks.update_one(
        {"_id": ObjectId(task_id), "user_id": ObjectId(user_id), "is_deleted": False},
        {"$set": {"is_deleted": True, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0


# ----------------------------
# TOGGLE COMPLETION
# ----------------------------
async def toggle_task_complete(task_id: str, user_id: str, completed: bool):
    result = await db.tasks.update_one(
        {"_id": ObjectId(task_id), "user_id": ObjectId(user_id), "is_deleted": False},
        {"$set": {"completed": bool(completed), "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0


# ----------------------------
# SERIALIZER
# ----------------------------
def serialize_task(task):
    return {
        "id": str(task["_id"]),
        "title": task.get("title", ""),
        "description": task.get("description", ""),
        "completed": task.get("completed", False),
        "due_date": task.get("due_date"),
        "priority": task.get("priority", 2),
        "is_locked": task.get("is_locked", False),
        "created_at": task.get("created_at"),
        "updated_at": task.get("updated_at"),
    }