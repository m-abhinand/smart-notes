import { useState, useEffect } from "react";
import { TbX, TbDeviceFloppy, TbCalendar } from "react-icons/tb";
import "./NewTask.css";

export default function NewTask({ onCreate }) {
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [dueTime, setDueTime] = useState("09:00");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTitle("");
    setDueDate(today);
    setDueTime("09:00");
  };

  const setTomorrow = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    setDueDate(t.toISOString().slice(0, 10));
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    const dueISO = new Date(`${dueDate}T${dueTime}`).toISOString();

    setLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        due_date: dueISO,
      });
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
          <span className="trigger-text">Add a task…</span>
        </div>
      ) : (
        <div className="new-task-card compact">
          {/* HEADER */}
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
              >
                <TbDeviceFloppy />
              </button>
              <button
                className="task-close"
                onClick={() => {
                  reset();
                  setIsExpanded(false);
                }}
              >
                <TbX />
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div className="task-footer compact">
            <div className="date-time-group">
              <TbCalendar className="calendar-icon" />

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>

            <div className="quick-dates">
              <button onClick={() => setDueDate(today)}>Today</button>
              <button onClick={setTomorrow}>Tomorrow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
