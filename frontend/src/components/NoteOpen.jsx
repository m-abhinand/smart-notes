import { useEffect } from "react";
import { TbX } from "react-icons/tb";
import "./NoteOpen.css";

export default function NoteOpen({ note, onClose }) {
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

  return (
    <div className="note-modal-overlay" onClick={handleOverlayClick}>
      <div className="note-modal-content" role="dialog" aria-modal="true">
        <div className="note-modal-header">
          <h2 className="note-modal-title">{note.title}</h2>
          <button 
            className="note-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <TbX />
          </button>
        </div>
        <div className="note-modal-body">
          {note.content}
        </div>
      </div>
    </div>
  );
}
