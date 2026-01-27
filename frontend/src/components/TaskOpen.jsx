import { useEffect, useState } from "react";
import { TbX, TbDeviceFloppy, TbCalendar, TbFlag, TbCornerDownLeft } from "react-icons/tb";
import "./TaskOpen.css";

export default function TaskOpen({ task, onClose, onUpdate }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [completed, setCompleted] = useState(task?.completed || false);
  const [priority, setPriority] = useState(task?.priority || 2);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(task.due_date || "");
      setCompleted(task.completed || false);
      setPriority(task.priority || 2);
    }
  }, [task]);

  if (!task) return null;

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
      onUpdate(task.id, { 
        title, 
        description, 
        due_date: dueDate || null,
        completed,
        priority
      });
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
  }, [title, description, dueDate, completed, priority, task]);

  // Format date for datetime-local input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    // Convert to local datetime format YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      // Convert local datetime to ISO string
      const date = new Date(value);
      setDueDate(date.toISOString());
    } else {
      setDueDate("");
    }
  };

  return (
    <div className="task-modal-overlay" onClick={handleOverlayClick}>
      <div className="task-modal-content" role="dialog" aria-modal="true">
        <div className="task-modal-header">
          <input 
            className="task-modal-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Title"
          />
          <div className="task-header-actions">
            <span className="shortcut-hint">Ctrl + <TbCornerDownLeft /></span>
            <button 
              className="task-modal-save" 
              onClick={handleSave}
              aria-label="Save task"
              title="Save (Ctrl + Enter)"
            >
              <TbDeviceFloppy />
            </button>
            <button 
              className="task-modal-close" 
              onClick={onClose}
              aria-label="Close modal"
            >
              <TbX />
            </button>
          </div>
        </div>
        <div className="task-modal-body">
          <div className="task-modal-section">
            <label className="task-modal-label">Description</label>
            <textarea 
              className="task-modal-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows="6"
            />
          </div>
          
          <div className="task-modal-section">
            <label className="task-modal-label">
              <TbCalendar className="label-icon" />
              Due Date
            </label>
            <input
              type="datetime-local"
              className="task-modal-date-input"
              value={formatDateForInput(dueDate)}
              onChange={handleDateChange}
            />
          </div>

          <div className="task-modal-section">
            <label className="task-modal-label">
              <TbFlag className="label-icon" />
              Priority
            </label>
            <div className="priority-selector">
              <button
                type="button"
                className={`priority-btn priority-low ${priority === 1 ? 'active' : ''}`}
                onClick={() => setPriority(1)}
                aria-label="Low priority"
              >
                <TbFlag />
                <span>Low</span>
              </button>
              <button
                type="button"
                className={`priority-btn priority-medium ${priority === 2 ? 'active' : ''}`}
                onClick={() => setPriority(2)}
                aria-label="Medium priority"
              >
                <TbFlag />
                <span>Medium</span>
              </button>
              <button
                type="button"
                className={`priority-btn priority-high ${priority === 3 ? 'active' : ''}`}
                onClick={() => setPriority(3)}
                aria-label="High priority"
              >
                <TbFlag />
                <span>High</span>
              </button>
            </div>
          </div>

          <div className="task-modal-section">
            <label className="task-modal-checkbox-label">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="task-modal-checkbox"
              />
              <span>Mark as completed</span>
            </label>
          </div>

          <div className="task-meta-data">
            {task.created_at && <span>Created: {new Date(task.created_at).toLocaleString()}</span>}
            {task.updated_at && <span> • Updated: {new Date(task.updated_at).toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
