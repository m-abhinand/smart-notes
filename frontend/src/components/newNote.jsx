import { useState } from "react";
import "./newNote.css";

export default function NewNote({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = () => {
    if (title.trim() && content.trim()) {
      onCreate({ title, content });
      setTitle("");
      setContent("");
      onClose();
    }
  };

  return (
    <div className="new-note-overlay">
      <div className="new-note-popup">
        <h2>Create Note</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="new-note-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="create-button" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
