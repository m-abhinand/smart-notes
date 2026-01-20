import { useEffect, useState } from "react";
import { TbCheck } from "react-icons/tb";
import "./Notification.css";

export default function Notification({ message, onClose, duration = 2000 }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (message) {
      setIsClosing(false);
      const timer = setTimeout(() => {
        setIsClosing(true);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300); // 300ms matches animation duration
      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  if (!message) return null;

  return (
    <div className={`notification-toast ${isClosing ? "closing" : ""}`}>
      <div className="notification-icon">
        <TbCheck />
      </div>
      <span className="notification-message">{message}</span>
    </div>
  );
}
