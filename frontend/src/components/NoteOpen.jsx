import { useEffect, useState } from "react";
import { TbX, TbDeviceFloppy, TbCornerDownLeft, TbStar, TbTrash, TbLock, TbShare, TbPalette, TbStarFilled, TbLockOpen, TbArchive } from "react-icons/tb";
import "./NoteOpen.css";

export default function NoteOpen({ note, onClose, onUpdate }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [color, setColor] = useState(note?.color || "default");
  const [isFavorite, setIsFavorite] = useState(note?.is_favorite || false);
  const [isLocked, setIsLocked] = useState(note?.is_locked || false);
  const [isArchived, setIsArchived] = useState(note?.is_archived || false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color || "default");
      setIsFavorite(note.is_favorite || false);
      setIsLocked(note.is_locked || false);
      setIsArchived(note.is_archived || false);
    }
  }, [note]);

  if (!note) return null;

  const colors = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'];

  // ... (Esc/Overlay handlers same) ...
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
    if (e.target === e.currentTarget || e.target.classList.contains('note-modal-container')) {
      onClose();
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(note.id, { 
        title, 
        content, 
        tags: note.tags || [], 
        color,
        is_favorite: isFavorite,
        is_locked: isLocked,
        is_archived: isArchived
      });
    }
  };

  /* Helper to update single field and save */
  const updateField = (field, value) => {
    // Update local state immediately for UI response
    switch(field) {
      case 'is_favorite': setIsFavorite(value); break;
      case 'is_locked': setIsLocked(value); break;
      case 'is_archived': setIsArchived(value); break;
      case 'color': setColor(value); break;
      // no default
    }
    
    // Call API
    if (onUpdate) {
      // We pass only the changed field for partial update
      onUpdate(note.id, { [field]: value });
    }
  };

  const handleColorSelect = (c) => {
    updateField('color', c);
    setShowColorPicker(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
       if (onUpdate) {
         onUpdate(note.id, { is_deleted: true });
       }
       onClose();
    }
  };

  // Shortcut Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, note, color, isFavorite, isLocked, isArchived]);

  return (
    <div className="note-modal-overlay" onClick={handleOverlayClick}>
      <div className="note-modal-container">
        {/* ACTION STRIP - Paper Behind */}
        <div className="note-action-strip">
           <button 
             className={`action-btn ${isFavorite ? 'active' : ''}`} 
             title="Favorite"
             onClick={(e) => { e.stopPropagation(); updateField('is_favorite', !isFavorite); }}
           >
             {isFavorite ? <TbStarFilled style={{ color: '#fbc02d' }} /> : <TbStar />}
           </button>
           <button 
             className={`action-btn ${isLocked ? 'active' : ''}`} 
             title={isLocked ? "Unlock" : "Lock"}
             onClick={(e) => { e.stopPropagation(); updateField('is_locked', !isLocked); }}
           >
             {isLocked ? <TbLock style={{ color: '#ef5350' }} /> : <TbLockOpen />}
           </button>
           
           <div style={{ position: 'relative' }}>
             <button 
               className="action-btn" 
               title="Change Color"
               onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
             >
               <TbPalette />
             </button>
             <div 
               className={`color-picker-popover ${showColorPicker ? 'open' : ''}`}
               onClick={(e) => e.stopPropagation()}
             >
               {colors.map(c => (
                 <div 
                   key={c}
                   className={`color-option ${c} ${color === c ? 'selected' : ''}`}
                   onClick={() => handleColorSelect(c)}
                   title={c.charAt(0).toUpperCase() + c.slice(1)}
                 />
               ))}
             </div>
           </div>

           <button 
             className={`action-btn ${isArchived ? 'active' : ''}`} 
             title="Archive"
             onClick={(e) => { e.stopPropagation(); updateField('is_archived', !isArchived); }}
           >
             <TbArchive />
           </button>
           <div className="action-divider"></div>
           <button 
             className="action-btn delete" 
             title="Delete"
             onClick={handleDelete}
           >
             <TbTrash />
           </button>
        </div>

        <div className={`note-modal-content ${color}`} role="dialog" aria-modal="true">
          <div className="note-modal-header">
            <input 
              className="note-modal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
            />
            <div className="note-header-actions">
              <span className="shortcut-hint">Ctrl + <TbCornerDownLeft /></span>
              <button 
                className="note-modal-save" 
                onClick={handleSave}
                aria-label="Save note"
                title="Save (Ctrl + Enter)"
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
            <div className="note-meta-data">
              {note.created_at && <span>Created: {new Date(note.created_at).toLocaleString()}</span>}
              {note.updated_at && <span> • Updated: {new Date(note.updated_at).toLocaleString()}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
