import React from "react";
import { TbTrash, TbCalendar } from "react-icons/tb";
import "./TaskCard.css";

function getTimeLeft(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return null;
  const now = new Date();
  const diff = due - now;
  if (diff <= 0) return "Overdue";

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) return `${days}d ${hours}h left`;
  return `${totalHours}h left`;
}

export default function TaskCard({ task, onToggle, onDelete, onOpen }) {
  if (!task) return null;

  const handleCardClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    onOpen && onOpen();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  const timeLeft = getTimeLeft(task.due_date);

  return (
    <div
      className={`task-card ${task.completed ? "completed" : ""}`}
      title={task.title}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-pressed={!!task.completed}
    >
      {/* LEFT — native checkbox for reliability */}
      <div className="task-left">
        <input
          type="checkbox"
          checked={!!task.completed}
          onChange={(e) => {
            e.stopPropagation();
            onToggle && onToggle();
          }}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        />
      </div>

      {/* BODY */}
      <div className="task-body">
        <div className="task-title">{task.title}</div>

        {task.description && <div className="task-desc">{task.description}</div>}

        {task.due_date && (
          <div className="task-meta">
            <div className="task-due">
              <TbCalendar />
              <span>
                {new Date(task.due_date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {timeLeft && (
              <div
                className={`task-timer ${
                  timeLeft === "Overdue" ? "overdue" : ""
                }`}
              >
                {timeLeft}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="task-actions">
        <button
          className="task-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
          aria-label="Delete task"
        >
          <TbTrash />
        </button>
      </div>
    </div>
  );
}
