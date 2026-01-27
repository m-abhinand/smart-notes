from datetime import datetime
from bson import ObjectId
from app.db.mongodb import db


# ----------------------------
# CREATE NOTE
# ----------------------------
async def create_note(user_id: str, data):
    note = {
        "user_id": ObjectId(user_id),
        "title": data.title,
        "content": data.content,
        "tags": data.tags,
        "is_favorite": getattr(data, "is_favorite", False),
        "is_locked": getattr(data, "is_locked", False),
        "is_archived": getattr(data, "is_archived", False),
        "color": getattr(data, "color", "default"),
        "is_deleted": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "summary": None
    }

    result = await db.notes.insert_one(note)
    note["_id"] = result.inserted_id
    return serialize_note(note)


# ----------------------------
# LIST NOTES
# ----------------------------
async def list_notes(user_id: str, search: str = None, sort_by: str = "newest", locked: bool = False):
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
            {"content": {"$regex": search, "$options": "i"}}
        ]

    sort_param = [("updated_at", -1)]
    if sort_by == "oldest":
        sort_param = [("updated_at", 1)]
    elif sort_by == "az":
        sort_param = [("title", 1)]
    elif sort_by == "za":
        sort_param = [("title", -1)]

    cursor = db.notes.find(query).sort(sort_param)

    return [serialize_note(note) async for note in cursor]


# ----------------------------
# UPDATE NOTE + VERSIONING
# ----------------------------
async def update_note(note_id: str, user_id: str, data):
    note = await db.notes.find_one(
        {
            "_id": ObjectId(note_id),
            "user_id": ObjectId(user_id),
            "is_deleted": False
        }
    )

    if not note:
        return False

    # Save old version
    version_count = await db.note_versions.count_documents(
        {"note_id": ObjectId(note_id)}
    )

    await db.note_versions.insert_one(
        {
            "note_id": ObjectId(note_id),
            "content": note["content"],
            "version": version_count + 1,
            "created_at": datetime.utcnow()
        }
    )

    # Update note
    # Update note
    update_fields = data.dict(exclude_unset=True)
    update_fields["updated_at"] = datetime.utcnow()
    update_fields["summary"] = None # invalidate AI summary

    await db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": update_fields}
    )

    return True


# ----------------------------
# GET NOTE VERSIONS
# ----------------------------
async def get_versions(note_id: str, user_id: str):
    note = await db.notes.find_one(
        {
            "_id": ObjectId(note_id),
            "user_id": ObjectId(user_id)
        }
    )

    if not note:
        return []

    cursor = db.note_versions.find(
        {"note_id": ObjectId(note_id)}
    ).sort("version", -1)

    versions = []
    async for v in cursor:
        versions.append(
            {
                "id": str(v["_id"]),
                "version": v["version"],
                "content": v["content"],
                "created_at": v["created_at"]
            }
        )

    return versions


# ----------------------------
# FULL-TEXT SEARCH
# ----------------------------
async def search_notes(user_id: str, query: str):
    cursor = db.notes.find(
        {
            "$text": {"$search": query},
            "user_id": ObjectId(user_id),
            "is_deleted": False
        },
        {
            "score": {"$meta": "textScore"}
        }
    ).sort([("score", {"$meta": "textScore"})])

    return [serialize_note(note) async for note in cursor]


# ----------------------------
# SERIALIZER
# ----------------------------
def serialize_note(note):
    return {
        "id": str(note["_id"]),
        "title": note["title"],
        "content": note["content"],
        "tags": note.get("tags", []),
        "is_favorite": note.get("is_favorite", False),
        "is_locked": note.get("is_locked", False),
        "is_archived": note.get("is_archived", False),
        "color": note.get("color", "default"),
        "created_at": note["created_at"],
        "updated_at": note["updated_at"]
    }
