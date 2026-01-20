import { useState } from "react";
import "./newNote.css";

export default function NewNote({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreate = () => {
    if (title.trim() && content.trim()) {
      onCreate({ title, content });
      setTitle("");
      setContent("");
      // Trigger closing animation
      setIsExpanded(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }
  };

  const handleClickInitial = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`new-note-container ${isExpanded ? "expanded" : ""}`}>
      {!isExpanded ? (
        <div className="new-note-trigger" onClick={handleClickInitial}>
          <span className="trigger-text">What's on your mind?</span>
        </div>
      ) : (
        <div className="new-note-card">
          <input
            type="text"
            className="note-title-input"
            placeholder="Add a title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <textarea
            className="note-content-input"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />

          <div className="note-actions">
            <button className="note-btn-close" onClick={handleClose}>
              Cancel
            </button>
            <button className="note-btn-create" onClick={handleCreate}>
              Create Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
