import { useState, useEffect } from "react";
import { TbX, TbDeviceFloppy, TbCornerDownLeft } from "react-icons/tb";
import "./newNote.css";

export default function NewNote({ onClose, onCreate, isOpen, onOpen }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  const isControlled = isOpen !== undefined;
  const isExpanded = isControlled ? isOpen : internalExpanded;

  const handleOpen = () => {
    if (isControlled) onOpen && onOpen();
    else setInternalExpanded(true);
  };

  const handleClose = () => {
    if (isControlled) onClose && onClose();
    else {
      setInternalExpanded(false);
      onClose && onClose();
    }
  };

  const handleCreate = () => {
    // Treat empty title as valid by generating a default one
    let finalTitle = title.trim();
    if (!finalTitle) {
      finalTitle = `Note - ${new Date().toLocaleString()}`;
    }

    if (finalTitle || content.trim()) {
      onCreate({ title: finalTitle, content: content.trim() });
      setTitle("");
      setContent("");
      handleClose();
    }
  };

  // Shortcut Ctrl + Enter to save, Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isExpanded) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCreate();
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, title, content]); // Dependencies for state

  return (
    <div 
      className={`new-note-container ${isExpanded ? "expanded" : ""}`}
      onClick={(e) => {
        if (isExpanded && e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {!isExpanded ? (
        <div className="new-note-trigger" onClick={handleOpen}>
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
              <span className="shortcut-hint">Ctrl + <TbCornerDownLeft /></span>
              <button 
                className="note-modal-save" 
                onClick={handleCreate}
                aria-label="Create note"
                title="Save (Ctrl + Enter)"
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
