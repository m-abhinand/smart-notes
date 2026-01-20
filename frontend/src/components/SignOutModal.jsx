import { useEffect } from "react";
import "./SignOutModal.css";

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="signout-modal-overlay" onClick={onClose}>
      <div 
        className="signout-modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog" 
        aria-modal="true"
      >
        <h3 className="signout-title">Sign Out?</h3>
        <p className="signout-message">Are you sure you want to sign out of your account?</p>
        
        <div className="signout-actions">
          <button className="signout-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="signout-btn-confirm" onClick={onConfirm}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
