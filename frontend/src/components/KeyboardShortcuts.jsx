import { useEffect } from "react";
import { TbKeyboard, TbX } from "react-icons/tb";
import "./KeyboardShortcuts.css";

export default function KeyboardShortcuts({ onClose }) {
  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="shortcuts-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="shortcuts-modal-content">
        <div className="shortcuts-header">
          <div className="header-title">
            <TbKeyboard className="header-icon" />
            <h3>Keyboard Shortcuts</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <TbX />
          </button>
        </div>
        
        <div className="shortcuts-list">
          <div className="shortcut-group">
            <h4>Global</h4>
            <div className="shortcut-item">
              <span className="sc-label">New Note</span>
              <kbd>Alt</kbd> + <kbd>N</kbd>
            </div>
            <div className="shortcut-item">
              <span className="sc-label">New Task</span>
              <kbd>Alt</kbd> + <kbd>T</kbd>
            </div>
            <div className="shortcut-item">
              <span className="sc-label">Search</span>
              <kbd>/</kbd>
            </div>
          </div>

          <div className="shortcut-group">
            <h4>Editing & Creation</h4>
            <div className="shortcut-item">
              <span className="sc-label">Save Note / Task</span>
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
            </div>
            <div className="shortcut-item">
              <span className="sc-label">Close Modal</span>
              <kbd>Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
