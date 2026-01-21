import { useState } from "react";
import { TbX, TbDeviceFloppy } from "react-icons/tb";
import "./NewTask.css";

export default function NewTask({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
    };
    setLoading(true);
    try {
      await onCreate(payload);
      reset();
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`new-task-container ${isExpanded ? "expanded" : ""}`}>
      {!isExpanded ? (
        <div className="new-task-trigger" onClick={() => setIsExpanded(true)}>
          <span className="trigger-text"> Add a task...</span>
        </div>
      ) : (
        <div className="new-task-card">
          <div className="task-modal-header">
            <input
              className="task-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
            <div className="task-header-actions">
              <button
                className="task-save"
                onClick={handleCreate}
                disabled={loading}
                aria-label="Create task"
              >
                <TbDeviceFloppy />
              </button>
              <button
                className="task-close"
                onClick={() => {
                  reset();
                  setIsExpanded(false);
                }}
                aria-label="Close"
              >
                <TbX />
              </button>
            </div>
          </div>

          <div className="task-modal-body">
            <textarea
              className="task-desc-input"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="task-footer">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
