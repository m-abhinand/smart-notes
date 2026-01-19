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
async def list_notes(user_id: str):
    cursor = db.notes.find(
        {
            "user_id": ObjectId(user_id),
            "is_deleted": False
        }
    ).sort("updated_at", -1)

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
    await db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {
            "$set": {
                "title": data.title,
                "content": data.content,
                "tags": data.tags,
                "updated_at": datetime.utcnow(),
                "summary": None  # invalidate AI summary
            }
        }
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
        "created_at": note["created_at"],
        "updated_at": note["updated_at"]
    }
