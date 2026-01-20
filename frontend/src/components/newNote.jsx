import { useState } from "react";
import { TbX, TbDeviceFloppy } from "react-icons/tb";
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
      setIsExpanded(false);
      // No delay needed for direct close with this design
      onClose(); 
    }
  };

  const handleClickInitial = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    onClose();
  };

  return (
    <div className={`new-note-container ${isExpanded ? "expanded" : ""}`}>
      {!isExpanded ? (
        <div className="new-note-trigger" onClick={handleClickInitial}>
          <span className="trigger-text">What's on your mind?</span>
        </div>
      ) : (
        <div className="new-note-card">
          <div className="note-modal-header">
            <input 
              className="note-modal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give it a title..."
            />
            <div className="note-header-actions">
              <button 
                className="note-modal-save" 
                onClick={handleCreate}
                aria-label="Create note"
              >
                <TbDeviceFloppy />
              </button>
              <button 
                className="note-modal-close" 
                onClick={handleClose}
                aria-label="Close"
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
              placeholder="Start writing..."
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}
