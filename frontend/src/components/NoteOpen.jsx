import { useEffect, useState } from "react";
import { TbX, TbDeviceFloppy } from "react-icons/tb";
import "./NoteOpen.css";

export default function NoteOpen({ note, onClose, onUpdate }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  if (!note) return null;

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Close on click outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(note.id, { title, content, tags: note.tags || [] });
    }
  };

  return (
    <div className="note-modal-overlay" onClick={handleOverlayClick}>
      <div className="note-modal-content" role="dialog" aria-modal="true">
        <div className="note-modal-header">
          <input 
            className="note-modal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
          />
          <div className="note-header-actions">
            <button 
              className="note-modal-save" 
              onClick={handleSave}
              aria-label="Save note"
            >
              <TbDeviceFloppy />
            </button>
            <button 
              className="note-modal-close" 
              onClick={onClose}
              aria-label="Close modal"
            >
              <TbX />
            </button>
          </div>
        </div>
        <div className="note-modal-body">
          <textarea 
            className="note-modal-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your note here..."
          />
        </div>
      </div>
    </div>
  );
}
