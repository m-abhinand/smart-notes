import { useState, useEffect } from "react";
import { TbX, TbCornerDownLeft } from "react-icons/tb";
import "./Pin.css";

export default function Pin({ mode, onSuccess, onCancel, token, isOpen }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && onCancel) onCancel();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onCancel]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setConfirmPin("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4-6 digits");
      setLoading(false);
      return;
    }

    if ((mode === "create" || mode === "update") && pin !== confirmPin) {
      setError("PINs do not match");
      setLoading(false);
      return;
    }

    try {
      const api = (await import("../api/client")).default;
      
      if (mode === "create" || mode === "update") {
        await api.post(`/auth/pin?token=${token}`, { pin });
        if (onSuccess) onSuccess();
      } else if (mode === "verify") {
        await api.post(`/auth/verify-pin?token=${token}`, { pin });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      if (mode === "verify") {
        setError("Invalid PIN");
      } else {
        setError("Failed to set PIN");
      }
      setPin("");
      setConfirmPin("");
    } finally {
      setLoading(false);
    }
  };

  const getMessage = () => {
    if (mode === "create") return "Create a 4-6 digit PIN";
    if (mode === "update") return "Update your PIN";
    return "Enter your PIN";
  };

  return (
    <div className="pin-modal-overlay" onClick={onCancel}>
      <div 
        className="pin-modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {onCancel && (
          <button className="pin-close-btn" onClick={onCancel} aria-label="Close">
            <TbX />
          </button>
        )}
        
        <p className="pin-message">{getMessage()}</p>
        
        <form className="pin-form" onSubmit={handleSubmit}>
          <input 
            type="password" 
            className="pin-input" 
            placeholder="Enter PIN"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            autoFocus
            disabled={loading}
          />
          
          {(mode === "create" || mode === "update") && (
            <input 
              type="password" 
              className="pin-input" 
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              disabled={loading}
            />
          )}
          
          {error && <div className="pin-error">{error}</div>}
          
          <button type="submit" className="pin-btn" disabled={loading}>
            <span>{loading ? "..." : mode === "verify" ? "Unlock" : "Set PIN"}</span>
            <TbCornerDownLeft className="pin-btn-icon" />
          </button>
        </form>
      </div>
    </div>
  );
}
