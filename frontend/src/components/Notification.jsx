import { useEffect } from "react";
import { TbCheck } from "react-icons/tb";
import "./Notification.css";

export default function Notification({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="notification-toast">
      <div className="notification-icon">
        <TbCheck />
      </div>
      <span className="notification-message">{message}</span>
    </div>
  );
}
